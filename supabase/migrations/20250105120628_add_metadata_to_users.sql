alter table "public"."users" add column "metadata" jsonb default '{}'::jsonb;

-- Add email column
alter table "public"."users" add column "email" text;
