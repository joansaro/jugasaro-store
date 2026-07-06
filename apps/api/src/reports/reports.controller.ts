import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '@/auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@ApiTags('admin')
@Roles(UserRole.ADMIN)
@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: '[admin] Sales report: summary, daily series, top products, by category' })
  sales(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.sales(from, to);
  }

  @Get('sales.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="sales.csv"')
  @ApiOperation({ summary: '[admin] Sales export as CSV' })
  salesCsv(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.salesCsv(from, to);
  }
}
