import { Test } from '@nestjs/testing';
import { PriceResolverService } from '../src/modules/pricing/price-resolver.service';
import { PrismaService } from '../src/database/prisma.service';

describe('PriceResolverService', () => {
  let service: PriceResolverService;
  let prisma: { priceListItem: { findFirst: jest.Mock } };

  beforeEach(async () => {
    prisma = { priceListItem: { findFirst: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        PriceResolverService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PriceResolverService);
  });

  it('возвращает personal, если он есть', async () => {
    prisma.priceListItem.findFirst.mockResolvedValueOnce({ id: 'p1', price: 100, currency: 'RUB' });
    const result = await service.resolve('s1', 'u1', { userId: 'user1' });
    expect(result.source).toBe('personal');
    expect(result.found).toBe(true);
  });

  it('возвращает found=false, если цены нет нигде', async () => {
    prisma.priceListItem.findFirst.mockResolvedValue(null);
    const result = await service.resolve('s1', 'u1', { userId: 'user1' });
    expect(result.found).toBe(false);
    expect(result.price).toBeUndefined();
  });

  it('organization выигрывает у regional', async () => {
    prisma.priceListItem.findFirst
      .mockResolvedValueOnce(null) // personal
      .mockResolvedValueOnce({ id: 'org', price: 200, currency: 'RUB' }); // organization
    const result = await service.resolve('s1', 'u1', {
      userId: 'user1',
      organizationId: 'org1',
      regionId: 'reg1',
    });
    expect(result.source).toBe('organization');
  });
});
