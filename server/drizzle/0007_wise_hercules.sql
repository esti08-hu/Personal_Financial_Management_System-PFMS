ALTER TABLE "Users" ADD COLUMN "failedLoginAttempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "accountLockedUntil" timestamp with time zone;