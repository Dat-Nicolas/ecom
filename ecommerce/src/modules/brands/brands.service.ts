// brands.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}
  async create(data: any) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const ex = await this.prisma.brand.findUnique({ where: { slug } });
    if (ex) throw new ConflictException('Brand already exists');
    return this.prisma.brand.create({ data: { ...data, slug } });
  }
  async findAll() { return this.prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }
  async findOne(id: number) {
    const b = await this.prisma.brand.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Brand not found');
    return b;
  }
  async update(id: number, data: any) { await this.findOne(id); return this.prisma.brand.update({ where: { id }, data }); }
  async remove(id: number) { await this.findOne(id); return this.prisma.brand.update({ where: { id }, data: { isActive: false } }); }
}
