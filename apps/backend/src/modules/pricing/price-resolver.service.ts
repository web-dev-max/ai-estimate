import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PriceSource, IResolvedPrice, IToResolved } from './interface';

@Injectable()
export class PriceResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(
    serviceId: string,
    unitId: string,
    context: { userId: string; organizationId?: string; regionId?: string },
  ): Promise<IResolvedPrice> {
    const today = new Date();
    const validFilter = {
      validFrom: { lte: today },
      OR: [{ validTo: null }, { validTo: { gte: today } }],
    };

    // Личный прайс мастера
    const personal = await this.prisma.priceListItem.findFirst({
      where: {
        serviceId,
        unitId,
        ...validFilter,
        priceList: { type: 'personal', ownerId: context.userId },
      },
      orderBy: { validFrom: 'desc' },
    });
    if (personal) {
      return this.toResolved(personal, 'personal');
    }

    // Прайс организации
    if (context.organizationId) {
      const org = await this.prisma.priceListItem.findFirst({
        where: {
          serviceId,
          unitId,
          ...validFilter,
          priceList: { type: 'organization', organizationId: context.organizationId },
        },
        orderBy: { validFrom: 'desc' },
      });
      if (org) return this.toResolved(org, 'organization');
    }

    // Региональный системный прайс
    if (context.regionId) {
      const regional = await this.prisma.priceListItem.findFirst({
        where: {
          serviceId,
          unitId,
          ...validFilter,
          priceList: { type: 'system', regionId: context.regionId },
        },
        orderBy: { validFrom: 'desc' },
      });
      if (regional) return this.toResolved(regional, 'system_regional');
    }

    // Общероссийский системный прайс
    const national = await this.prisma.priceListItem.findFirst({
      where: {
        serviceId,
        unitId,
        ...validFilter,
        priceList: { type: 'system', regionId: null },
      },
      orderBy: { validFrom: 'desc' },
    });
    if (national) return this.toResolved(national, 'system_national');

    // Ничего не нашли — НЕ подставляем случайную цену
    return { found: false };
  }

  private toResolved(item: IToResolved, source: PriceSource): IResolvedPrice {
    return {
      found: true,
      price: item.price,
      currency: item.currency,
      source,
      priceListItemId: item.id,
    };
  }
}
