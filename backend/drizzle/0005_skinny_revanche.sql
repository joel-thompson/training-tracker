ALTER TABLE "training_sessions" ALTER COLUMN "class_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."class_type";--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('gi', 'nogi');--> statement-breakpoint
ALTER TABLE "training_sessions" ALTER COLUMN "class_type" SET DATA TYPE "public"."class_type" USING "class_type"::"public"."class_type";