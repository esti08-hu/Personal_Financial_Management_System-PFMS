-- Conversational Assistant Tables Migration
-- Adds Conversation and Turn tables for Gemini AI integration

CREATE TABLE IF NOT EXISTS "Conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" integer NOT NULL,
	"session_id" uuid,
	"created_at" timestamptz DEFAULT now(),
	"last_activity_at" timestamptz,
	"expires_at" timestamptz,
	"turn_count" integer DEFAULT 0,
	"token_estimate" integer DEFAULT 0,
	"truncated" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Turn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"conversation_id" uuid NOT NULL,
	"user_query_raw" text,
	"user_query_hash" char(64),
	"normalized_query" text,
	"interpreted_intent" jsonb,
	"aggregates" jsonb,
	"ai_summary_text" text,
	"fallback_used" boolean DEFAULT false,
	"cache_hit" boolean DEFAULT false,
	"context_truncated" boolean DEFAULT false,
	"model" varchar(64),
	"latency_ms" integer,
	"created_at" timestamptz DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Turn" ADD CONSTRAINT "Turn_conversation_id_Conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "Conversation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Turn_conversation_id_created_at_idx" ON "Turn"("conversation_id","created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Turn_user_query_hash_idx" ON "Turn"("user_query_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "Conversation_user_id_last_activity_at_idx" ON "Conversation"("user_id","last_activity_at" DESC);