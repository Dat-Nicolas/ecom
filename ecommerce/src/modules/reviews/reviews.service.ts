// reviews.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate, PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    // Verify purchase
    const orderItem = await this.prisma.orderItem.findFirst({
      where: { id: data.orderItemId, order: { userId, status: { in: ['delivered'] } } },
    });
    if (!orderItem) throw new BadRequestException('Can only review purchased & delivered items');
    const existing = await this.prisma.review.findUnique({ where: { orderItemId: data.orderItemId } });
    if (existing) throw new BadRequestException('Already reviewed this item');

    const review = await this.prisma.review.create({ data: { ...data, userId } });

    // Update product rating
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

  async findByProduct(productId: string, query: PaginationDto) {
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
    return paginate(data, total, page, limit);
  }

  async moderate(id: string, status: 'approved' | 'rejected') {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return this.prisma.review.update({ where: { id }, data: { status } });
  }

  async findPending(query: PaginationDto) {
    const { page = 1, limit = 20 } = query;
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({ where: { status: 'pending' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { fullName: true } }, product: { select: { name: true } } } }),
      this.prisma.review.count({ where: { status: 'pending' } }),
    ]);
    return paginate(data, total, page, limit);
  }
}
