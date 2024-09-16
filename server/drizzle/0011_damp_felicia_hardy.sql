ALTER TABLE "transactions" RENAME TO "Transactions";--> statement-breakpoint
ALTER TABLE "Transactions" DROP CONSTRAINT "transactions_user_id_Users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
