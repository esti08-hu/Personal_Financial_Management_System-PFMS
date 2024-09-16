import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { createTransport } from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { EMAIL_CONFIG_OPTIONS } from "./email.module-definition";
import EmailOptions from "./emailOptions.interface";
import axios from "axios";

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;

  constructor(@Inject(EMAIL_CONFIG_OPTIONS) private options: EmailOptions) {
    this.nodemailerTransport = createTransport({
      service: options.service,
      auth: {
        user: options.user,
        pass: options.password,
      },
    });
  }

  // Function to validate email using Hunter.io API
  private async validateEmailWithHunter(email: string): Promise<boolean> {
    const apiKey = process.env.HUNTER_API_KEY;

    try {
      const response = await axios.get(
        "https://api.hunter.io/v2/email-verifier",
        {
          params: {
            email: email,
            api_key: apiKey,
          },
        }
      );

      // Hunter.io response data
      const { data } = response;

      // Check the verification result
      if (data && data.data && data.data.result === "deliverable") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async sendMail(
    options: Mail.Options
  ): Promise<{ success: boolean; message: string }> {
    const email = options.to as string;
    const isValidEmail = await this.validateEmailWithHunter(email); // Validate recipient email before sending using Hunter.io

    if (!isValidEmail) {
      throw new BadRequestException(
        "Email address is invalid or not deliverable."
      );
    }

    try {
      // Attempt to send the email
      const info = await this.nodemailerTransport.sendMail(options);

      // Inspect the SMTP response for clues about delivery issues
      if (info.rejected.length > 0) {
        return {
          success: false,
          message: `Failed to send email to the following addresses: ${info.rejected.join(", ")}`,
        };
      }
      return { success: true, message: "Email sent successfully." };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }
}
