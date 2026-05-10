// src/transaction/transaction.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './transaction.dto'
import { TransactionService } from './transaction.service'

@Controller('transaction')
@ApiTags('transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('top-users')
  async getTopUser() {
    return await this.transactionService.getTopUsersByTransactionCount()
  }
  @Get('count')
  async getTransactionCount() {
    return await this.transactionService.getTransactionsCount()
  }
  @Get(':id')
  async getTransactionById(@Param('id') id: string) {
    return await this.transactionService.getTransactionById(id)
  }

  @Get('income/:id')
  async getIncome(@Param('id') userId: string) {
    return await this.transactionService.getIncome(userId)
  }
  @Get('expense/:id')
  async getExpense(@Param('id') userId: string) {
    return await this.transactionService.getExpense(userId)
  }

  @Get('count/:id')
  async getUserTransactionCount(@Param('id') id: string) {
    return await this.transactionService.getUserTransactionsCount(id)
  }
  @Get('recent/:id')
  async getRecent(@Param('id') userId: string) {
    return this.transactionService.getRecentTransactions(userId)
  }

  @Get('user/:id')
  async getUserTransactions(@Param('id') userId: string) {
    return this.transactionService.getUserTransactions(userId)
  }

  @Post('add-transaction')
  @HttpCode(201)
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionService.createTransaction(createTransactionDto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    await this.transactionService.updateTransaction(
      id,
      updateTransactionDto,
    )
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.transactionService.deleteTransaction(id)
  }
}
