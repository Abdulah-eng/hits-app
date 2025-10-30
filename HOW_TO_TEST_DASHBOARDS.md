# How to Test the Dashboards with Real Data

## Current Status
✅ Dashboards now fetch real data from the database  
✅ All API calls replaced with direct Supabase client calls  
✅ No more 401 errors

## Issue: No Specialists Showing
The specialists dropdown will be empty because:
1. There are no specialist users yet, OR
2. The specialist users exist but are not verified

## How to Create Test Data

### Option 1: Manual Verification in Database

If you already have a specialist account:

1. Go to your Supabase Dashboard
2. Navigate to **Table Editor** → **specialists**
3. Find the specialist record
4. Set `verified` to `true` for that specialist
5. Refresh the booking page - specialists should now appear!

### Option 2: Create Test Data via SQL

Run this in Supabase SQL Editor to create test data:

```sql
-- First, ensure you have specialist users
-- (You should have signed up as a specialist)

-- Update an existing specialist to be verified
UPDATE specialists 
SET verified = true,
    credentials = 'AWS Certified Solutions Architect, Microsoft Azure Expert',
    bio = 'Experienced cloud architect with 10+ years in the industry. Specializing in cloud migrations, infrastructure optimization, and DevOps practices.',
    hourly_rate = 75.00
WHERE id IN (
  SELECT id FROM specialists LIMIT 1
);

-- Add some availability for the specialist
INSERT INTO availability (specialist_id, day, start_time, end_time, is_active)
VALUES 
  ((SELECT user_id FROM specialists WHERE verified = true LIMIT 1), 'monday', '09:00', '17:00', true),
  ((SELECT user_id FROM specialists WHERE verified = true LIMIT 1), 'tuesday', '09:00', '17:00', true),
  ((SELECT user_id FROM specialists WHERE verified = true LIMIT 1), 'wednesday', '09:00', '17:00', true),
  ((SELECT user_id FROM specialists WHERE verified = true LIMIT 1), 'thursday', '09:00', '17:00', true),
  ((SELECT user_id FROM specialists WHERE verified = true LIMIT 1), 'friday', '09:00', '15:00', true)
ON CONFLICT DO NOTHING;
```

### Option 3: Create a Complete Test Scenario

Run this complete SQL script to set up everything:

```sql
-- 1. Ensure your user exists and is set as a specialist
-- (Do this after signing up as a specialist)

-- 2. Update the specialist record
UPDATE specialists 
SET verified = true,
    credentials = 'Certified IT Professional',
    bio = 'Expert in troubleshooting, system administration, and IT consulting.',
    hourly_rate = 60.00
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- 3. Add availability
DELETE FROM availability 
WHERE specialist_id IN (
  SELECT id FROM users WHERE email = 'YOUR_EMAIL_HERE'
);

INSERT INTO availability (specialist_id, day, start_time, end_time, is_active)
SELECT 
  (SELECT id FROM users WHERE email = 'YOUR_EMAIL_HERE'),
  day,
  start_time,
  end_time,
  true
FROM (
  VALUES 
    ('monday', '09:00', '17:00'),
    ('tuesday', '09:00', '17:00'),
    ('wednesday', '09:00', '17:00'),
    ('thursday', '09:00', '17:00'),
    ('friday', '09:00', '15:00')
) AS avail(day, start_time, end_time);

-- 4. Verify it worked
SELECT 
  s.id,
  s.verified,
  s.hourly_rate,
  u.name,
  u.email,
  COUNT(a.id) as availability_count
FROM specialists s
JOIN users u ON s.user_id = u.id
LEFT JOIN availability a ON s.user_id = a.specialist_id
WHERE s.verified = true
GROUP BY s.id, s.verified, s.hourly_rate, u.name, u.email;
```

## Quick Test Steps

1. **Run the migration script** (`supabase-migration-fresh.sql`) if you haven't already
2. **Sign up** as a specialist on the app
3. **Manually verify** the specialist in Supabase:
   - Go to Table Editor → specialists
   - Find your specialist record
   - Set `verified = true`
   - Add `credentials`, `bio`, and `hourly_rate`
4. **Add availability** (in specialist dashboard or via SQL above)
5. **Sign up** as a client (different email)
6. **Go to book-appointment page** - you should see specialists!
7. **Book an appointment** as the client
8. **Check dashboards** - both should show real data

## Troubleshooting

### Still no specialists showing?

1. **Check Supabase Table Editor**:
   - Verify specialists exist in `specialists` table
   - Verify `verified` is `true`
   - Verify users exist for those specialists

2. **Check Browser Console** (F12):
   - Look for any errors
   - Check Network tab for API calls

3. **Verify user role**:
   - Make sure you signed up with role 'specialist'
   - Check in `users` table that role = 'specialist'

### Need to make a user admin?

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

This will let you access the admin dashboard at `/dashboard/admin`.

## Testing Flow

1. ✅ Create specialist account → sets role = 'specialist'
2. ✅ Manually verify specialist in database
3. ✅ Add availability slots (specialist dashboard or SQL)
4. ✅ Create client account → sets role = 'client'  
5. ✅ Book appointment as client
6. ✅ View dashboards → see real data!

