import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateAccountDto, UpdateAccountDto } from './account.dto'
import { AccountService } from './account.service'

@Controller('account')
@ApiTags('account')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('balance:id')
  async getBalance(@Param('id') id: string) {
    return await this.accountService.getBalance(id)
  }

  @Get(':id')
  async getUserAccounts(@Param('id') userId: string) {
    return this.accountService.getUserAccounts(userId)
  }

  @Post('add-account')
  async create(@Body() CreateBudgetDto: CreateAccountDto) {
    const result = await this.accountService.createAccount(CreateBudgetDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    await this.accountService.updateAccount(id, updateAccountDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.accountService.deleteAccount(id)
  }
}
