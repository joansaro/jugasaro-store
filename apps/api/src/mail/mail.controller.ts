import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '@/auth/decorators/roles.decorator';
import { MailService } from './mail.service';

@ApiTags('admin')
@Controller('admin/emails')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: '[admin] Demo email outbox (last 50 sent emails)' })
  list() {
    return this.mail.list();
  }
}
