ALTER TABLE "Accounts" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "Budgets" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "Transactions" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "Budgets" DROP COLUMN IF EXISTS "date";--> statement-breakpoint
ALTER TABLE "Transactions" DROP COLUMN IF EXISTS "date";