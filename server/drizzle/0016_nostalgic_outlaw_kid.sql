ALTER TABLE "Transactions" ADD COLUMN "account_id" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_account_id_Accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."Accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Transactions" DROP COLUMN IF EXISTS "account";