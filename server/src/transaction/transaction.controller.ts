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
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto, UpdateTransactionDto } from "./transaction.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/auth/guards/auth.decorators";

@Controller("transaction")
@ApiTags("transaction")
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get("top-users")
  @Public()
  async getTopUser() {
    return await this.transactionService.getTopUsersByTransactionCount();
  }
  @Get("income:id")
  @Public()
  async getIncome(@Param("id") userId: number) {
    return await this.transactionService.getIncome(userId);
  }
  @Get("expense:id")
  async getExpense(@Param("id") userId: number) {
    return await this.transactionService.getExpense(userId);
  }
  @Get("count")
  @Public()
  async getTransactionCount() {
    return await this.transactionService.getTransactionsCount();
  }

  @Get("balance:id")
  @Public()
  async getBalance(@Param("id") id: number) {
    return await this.transactionService.getBalance(id);
  }
  @Get("/count:id")
  @Public()
  async getUserTransactionCount(@Param("id") id: number) {
    return await this.transactionService.getUserTransactionsCount(id);
  }
  @Get("recent:id")
  @Public()
  async getResent(@Param("id") userId: number) {
    return this.transactionService.getResentTransactions(userId);
  }

  @Get(":id")
  @Public()
  async getUserTransactions(@Param("id") userId: number) {
    return this.transactionService.getUserTransactions(userId);
  }

  @Post("add-transaction")
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    const result =
      await this.transactionService.createTransaction(createTransactionDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    await this.transactionService.updateTransaction(
      Number(id),
      updateTransactionDto
    );
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return await this.transactionService.deleteTransaction(Number(id));
  }
}
