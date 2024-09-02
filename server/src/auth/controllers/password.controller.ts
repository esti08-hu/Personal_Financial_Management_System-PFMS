import { Body, Controller, Param, Patch, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UpdatePasswordDto } from '../auth.dto'
import { AuthService } from '../services/auth.service'
import { PasswordService } from '../services/password.service'

@ApiTags('password')
@ApiBearerAuth()
@Controller('password')
export class PasswordController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
  ) {}

  @Post('reset')
  async register() {}

  @Patch('updateUser')
  async updatePasswordByUser(@Body() updatePasswordDto: UpdatePasswordDto) {
    const { pid, currentPassword, newPassword } = updatePasswordDto
    const user1 = await this.passwordService.updatePasswordByUser(
      pid,
      currentPassword,
      newPassword,
    )
    return user1
  }

  @Patch('update/:pid')
  async updatePasswordByAdmin(@Param('pid') pid: string) {
    const user = await this.passwordService.updatePasswordByAdmin(pid)
    return user
  }
}
