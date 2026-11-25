import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null }, // только корневые
      include: { children: true },
      orderBy: { sort: 'asc' },
    });
  }

  async getServices(params: {
    categoryId?: string;
    querySearch?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = Math.min(params.limit ?? 20, 100);

    const where = {
      isActive: true,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.querySearch ? {
        OR: [
          { name: { contains: params.querySearch, mode: 'insensitive' as const } },
          { description: { contains: params.querySearch, mode: 'insensitive' as const } },
        ],
      } : {}),
    };

    const services = await this.prisma.service.findMany({
      where,
      take: limit + 1, // +1 чтобы понять, есть ли следующая страница
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      orderBy: { code: 'asc' },
      include: { defaultUnit: true, category: true },
    });

    const hasNext = services.length > limit;
    const items = hasNext ? services.slice(0, limit) : services;

    return {
      items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    };
  }

  async getServiceByCode(code: string) {
    const service = await this.prisma.service.findUnique({
      where: { code },
      include: { defaultUnit: true, category: true },
    });
    if (!service) throw new NotFoundException(`Service ${code} not found`);
    return service;
  }

  async getUnits() {
    return this.prisma.unit.findMany({ orderBy: { code: 'asc' } });
  }

  async getRegions() {
    return this.prisma.region.findMany({ orderBy: { code: 'asc' } });
  }
}
