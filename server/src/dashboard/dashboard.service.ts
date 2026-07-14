import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatistics() {
    const [
      users,
      products,
      categories,
      orders,
      latestOrders,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.category.count(),
      this.prisma.order.count(),

      this.prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const revenue = await this.prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    return {
      users,
      products,
      categories,
      orders,
      revenue: Number(revenue._sum.total ?? 0),
      latestOrders,
    };
  }
}