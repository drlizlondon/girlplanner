# Fix sign-in for lizzies_95@hotmail.co.uk

## What I found

- There is exactly one account in the app, `lizzies_95@hotmail.co.uk`, created 14 Oct 2025, email confirmed, last successful sign-in 6 Jun 2026. Your saved planner data belongs to this account.
- The failed attempt at 13:41 today was rejected as "Invalid login credentials", so the email exists and the password entered doesn't match.
- The app currently has no "forgot password" option anywhere, so there is no way to recover an account from the sign-in box.

## What to build

1. **Forgot password link** in the sign-in box. Enter the email, get a reset link by email.
2. **New "Set a new password" page** that the emailed link opens, where you type a new password twice and are then signed in.
3. **Clearer error message** on the sign-in box: instead of the raw "Invalid login credentials", show "Email or password is incorrect — try resetting your password" with the reset link right there.

After this ships you can reset the password on `lizzies_95@hotmail.co.uk` yourself and get straight back into your existing agenda, people and opportunities.

## Technical notes

- `AuthModal.tsx`: add a "Forgot password?" view calling `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/reset-password\` })`; map `invalid_credentials` to the friendlier copy.
- New `src/pages/ResetPassword.tsx` at public route `/reset-password` (registered in `App.tsx` outside the app layout gate); on mount it lets Supabase hydrate the recovery session, then calls `supabase.auth.updateUser({ password })` — no `current_password` on the recovery path — and redirects to `/agenda`.
- Email/password auth is already active for this project (existing confirmed user, working past sign-ins), so no auth provider changes are needed.
- No database or schema changes.
