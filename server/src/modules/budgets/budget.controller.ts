// src/transaction/transaction.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CreateBudgetDto, UpdateBudgetDto } from './budget.dto'
import { BudgetService } from './budget.service'
import { BudgetFilterDto } from 'src/common/dto/filter.dto'

@Controller('budget')
@ApiTags('budget')
@ApiBearerAuth()
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('count/:id')
  async getUserBudget(@Param('id') id: string) {
    return await this.budgetService.getUserBudgetCount(id)
  }

  @Get(':id')
  async getUserBudgets(
    @Param('id') userId: string,
    @Query() filters: BudgetFilterDto,
  ) {
    return this.budgetService.getUserBudgetsPaginated(userId, filters)
  }

  @Post('set-budget')
  async create(@Body() CreateBudgetDto: CreateBudgetDto) {
    return await this.budgetService.createBudget(CreateBudgetDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return await this.budgetService.updateBudget(id, updateBudgetDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.budgetService.deleteBudget(id)
  }
}
