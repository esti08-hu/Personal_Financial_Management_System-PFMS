// src/transaction/transaction.controller.ts
import {
    Controller,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Get,
  } from "@nestjs/common";
  import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
  import { Public } from "src/auth/guards/auth.decorators";
import { BudgetService } from "./budget.service";
import { CreateBudgetDto, UpdateBudgetDto } from "./budget.dto";
  
  @Controller("budget")
  @ApiTags("budget")
  @ApiBearerAuth()
  export class BudgetController {
    constructor(private readonly budgetService: BudgetService) {}
    @Get("count:id")
    async getUserBudget(@Param("id") id: number) {
      return await this.budgetService.getUserBudgetCount(id)
  }
    @Get(":id")
    @Public()
    async getUserTransactions(@Param("id") userId: number) {
      return this.budgetService.getUserBudgets(userId);
    }
  
    @Post("set-budget")
    async create(@Body() CreateBudgetDto: CreateBudgetDto) {
      const result =
        await this.budgetService.createBudget(CreateBudgetDto);
    }
  
    @Put(":id")
    async update(
      @Param("id") id: string,
      @Body() updateBudgetDto: UpdateBudgetDto
    ) {
      await this.budgetService.updateBudget(
        Number(id),
        updateBudgetDto
      );
    }
  
    @Delete(":id")
    async remove(@Param("id") id: string) {
      return this.budgetService.deleteBudget(Number(id));
    }

  
}