CREATE TABLE IF NOT EXISTS "Admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"pid" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" varchar(50) DEFAULT 'SUPERADMIN',
	"password" varchar(256) NOT NULL,
	"refreshToken" varchar(512) NOT NULL,
	CONSTRAINT "Admins_pid_unique" UNIQUE("pid"),
	CONSTRAINT "Admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Users" (
	"id" serial PRIMARY KEY NOT NULL,
	"pid" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"passwordInit" varchar(256) NOT NULL,
	"refreshToken" varchar(512) NOT NULL,
	"isEmailConfirmed" boolean DEFAULT false NOT NULL,
	"isRegisteredWithGoogle" boolean DEFAULT false NOT NULL,
	CONSTRAINT "Users_pid_unique" UNIQUE("pid"),
	CONSTRAINT "Users_email_unique" UNIQUE("email"),
	CONSTRAINT "Users_phone_unique" UNIQUE("phone")
);
