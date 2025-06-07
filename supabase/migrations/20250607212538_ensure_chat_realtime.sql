-- Ensure realtime is enabled for chat_messages table
-- First check and drop if exists
do $$
begin
  if exists (
    select 1 
    from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime drop table "public"."chat_messages";
  end if;
end $$;

-- Add table to realtime publication
alter publication supabase_realtime add table "public"."chat_messages";