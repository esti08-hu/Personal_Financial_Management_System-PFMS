-- Rate Limiting and Anomaly Threshold Tables Migration
-- Adds RateLimitUsage and AnomalyThreshold tables for AI feature controls

CREATE TABLE IF NOT EXISTS "RateLimitUsage" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"gemini_calls_used" integer DEFAULT 0,
	"minute_calls_used" integer DEFAULT 0,
	"cache_hits" integer DEFAULT 0,
	"last_reset_at" timestamptz,
	CONSTRAINT "RateLimitUsage_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "AnomalyThreshold" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_spike_multiplier" numeric(4,2) DEFAULT '1.50',
	"period_variance_multiplier" numeric(4,2) DEFAULT '2.00',
	"rolling_average_days" integer DEFAULT 30,
	"similarity_threshold" numeric(3,2) DEFAULT '0.80',
	"updated_at" timestamptz
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RateLimitUsage" ADD CONSTRAINT "RateLimitUsage_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RateLimitUsage_user_id_date_idx" ON "RateLimitUsage"("user_id","date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "RateLimitUsage_date_idx" ON "RateLimitUsage"("date");