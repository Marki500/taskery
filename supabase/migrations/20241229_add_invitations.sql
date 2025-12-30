-- Create workspace_invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT,                          -- NULL if link-only invitation
  role TEXT CHECK (role IN ('admin', 'member', 'client')) DEFAULT 'member',
  token TEXT UNIQUE NOT NULL,          -- Unique token for the invite link
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE, -- NULL = pending
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_workspace ON workspace_invitations(workspace_id);

-- Enable RLS
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
-- Workspace admins can view/create/delete invitations
CREATE POLICY "Workspace admins can manage invitations" ON workspace_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspace_invitations.workspace_id 
      AND workspace_members.user_id = auth.uid() 
      AND workspace_members.role = 'admin'
    )
  );

-- Anyone can view invitation by token (for accept page)
CREATE POLICY "Anyone can view invitation by token" ON workspace_invitations
  FOR SELECT USING (true);
