CREATE TABLE "game_strategies" (
	"user_id" text PRIMARY KEY NOT NULL,
	"markdown" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
