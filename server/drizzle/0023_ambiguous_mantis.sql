ALTER TABLE "Transactions" DROP CONSTRAINT IF EXISTS "Transactions_account_id_Accounts_id_fk";--> statement-breakpoint
ALTER TABLE "Transactions" DROP CONSTRAINT IF EXISTS "Transactions_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "Transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "Accounts" DROP CONSTRAINT IF EXISTS "Accounts_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "Budgets" DROP CONSTRAINT IF EXISTS "Budgets_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "Conversation" DROP CONSTRAINT IF EXISTS "Conversation_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "RateLimitUsage" DROP CONSTRAINT IF EXISTS "RateLimitUsage_user_id_Users_id_fk";--> statement-breakpoint
ALTER TABLE "Turn" DROP CONSTRAINT IF EXISTS "Turn_conversation_id_Conversation_id_fk";--> statement-breakpoint

ALTER TABLE "Accounts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Admins" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "AnomalyThreshold" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "RateLimitUsage" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "Accounts" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Accounts" ALTER COLUMN "user_id" SET DATA TYPE uuid USING md5("user_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Admins" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Admins" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "AnomalyThreshold" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "user_id" SET DATA TYPE uuid USING md5("user_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Conversation" ALTER COLUMN "user_id" SET DATA TYPE uuid USING md5("user_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "RateLimitUsage" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "RateLimitUsage" ALTER COLUMN "user_id" SET DATA TYPE uuid USING md5("user_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING md5("user_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "account_id" SET DATA TYPE uuid USING md5("account_id"::text)::uuid;--> statement-breakpoint
ALTER TABLE "Users" ALTER COLUMN "id" SET DATA TYPE uuid USING md5("id"::text)::uuid;--> statement-breakpoint

ALTER TABLE "Users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Budgets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Transactions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "RateLimitUsage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "AnomalyThreshold" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "Accounts" ADD CONSTRAINT "Accounts_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Budgets" ADD CONSTRAINT "Budgets_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_account_id_Accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."Accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RateLimitUsage" ADD CONSTRAINT "RateLimitUsage_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Turn" ADD CONSTRAINT "Turn_conversation_id_Conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;