import { Prisma } from '../../database/generated/prisma/client';
type Decimal = Prisma.Decimal;

export type PriceSource = 'personal' | 'organization' | 'system_regional' | 'system_national' | 'manual';

export interface IResolvedPrice {
  found: boolean;
  price?: Decimal;
  currency?: string;
  source?: PriceSource;
  priceListItemId?: string;
}

export interface IToResolved {
    id: string;
    priceListId: string;
    serviceId: string;
    unitId: string;
    price: Decimal;
    currency?: string;
    validFrom?: Date;
    validTo?: Date | null;
}
