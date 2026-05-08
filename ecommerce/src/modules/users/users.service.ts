// src/modules/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip: (page - 1) * limit, take: limit, include: { role: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return paginate(data.map(({ passwordHash, ...u }) => u), total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true, addresses: true } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async getProfile(id: string) { return this.findOne(id); }

  async updateProfile(id: string, data: any) {
    const { passwordHash, roleId, email, ...safe } = data;
    await this.prisma.user.update({ where: { id }, data: safe });
    return this.findOne(id);
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.userAddress.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.userAddress.create({ data: { ...data, userId } });
  }

  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }

  async removeAddress(userId: string, id: string) {
    const addr = await this.prisma.userAddress.findFirst({ where: { id, userId } });
    if (!addr) throw new NotFoundException('Address not found');
    await this.prisma.userAddress.delete({ where: { id } });
    return { message: 'Address deleted' };
  }
}
