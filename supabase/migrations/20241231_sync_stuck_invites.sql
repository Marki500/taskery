-- =============================================
-- SYNC STUCK INVITATIONS
-- =============================================

-- This script finds invitations that are still marked as "pending" (accepted_at IS NULL)
-- BUT where the user is ALREADY a member of the workspace.
-- It forcibly marks them as accepted.

UPDATE workspace_invitations
SET accepted_at = NOW()
WHERE accepted_at IS NULL
AND EXISTS (
  -- Check if the invited email corresponds to a user who is ALREADY in the workspace_members table
  SELECT 1 
  FROM workspace_members wm
  JOIN profiles p ON p.id = wm.user_id
  WHERE wm.workspace_id = workspace_invitations.workspace_id
  AND p.email = workspace_invitations.email
);

-- Result: The "Ghost" pending invitation will disappear from the UI since it's now officially accepted.
