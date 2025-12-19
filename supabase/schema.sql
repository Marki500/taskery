-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- 2. WORKSPACES (Tenants)
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references profiles(id) not null
);

-- 3. WORKSPACE MEMBERS (Many-to-Many)
create table workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('admin', 'member', 'client')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (workspace_id, user_id)
);

-- 4. PROJECTS
create table projects (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TASKS (Kanban)
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo', -- todo, doing, done
  assigned_to uuid references profiles(id),
  position integer default 0, -- For Kanban ordering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. MESSAGES (Chat)
create table messages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Security)
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table messages enable row level security;

-- Basic Policy: Users can see their own profile
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
