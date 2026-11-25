import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('services')
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'querySearch', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getServices(
    @Query('categoryId') categoryId?: string,
    @Query('querySearch') querySearch?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.catalogService.getServices({
      categoryId,
      querySearch,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('services/:code')
  getServiceByCode(@Param('code') code: string) {
    return this.catalogService.getServiceByCode(code);
  }

  @Get('units')
  getUnits() {
    return this.catalogService.getUnits();
  }

  @Get('regions')
  getRegions() {
    return this.catalogService.getRegions();
  }
}
