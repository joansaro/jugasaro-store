import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Public } from '@/auth/decorators/public.decorator';
import { Roles } from '@/auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public store settings (name, currency, tax rate)' })
  publicSettings() {
    return this.settings.publicSettings();
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  @ApiOperation({ summary: '[admin] All settings' })
  all() {
    return this.settings.all();
  }

  @Roles(UserRole.ADMIN)
  @Put()
  @ApiOperation({ summary: '[admin] Update settings (partial)' })
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto.entries);
  }
}
