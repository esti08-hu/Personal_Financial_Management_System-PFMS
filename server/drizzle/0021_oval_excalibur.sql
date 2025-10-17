DROP INDEX IF EXISTS "transaction_user_id_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "budget_user_id_idx" ON "Budgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_user_id_created_at_idx" ON "Transactions" USING btree ("user_id","createdAt");