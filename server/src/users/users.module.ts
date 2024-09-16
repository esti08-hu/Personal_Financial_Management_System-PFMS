import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { PasswordService } from "src/auth/services/password.service";

@Module({
  providers: [UsersService, PasswordService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
