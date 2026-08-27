CREATE TABLE IF NOT EXISTS "AnomalyThreshold" (
	"id" serial PRIMARY KEY NOT NULL,
	"rate_limit_multiplier" integer DEFAULT 2 NOT NULL,
	"anomaly_score_threshold" integer DEFAULT 10 NOT NULL,
	"consecutive_failures_threshold" integer DEFAULT 5 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"total_turns" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "RateLimitUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"gemini_calls_used" integer DEFAULT 0 NOT NULL,
	"minute_calls_used" integer DEFAULT 0 NOT NULL,
	"cache_hits" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Turn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_message" text NOT NULL,
	"assistant_message" text,
	"intent" jsonb,
	"aggregates" jsonb,
	"is_processed" boolean DEFAULT false NOT NULL,
	"is_fallback" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"processedAt" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "RateLimitUsage" ADD CONSTRAINT "RateLimitUsage_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Turn" ADD CONSTRAINT "Turn_conversation_id_Conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."Conversation"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
