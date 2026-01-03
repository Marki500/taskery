create table if not exists workspace_activity (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  entity_id uuid not null,
  entity_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table workspace_activity enable row level security;

-- Policies
create policy "Workspace members can view activity"
  on workspace_activity
  for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = workspace_activity.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can insert activity"
  on workspace_activity
  for insert
  with check (auth.uid() = user_id);
