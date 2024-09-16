import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/guards/auth.decorators'
import { ConfirmEmailDto } from './confirmEmail.dto'
import { EmailConfirmationService } from './emailConfirmation.service'

@Controller('email-confirmation')
@ApiBearerAuth()
@ApiTags('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Post('resend-confirmation-link')
  @Public()
  async resendConfirmationLink(@Body('email') email: string) {
    await this.emailConfirmationService.resendConfirmationLink(email)
  }

  @Get('confirm')
  @Public()
  async confirm(@Query('token') token: string, @Res() res) {
    const email =
      await this.emailConfirmationService.decodeConfirmationToken(token)
    await this.emailConfirmationService.confirmEmail(email)

    // Redirect to the login page after successful confirmation
    return res.redirect('http://localhost:3000/pages/login?emailConfirmed=true')
  }
}
