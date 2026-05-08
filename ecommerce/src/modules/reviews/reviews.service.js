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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        const orderItem = await this.prisma.orderItem.findFirst({
            where: { id: data.orderItemId, order: { userId, status: { in: ['delivered'] } } },
        });
        if (!orderItem)
            throw new common_1.BadRequestException('Can only review purchased & delivered items');
        const existing = await this.prisma.review.findUnique({ where: { orderItemId: data.orderItemId } });
        if (existing)
            throw new common_1.BadRequestException('Already reviewed this item');
        const review = await this.prisma.review.create({ data: { ...data, userId } });
        const agg = await this.prisma.review.aggregate({
            where: { productId: data.productId, status: 'approved' },
            _avg: { rating: true }, _count: { rating: true },
        });
        await this.prisma.product.update({
            where: { id: data.productId },
            data: { avgRating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
        });
        return review;
    }
    async findByProduct(productId, query) {
        const { page = 1, limit = 10 } = query;
        const [data, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { productId, status: 'approved' },
                skip: (page - 1) * limit, take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { fullName: true, avatarUrl: true } } },
            }),
            this.prisma.review.count({ where: { productId, status: 'approved' } }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
    async moderate(id, status) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return this.prisma.review.update({ where: { id }, data: { status } });
    }
    async findPending(query) {
        const { page = 1, limit = 20 } = query;
        const [data, total] = await Promise.all([
            this.prisma.review.findMany({ where: { status: 'pending' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { fullName: true } }, product: { select: { name: true } } } }),
            this.prisma.review.count({ where: { status: 'pending' } }),
        ]);
        return (0, pagination_dto_1.paginate)(data, total, page, limit);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map