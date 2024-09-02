ALTER TABLE "Users" ADD COLUMN "passwordResetTokenExpires" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "passwordResetTokenUsed" boolean DEFAULT false;