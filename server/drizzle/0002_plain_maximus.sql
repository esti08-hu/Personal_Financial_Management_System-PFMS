ALTER TABLE "Users" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "passwordInit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "refreshToken" DROP NOT NULL;