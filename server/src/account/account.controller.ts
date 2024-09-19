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
import { AccountService } from "./account.service";
import { CreateAccountDto, UpdateAccountDto } from "./account.dto";
  
  @Controller("account")
  @ApiTags("account")
  @ApiBearerAuth()
  export class AccountController {
    constructor(private readonly accountService: AccountService) {}
    @Get(":id")
    @Public()
    async getUserTransactions(@Param("id") userId: number) {
      return this.accountService.getUserAccounts(userId);
    }
  
    @Post("add-account")
    async create(@Body() CreateBudgetDto: CreateAccountDto) {
      const result =
        await this.accountService.createAccount(CreateBudgetDto);
    }
  
    @Put(":id")
    async update(
      @Param("id") id: string,
      @Body() updateAccountDto: UpdateAccountDto
    ) {
      await this.accountService.updateAccount(
        Number(id),
        updateAccountDto
      );
    }
  
    @Delete(":id")
    async remove(@Param("id") id: string) {
      return this.accountService.deleteAccount(Number(id));
    }
  }
  