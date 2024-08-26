import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { eq, sql } from "drizzle-orm";
import { databaseSchema } from "src/database/database-schema";
import { DrizzleService } from "src/database/drizzle.service";
import EmailService from "src/email/email.service";
import { UsersService } from "src/users/users.service";
import VerificationTokenPayload from "./emailVerification.interface";

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly drizzle: DrizzleService
  ) {}

  public sendVerificationLink(email: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get("EMAIL_VERIFICATION_SECRET"),
      expiresIn: `${this.configService.get("EMAIL_VERIFICATION_SECRET_EXPIRATION")}`,
    });

    const url = `${this.configService.get("EMAIL_CONFIRMATION_URL")}?token=${token}`;

    const text = "Confirm Email";

    return this.emailService.sendMail({
      to: email,
      subject: "Email confirmation",
      text,
      html: `<p>Welcome to the application. To confirm the email address, <a href="${url}">CLICK HERE:</a></p>`,
    });
  }

  public async resendConfirmationLink(email: string) {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) throw new NotFoundException("User not found");
    if (user.isEmailConfirmed) {
      throw new BadRequestException("Email already confirmed");
    }
  
    const now = new Date();

    const confirmationSentAt = new Date(user.confirmationSentAt);
    const oneHourAfterSent = new Date(confirmationSentAt.getTime() + 60 * 60 * 1000); // Add 1 hour
  
    if (now < oneHourAfterSent) {
      throw new BadRequestException(
        "Confirmation link was sent recently. Please try again later."
      );
    }
    await this.drizzle.db.execute(sql`
      UPDATE "Users"
      SET "confirmationSentAt" = ${now}
      WHERE "email" = ${email};
    `)

    await this.sendVerificationLink(user.email);
  }

  public async confirmEmail(email: string) {
    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(databaseSchema.user.email, email),
    });

    if (!user) throw new BadRequestException("User not found as");

    if (user.isEmailConfirmed) {
      throw new BadRequestException("Email address has already been confirmed");
    }

    await this.usersService.markEmailAsConfirmed(email);
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("EMAIL_VERIFICATION_SECRET"),
      });
      if (typeof payload === "object" && "email" in payload) {
        return payload.email;
      }
      throw new BadRequestException("Invalid payload");
    } catch (error) {
      if (error?.name === "TokenExpiredError")
        throw new BadRequestException("Email confirmation token expired");
    }
    throw new BadRequestException("Bad confirmation token");
  }
}
