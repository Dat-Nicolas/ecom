"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const slugify_1 = require("slugify");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ProductsService = class ProductsService {
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async create(dto) {
        const slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true, locale: 'vi' });
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.ConflictException(`Product slug "${slug}" already exists`);
        const product = await this.prisma.product.create({
            data: { ...dto, slug },
            include: { category: true, brand: true, images: true, variants: true },
        });
        await this.cache.del('products:featured');
        return product;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, categoryId, brandId, status, isFeatured, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search)
            where.name = { contains: search, mode: 'insensitive' };
        if (categoryId)
            where.categoryId = categoryId;
        if (brandId)
            where.brandId = brandId;
        if (status)
            where.status = status;
        if (isFeatured !== undefined)
            where.isFeatured = isFeatured;
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
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async findOne(id) {
        const cacheKey = `product:${id}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
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
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        await this.cache.set(cacheKey, product, 300);
        return product;
    }
    async findBySlug(slug) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                brand: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { where: { isActive: true } },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, dto) {
        await this.findOne(id);
        const data = { ...dto };
        if (dto.name) {
            data.slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true, locale: 'vi' });
        }
        const product = await this.prisma.product.update({
            where: { id },
            data,
            include: { category: true, brand: true, images: true, variants: true },
        });
        await this.cache.del(`product:${id}`);
        return product;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.product.update({ where: { id }, data: { status: 'archived' } });
        await this.cache.del(`product:${id}`);
        return { message: 'Product archived successfully' };
    }
    async addVariant(productId, dto) {
        await this.findOne(productId);
        const existing = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
        if (existing)
            throw new common_1.ConflictException(`SKU "${dto.sku}" already exists`);
        return this.prisma.productVariant.create({ data: { ...dto, productId } });
    }
    async getFeatured() {
        const cacheKey = 'products:featured';
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const products = await this.prisma.product.findMany({
            where: { isFeatured: true, status: 'active' },
            take: 10,
            include: { images: { where: { isPrimary: true }, take: 1 }, brand: true },
        });
        await this.cache.set(cacheKey, products, 600);
        return products;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map