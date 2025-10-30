# Quick Database Setup Guide

## The Error You're Seeing

The `500 Internal Server Error` on signup occurs because:
1. The database trigger function is trying to create user records
2. Either the tables don't exist yet, or there's a permission issue

## Quick Fix

### Option 1: Apply the Schema in Supabase Dashboard (Recommended)

1. **Go to your Supabase project** at https://supabase.com/dashboard/project/orxjolepemkmfprrgteb

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the schema**:
   - Open `supabase-schema.sql` from this project
   - Copy ALL the contents (Ctrl+A, Ctrl+C)
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify it worked**:
   - Check the "Query History" tab at the bottom
   - You should see all tables created successfully
   - If there are errors, they'll be shown in red

5. **Restart your dev server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

6. **Try signing up again** - it should work now!

### Option 2: Use Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Initialize Supabase (first time only)
npx supabase init

# Link to your project
npx supabase link --project-ref orxjolepemkmfprrgteb

# Apply the schema
npx supabase db push
```

## Verify Database Setup

After running the schema, check that these tables exist:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - ✅ users
   - ✅ specialists
   - ✅ appointments
   - ✅ payments
   - ✅ reviews
   - ✅ availability
   - ✅ disputes
   - ✅ logs

## Test the Fix

1. Go to `http://localhost:3000/auth/sign-up`
2. Fill in the form:
   - Choose a role (Client or Specialist)
   - Enter your email
   - Create a password (minimum 6 characters)
   - Confirm password
3. Click "Create Account"

**Expected behavior**:
- ✅ Success message: "Account created successfully! Please check your email..."
- ✅ Redirected to sign-in page
- ❌ No more 500 errors!

## Still Having Issues?

### Check 1: Environment Variables
Make sure you have a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://orxjolepemkmfprrgteb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### Check 2: Database Permissions
In Supabase Dashboard:
1. Go to **Project Settings** → **Database** → **Roles**
2. Make sure `authenticated` role has proper permissions

### Check 3: Trigger Function
Check if the trigger was created:
1. Go to **Database** → **Functions**
2. You should see `handle_new_user` listed
3. If missing, re-run the SQL schema

### Check 4: Console Logs
Open browser DevTools (F12) → Console tab
- Look for any additional error messages
- Share them if the issue persists

## Need More Help?

Check `SETUP_INSTRUCTIONS.md` for complete setup documentation.

