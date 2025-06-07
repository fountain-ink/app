-- Drop existing policies
drop policy if exists "Users can insert own messages" on "public"."chat_messages";
drop policy if exists "Users can update own messages" on "public"."chat_messages";
drop policy if exists "Admins can delete messages" on "public"."chat_messages";

-- Create new simplified policies (auth will be handled at app level)
create policy "Users can insert messages"
on "public"."chat_messages"
for insert
with check (true);

create policy "Users can update messages"
on "public"."chat_messages"
for update
using (deleted_at is null)
with check (true);