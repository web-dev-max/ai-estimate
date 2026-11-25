import { Module } from '@nestjs/common';
import { PriceResolverService } from './price-resolver.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PriceResolverService],
  exports: [PriceResolverService],
})
export class PricingModule {}
