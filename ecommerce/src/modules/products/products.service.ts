import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import slugify from 'slugify';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(dto: CreateProductDto) {
    const slug = slugify(dto.name, { lower: true, strict: true, locale: 'vi' });

    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`Product slug "${slug}" already exists`);

    const product = await this.prisma.product.create({
      data: { ...dto, slug },
      include: { category: true, brand: true, images: true, variants: true },
    });

    await this.cache.del('products:featured');
    return product;
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, search, categoryId, brandId, status, isFeatured, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { category: true, brand: true, images: { where: { isPrimary: true }, take: 1 }, _count: { select: { variants: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const cacheKey = `product:${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    await this.cache.set(cacheKey, product, 300);
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.name) {
      data.slug = slugify(dto.name, { lower: true, strict: true, locale: 'vi' });
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, brand: true, images: true, variants: true },
    });

    await this.cache.del(`product:${id}`);
    return product;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({ where: { id }, data: { status: 'archived' } });
    await this.cache.del(`product:${id}`);
    return { message: 'Product archived successfully' };
  }

  async addVariant(productId: string, dto: CreateVariantDto) {
    await this.findOne(productId);
    const existing = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`SKU "${dto.sku}" already exists`);

    return this.prisma.productVariant.create({ data: { ...dto, productId } });
  }

  async getFeatured() {
    const cacheKey = 'products:featured';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'active' },
      take: 10,
      include: { images: { where: { isPrimary: true }, take: 1 }, brand: true },
    });

    await this.cache.set(cacheKey, products, 600);
    return products;
  }
}
