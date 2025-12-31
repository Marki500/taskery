-- =============================================
-- FIX INVITATION ACCEPTANCE PERMISSIONS
-- =============================================

-- The previous fix handled View permissions but missed the Update permission
-- for the invitation itself. This policy allows a user to "accept" (update)
-- an invitation if they match the email OR if they have already joined the workspace.

DROP POLICY IF EXISTS "Invited users can accept their invitations" ON workspace_invitations;

CREATE POLICY "Invited users can accept their invitations" ON workspace_invitations
  FOR UPDATE USING (
    -- 1. If the invitation is specifically for this user's email
    email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR
    -- 2. OR if it's a general link (email is null) AND the user has successfully joined the workspace
    -- (The acceptInvitation action adds the member FIRST, then updates the invitation,
    -- so at this point they are already a member)
    (email IS NULL AND public.is_workspace_member(workspace_id))
  )
  WITH CHECK (
    accepted_at IS NOT NULL -- Limit updates to setting the accepted timestamp
  );
