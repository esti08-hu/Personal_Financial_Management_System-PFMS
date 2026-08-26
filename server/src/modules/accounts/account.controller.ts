import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateAccountDto, UpdateAccountDto } from './account.dto'
import { AccountService } from './account.service'
import { AccountFilterDto } from 'src/common/dto/filter.dto'

@Controller('account')
@ApiTags('account')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('balance/:id')
  async getBalance(@Param('id') id: string) {
    return await this.accountService.getBalance(id)
  }

  @Get(':id')
  async getUserAccounts(
    @Param('id') userId: string,
    @Query() filters: AccountFilterDto,
  ) {
    return this.accountService.getUserAccountsPaginated(userId, filters)
  }

  @Post('add-account')
  @HttpCode(201)
  async create(@Body() createAccountDto: CreateAccountDto) {
    return await this.accountService.createAccount(createAccountDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return await this.accountService.updateAccount(id, updateAccountDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.accountService.deleteAccount(id)
  }
}
