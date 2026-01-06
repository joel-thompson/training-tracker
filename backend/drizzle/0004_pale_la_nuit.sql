CREATE TYPE "public"."goal_category" AS ENUM('bottom', 'top', 'submission', 'escape');--> statement-breakpoint
ALTER TABLE "training_goals" ADD COLUMN "category" "goal_category";--> statement-breakpoint
ALTER TABLE "training_goals" ADD COLUMN "notes" text;