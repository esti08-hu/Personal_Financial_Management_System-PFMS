DROP INDEX IF EXISTS "conversation_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "rate_limit_usage_user_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "turn_conversation_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "transaction_user_id_created_at_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversation_user_id_last_activity_at_idx" ON "Conversation" USING btree ("user_id","last_activity_at" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_usage_user_id_date_idx" ON "RateLimitUsage" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "turn_conversation_id_created_at_idx" ON "Turn" USING btree ("conversation_id","createdAt" desc);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_user_id_created_at_idx" ON "Transactions" USING btree ("user_id","createdAt" desc);