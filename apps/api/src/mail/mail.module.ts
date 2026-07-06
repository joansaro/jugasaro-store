import { Global, Module } from '@nestjs/common';

import { MailController } from './mail.controller';
import { MailService } from './mail.service';

// Global: orders and auth send transactional emails.
@Global()
@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
