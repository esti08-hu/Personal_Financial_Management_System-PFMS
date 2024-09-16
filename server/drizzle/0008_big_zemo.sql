ALTER TABLE "Admins" ALTER COLUMN "role" SET DEFAULT 'ADMIN';--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "role" varchar(50) DEFAULT 'USER';