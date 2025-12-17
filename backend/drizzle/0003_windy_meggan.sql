CREATE TABLE "game_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"parent_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_transitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"from_item_id" uuid NOT NULL,
	"to_item_id" uuid NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_items" ADD CONSTRAINT "game_items_parent_id_game_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."game_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_transitions" ADD CONSTRAINT "game_transitions_from_item_id_game_items_id_fk" FOREIGN KEY ("from_item_id") REFERENCES "public"."game_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_transitions" ADD CONSTRAINT "game_transitions_to_item_id_game_items_id_fk" FOREIGN KEY ("to_item_id") REFERENCES "public"."game_items"("id") ON DELETE cascade ON UPDATE no action;