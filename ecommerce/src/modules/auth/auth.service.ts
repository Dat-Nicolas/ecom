import * as crypto from 'crypto';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { KafkaService, KafkaTopic } from '../../config/kafka/kafka.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

type LoginAttemptState = {
  failedAttempts: number;
  lockedUntil: number;
};

type VerifiedRefreshPayload = {
  sub: string;
  jti: string;
  familyId: string;
  type: 'refresh';
};

type TokenPairResult = {
  accessToken: string;
  refreshToken: string;
  refreshTokenJti: string;
  familyId: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly failedLoginsByEmail = new Map<string, LoginAttemptState>();
  private readonly saltRounds: number;
  private readonly maxFailedAttempts: number;
  private readonly lockWindowMs: number;
  private readonly dummyPasswordHash: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private kafkaService: KafkaService,
  ) {
    this.saltRounds = this.clampNumber(
      Number(this.configService.get('BCRYPT_ROUNDS', 12)),
      12,
      10,
      14,
    );

    this.maxFailedAttempts = this.clampNumber(
      Number(this.configService.get('AUTH_MAX_FAILED_ATTEMPTS', 5)),
      5,
      3,
      20,
    );

    this.lockWindowMs = this.clampNumber(
      Number(this.configService.get('AUTH_LOCK_WINDOW_MS', 15 * 60 * 1000)),
      15 * 60 * 1000,
      60_000,
      24 * 60 * 60 * 1000,
    );

    this.dummyPasswordHash = bcrypt.hashSync('DummyPassword@123456789', this.saltRounds);
  }

  async register(dto: RegisterDto) {
    if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const email = this.normalizeEmail(dto.email);
    const fullName = dto.fullName.trim().replace(/\s+/g, ' ');
    const phone = dto.phone?.trim() || null;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const customerRole = await this.prisma.role.findUnique({ where: { slug: 'customer' } });
    if (!customerRole) throw new NotFoundException('Default role not found');

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        roleId: customerRole.id,
        email,
        phone,
        passwordHash,
        fullName,
      },
      include: { role: true },
    });

    // await this.kafkaService.emit(KafkaTopic.USER_REGISTERED, {
    //   id: user.id,
    //   email: user.email,
    //   fullName: user.fullName,
    // });

    const tokens = await this.issueNewTokenPair(user);
    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    this.ensureAccountNotLocked(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    const hashForCompare = user?.passwordHash || this.dummyPasswordHash;
    const validPassword = await bcrypt.compare(dto.password, hashForCompare);

    if (!user || user.status !== 'active' || !validPassword) {
      this.markLoginFailure(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.clearLoginFailure(email);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.issueNewTokenPair(user);
    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const incomingTokenHash = this.hashRefreshToken(refreshToken);

    return this.prisma.$transaction(async (tx) => {
      const existingToken = await tx.refreshToken.findUnique({
        where: { jti: payload.jti },
      });

      if (
        !existingToken ||
        existingToken.userId !== payload.sub ||
        existingToken.familyId !== payload.familyId
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (existingToken.revokedAt) {
        await this.revokeFamilyTokens(tx, existingToken.userId, existingToken.familyId);
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (existingToken.expiresAt <= new Date()) {
        await tx.refreshToken.update({
          where: { jti: existingToken.jti },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!this.safeHashEquals(existingToken.tokenHash, incomingTokenHash)) {
        await this.revokeFamilyTokens(tx, existingToken.userId, existingToken.familyId);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await tx.user.findUnique({
        where: { id: existingToken.userId },
        include: { role: true },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const nextTokens = await this.issueNewTokenPair(user, tx, existingToken.familyId);

      await tx.refreshToken.update({
        where: { jti: existingToken.jti },
        data: {
          revokedAt: new Date(),
          replacedByTokenId: nextTokens.refreshTokenJti,
        },
      });

      return {
        accessToken: nextTokens.accessToken,
        refreshToken: nextTokens.refreshToken,
      };
    });
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      await this.prisma.refreshToken.updateMany({
        where: {
          userId: payload.sub,
          jti: payload.jti,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Keep logout idempotent and avoid leaking token validity.
    }

    return { message: 'Logged out successfully' };
  }

  private async issueNewTokenPair(
    user: { id: string; email: string; role: { slug: string } },
    prismaClient?: Prisma.TransactionClient,
    familyId?: string,
  ): Promise<TokenPairResult> {
    const refreshTokenJti = crypto.randomUUID();
    const tokenFamilyId = familyId || crypto.randomUUID();

    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.slug,
      type: 'access',
    };

    const refreshPayload = {
      sub: user.id,
      role: user.role.slug,
      type: 'refresh',
      jti: refreshTokenJti,
      familyId: tokenFamilyId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    const refreshTokenExpiresAt = this.extractTokenExpiry(refreshToken);
    const tokenHash = this.hashRefreshToken(refreshToken);
    const tx = prismaClient || this.prisma;

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        jti: refreshTokenJti,
        familyId: tokenFamilyId,
        tokenHash,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenJti,
      familyId: tokenFamilyId,
    };
  }

  private verifyRefreshToken(refreshToken: string): VerifiedRefreshPayload {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }) as Partial<VerifiedRefreshPayload>;

      if (
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.jti !== 'string' ||
        typeof payload.familyId !== 'string'
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload as VerifiedRefreshPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private extractTokenExpiry(token: string): Date {
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded === 'string' || typeof decoded.exp !== 'number') {
      throw new UnauthorizedException('Failed to issue refresh token');
    }

    return new Date(decoded.exp * 1000);
  }

  private async revokeFamilyTokens(
    tx: Prisma.TransactionClient,
    userId: string,
    familyId: string,
  ): Promise<void> {
    await tx.refreshToken.updateMany({
      where: {
        userId,
        familyId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  private hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private safeHashEquals(leftHash: string, rightHash: string): boolean {
    try {
      const left = Buffer.from(leftHash, 'hex');
      const right = Buffer.from(rightHash, 'hex');

      if (left.length !== right.length) {
        return false;
      }

      return crypto.timingSafeEqual(left, right);
    } catch {
      return false;
    }
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private ensureAccountNotLocked(email: string) {
    const state = this.getLoginAttemptState(email);
    if (state.lockedUntil > Date.now()) {
      const retryAfterSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      throw new HttpException(
        `Too many failed login attempts. Please try again in ${retryAfterSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private markLoginFailure(email: string) {
    const state = this.getLoginAttemptState(email);
    const failedAttempts = state.failedAttempts + 1;

    if (failedAttempts >= this.maxFailedAttempts) {
      const lockedUntil = Date.now() + this.lockWindowMs;
      this.failedLoginsByEmail.set(email, { failedAttempts: 0, lockedUntil });
      this.logger.warn(`Temporarily locked login for ${email} until ${new Date(lockedUntil).toISOString()}`);
      return;
    }

    this.failedLoginsByEmail.set(email, {
      failedAttempts,
      lockedUntil: 0,
    });
  }

  private clearLoginFailure(email: string) {
    this.failedLoginsByEmail.delete(email);
  }

  private getLoginAttemptState(email: string): LoginAttemptState {
    const state = this.failedLoginsByEmail.get(email);
    if (!state) {
      return { failedAttempts: 0, lockedUntil: 0 };
    }

    if (state.lockedUntil > 0 && state.lockedUntil <= Date.now()) {
      this.failedLoginsByEmail.delete(email);
      return { failedAttempts: 0, lockedUntil: 0 };
    }

    return state;
  }

  private clampNumber(value: number, fallback: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(Math.max(Math.trunc(value), min), max);
  }
}
