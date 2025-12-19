-- =============================================
-- TIME ENTRIES TABLE & RLS POLICIES
-- =============================================
-- Run this in Supabase Studio SQL Editor

-- Create time_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- duration in seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_entries
CREATE POLICY "Users can create their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (user_id = auth.uid());
