CREATE INDEX IF NOT EXISTS "conversation_user_id_idx" ON "Conversation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_usage_user_id_idx" ON "RateLimitUsage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "turn_conversation_id_idx" ON "Turn" USING btree ("conversation_id");