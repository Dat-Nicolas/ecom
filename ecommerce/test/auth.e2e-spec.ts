import { randomUUID } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest'; // ✅ FIX
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { KafkaService } from '../src/config/kafka/kafka.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

type RoleRow = {
  id: number;
  name: string;
  slug: string;
  permissions: string[];
};

type UserRow = {
  id: string;
  roleId: number;
  email: string;
  phone: string | null;
  passwordHash: string;
  fullName: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive' | 'banned';
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type RefreshTokenRow = {
  id: string;
  userId: string;
  jti: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function createPrismaMock() {
  const roles: RoleRow[] = [
    { id: 1, name: 'Customer', slug: 'customer', permissions: [] },
    { id: 2, name: 'Admin', slug: 'admin', permissions: ['*'] },
  ];

  const users: UserRow[] = [];
  const refreshTokens: RefreshTokenRow[] = [];

  const findRole = (roleId: number) =>
    roles.find((role) => role.id === roleId) || null;

  const prisma = {
    role: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where?.slug) {
          return roles.find((r) => r.slug === where.slug) || null;
        }
        if (where?.id) {
          return roles.find((r) => r.id === where.id) || null;
        }
        return null;
      }),
    },
    user: {
      findUnique: jest.fn(async ({ where, include }: any) => {
        let user: UserRow | undefined;

        if (where?.email) {
          user = users.find((u) => u.email === where.email);
        } else if (where?.id) {
          user = users.find((u) => u.id === where.id);
        }

        if (!user) return null;

        const res: any = { ...user };
        if (include?.role) {
          res.role = findRole(user.roleId);
        }
        return res;
      }),

      create: jest.fn(async ({ data, include }: any) => {
        const now = new Date();

        const row: UserRow = {
          id: randomUUID(),
          roleId: data.roleId,
          email: data.email.toLowerCase(), // ✅ normalize
          phone: data.phone || null,
          passwordHash: data.passwordHash,
          fullName: data.fullName,
          avatarUrl: null,
          status: 'active',
          emailVerifiedAt: null,
          lastLoginAt: null,
          createdAt: now,
          updatedAt: now,
        };

        users.push(row);

        const res: any = { ...row };
        if (include?.role) {
          res.role = findRole(row.roleId);
        }

        return res;
      }),

      update: jest.fn(async ({ where, data }: any) => {
        const user = users.find((u) => u.id === where.id);
        if (!user) throw new Error('User not found');

        if (data.lastLoginAt !== undefined) {
          user.lastLoginAt = data.lastLoginAt;
        }

        user.updatedAt = new Date();
        return { ...user };
      }),
    },

    refreshToken: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where?.jti) {
          return refreshTokens.find((r) => r.jti === where.jti) || null;
        }
        if (where?.id) {
          return refreshTokens.find((r) => r.id === where.id) || null;
        }
        return null;
      }),

      create: jest.fn(async ({ data }: any) => {
        const now = new Date();

        const row: RefreshTokenRow = {
          id: randomUUID(),
          userId: data.userId,
          jti: data.jti,
          tokenHash: data.tokenHash,
          familyId: data.familyId,
          expiresAt: data.expiresAt,
          revokedAt: data.revokedAt || null,
          replacedByTokenId: data.replacedByTokenId || null,
          createdAt: now,
          updatedAt: now,
        };

        refreshTokens.push(row);
        return { ...row };
      }),

      update: jest.fn(async ({ where, data }: any) => {
        const row = refreshTokens.find(
          (r) => r.jti === where.jti || r.id === where.id,
        );

        if (!row) throw new Error('Refresh token not found');

        if (data.revokedAt !== undefined) row.revokedAt = data.revokedAt;
        if (data.replacedByTokenId !== undefined)
          row.replacedByTokenId = data.replacedByTokenId;

        row.updatedAt = new Date();
        return { ...row };
      }),

      updateMany: jest.fn(async ({ where, data }: any) => {
        let count = 0;

        for (const row of refreshTokens) {
          const match =
            (where.userId === undefined || row.userId === where.userId) &&
            (where.familyId === undefined ||
              row.familyId === where.familyId) &&
            (where.jti === undefined || row.jti === where.jti) &&
            (where.revokedAt === undefined ||
              row.revokedAt === where.revokedAt);

          if (match) {
            if (data.revokedAt !== undefined)
              row.revokedAt = data.revokedAt;
            if (data.replacedByTokenId !== undefined)
              row.replacedByTokenId = data.replacedByTokenId;

            row.updatedAt = new Date();
            count++;
          }
        }

        return { count };
      }),
    },

    $transaction: jest.fn(async (cb: any) => cb(prisma)),
  };

  return prisma;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const prismaMock = createPrismaMock();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({}),
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 15 * 60 * 1000, limit: 100 }],
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        ThrottlerGuard,
        { provide: PrismaService, useValue: prismaMock },
        { provide: KafkaService, useValue: { emit: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const map: any = {
                JWT_SECRET: 'secret',
                JWT_REFRESH_SECRET: 'refresh',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
                BCRYPT_ROUNDS: '10',
              };
              return map[key];
            },
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'StrongPassword@123',
        confirmPassword: 'StrongPassword@123',
        fullName: 'Test User',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
  });
});