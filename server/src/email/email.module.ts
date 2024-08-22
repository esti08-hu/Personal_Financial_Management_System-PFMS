import { Module } from '@nestjs/common'
import { ConfigurableEmailModule } from './email.module-definition'
import EmailService from './email.service'

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule extends ConfigurableEmailModule {}
