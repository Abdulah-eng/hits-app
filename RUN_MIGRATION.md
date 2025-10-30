# How to Run the Migration

## Quick Start

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/orxjolepemkmfprrgteb
   - Click on **"SQL Editor"** in the left sidebar

2. **Open the Migration File**
   - Open `supabase-migration-fresh.sql` in your project folder
   - Copy ALL the contents (Ctrl+A, Ctrl+C)

3. **Run the Migration**
   - Paste into the SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)

4. **Wait for Success**
   - You should see "Migration completed successfully!" at the bottom
   - Check the "Query History" tab for any errors (should be none)

5. **Restart Your Dev Server**
   ```bash
   # Stop the server (Ctrl+C) then restart
   npm run dev
   ```

6. **Test Sign Up**
   - Go to http://localhost:3000/auth/sign-up
   - Try creating an account
   - It should work now! ✅

## What This Migration Does

This migration script will:
- ✅ Drop existing tables (logs, disputes, availability, reviews, payments, appointments, specialists, users)
- ✅ Drop existing triggers and functions
- ✅ Create all tables fresh
- ✅ Create all indexes for performance
- ✅ Enable Row Level Security
- ✅ Create helper functions (is_admin, is_specialist, is_client, update_updated_at_column)
- ✅ Create the user registration trigger (handle_new_user)
- ✅ Create all RLS policies for security
- ✅ Grant necessary permissions

**WARNING**: This will DELETE all existing data. If you have users or appointments, back them up first!

## Troubleshooting

### "Relation already exists" Error
If you still see this error, it means the migration didn't run completely. Try:
1. Run the migration again
2. Check for any error messages in "Query History"
3. Copy and share the error with me

### Other Errors
- Check that you have the correct Supabase project
- Make sure you're logged into Supabase Dashboard
- Try running the migration in smaller chunks if it's too large

### Sign Up Still Not Working After Migration
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Restart your dev server
3. Check browser console (F12) for any new errors
4. Verify the `.env.local` file has correct Supabase credentials

## Verify Migration Success

After running the migration, check:

1. **Tables Existence**
   - Go to "Table Editor" in Supabase
   - You should see: users, specialists, appointments, payments, reviews, availability, disputes, logs

2. **Functions**
   - Go to "Database" → "Functions"
   - Should see: handle_new_user, is_admin, is_specialist, is_client, update_updated_at_column

3. **Policies**
   - Go to "Authentication" → "Policies"
   - Should see policies for each table

## Need Help?

If you encounter any errors, share them with me and I'll help you fix it!

