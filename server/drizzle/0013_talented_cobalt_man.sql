ALTER TABLE "Budgets" ALTER COLUMN "date" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "date" SET NOT NULL;