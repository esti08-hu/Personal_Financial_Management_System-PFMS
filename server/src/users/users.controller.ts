import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/auth/guards/auth.decorators";

@Controller("users")
@ApiTags("users")
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("users")
  @Public()
  async getUsers() {
    return await this.usersService.getAllUsers();
  }
  @Get("new-users")
  @Public()
  async getNewUsers() {
    return await this.usersService.getNewUsers();
  }

  @Get("active-accounts")
  @Public()
  async getActiveAccounts() {
    return await this.usersService.getActiveAccounts();
  }

  @Get("inactive-accounts")
  @Public()
  async getInActiveAccounts() {
    return await this.usersService.getInActiveAccounts();
  }

  @Get("locked-accounts")
  @Public()
  async getLockedUsers() {
    return await this.usersService.getLockedUsers();
  }

  @Get("unverified-accounts")
  @Public()
  async getUnverifiedAccounts() {
    return await this.usersService.getUnverifiedAccounts();
  }

  @Get("total-accounts")
  @Public()
  async totalAccounts() {
    return await this.usersService.totalAccounts();
  }
}
