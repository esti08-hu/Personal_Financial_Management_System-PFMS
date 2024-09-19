import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/auth/guards/auth.decorators";
import { Permissions } from "src/permissions/permissions.decorators";
import { UpdateAdminDto, UpdateUserDto } from "./users.dto";

@Controller("user")
@ApiTags("user")
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Put("update-user:pid")
  @Public()
  async updateUser(
    @Param("pid") pid: string,
    @Body() req: UpdateUserDto
  ) {
    const result = await this.usersService.updateUser(pid, req);
    return result
  }

  @Put("update-admin:pid")
  @Public()
  async updateAdmin(
    @Param("pid") pid: string,
    @Body() req: UpdateAdminDto
  ) {
    const result = await this.usersService.updateAdminUser(pid, req);
    return result
  }
  @Get("deleted-accounts")
  @Public()
  async deletedAccounts() {
    return await this.usersService.deletedAccounts();
  }

  @Delete("deleteUser:pid")
  @Public()
  async deleteUser(@Param("pid") pid: string) {
    return await this.usersService.deleteUser(pid);
  }
  @Post("restore:pid")
  @Public()
  async restoreUser(@Param("pid") pid: string) {
    return await this.usersService.restoreUser(pid);
  }
  @Put("update-role:pid")
  @Permissions("approve-user")
  async updateRole(@Param("pid") pid: string) {
    return await this.usersService.adminFromUser(pid);
  }
  @Get("users")
  @Public()
  async getUsers() {
    return await this.usersService.getAllUsers();
  }

  @Get("unverified")
  @Public()
  async getUnverifiedUsers() {
    return await this.usersService.getUnverifiedAccounts();
  }

  @Get("locked")
  @Public()
  async getLockedAccounts() {
    return await this.usersService.getLockedAccounts();
  }
  @Get("new-users")
  @Public()
  async getNewUsers() {
    return await this.usersService.getNewUsers();
  }

  @Get("count/active-accounts")
  @Public()
  async getActiveAccounts() {
    return await this.usersService.getActiveAccountsCount();
  }

  @Get("count/inactive-accounts")
  @Public()
  async getInActiveAccounts() {
    return await this.usersService.getInActiveAccountsCount();
  }

  @Get("count/locked-accounts")
  @Public()
  async getLockedUsers() {
    return await this.usersService.getLockedUsersCount();
  }

  @Get("count/unverified-accounts")
  @Public()
  async getUnverifiedAccounts() {
    return await this.usersService.getUnverifiedAccountsCount();
  }

  @Get("count/total-accounts")
  @Public()
  async totalAccounts() {
    return await this.usersService.totalAccountsCount();
  }

  @Get("userId")
  async getUser(@Request() req) {
    return await this.usersService.getUserId(req.user.pid);
  }
}
