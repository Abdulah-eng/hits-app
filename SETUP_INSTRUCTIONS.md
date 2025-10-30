# Setup Instructions for H.I.T.S. App

## Prerequisites
- A Supabase project (get one at https://supabase.com)
- Node.js installed

## Step 1: Create Environment File

Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration (Optional - add later)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# SendGrid Configuration (Optional - add later)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@hits-app.com

# Twilio Configuration (Optional - add later)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
CRON_SECRET=your_cron_secret_key
```

**Where to find your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click on "Project Settings" → "API"
3. Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open the `supabase-schema.sql` file in this project
5. Copy the entire contents of the file
6. Paste it into the SQL Editor in Supabase
7. Click "Run" to execute the query

This will create all the necessary tables, policies, triggers, and functions for the H.I.T.S. app.

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 5: Test the Sign Up

1. Navigate to `http://localhost:3000/auth/sign-up`
2. Try creating an account
3. The signup should now work without errors!

## Troubleshooting

### "500 Internal Server Error" on signup

If you still get a 500 error:
1. Check your `.env.local` file has the correct Supabase credentials
2. Make sure the schema was successfully applied in Supabase (check the SQL Editor for any errors)
3. Restart your development server: Stop it (Ctrl+C) and run `npm run dev` again
4. Check the Supabase Dashboard → Project Settings → Database → for any errors

### "Missing environment variables" error

Make sure your `.env.local` file is in the root directory (same level as `package.json`) and has all required variables from the template above.

### Database errors

If you encounter database errors, check:
1. The Supabase SQL Editor → Query History for any failed queries
2. That all tables were created successfully (Supabase Dashboard → Database → Tables)
3. That RLS policies are active (Supabase Dashboard → Authentication → Policies)

## Additional Setup (Optional)

### Email Verification

To enable email verification:
1. Go to Supabase Dashboard → Authentication → Settings
2. Configure your email provider settings
3. Enable "Confirm email" in email templates

### Stripe Integration

1. Get your Stripe API keys from https://stripe.com
2. Add them to your `.env.local` file
3. Configure webhook endpoints in Stripe Dashboard

### SendGrid Integration

1. Get your SendGrid API key from https://sendgrid.com
2. Add it to your `.env.local` file

### Twilio Integration

1. Get your Twilio credentials from https://twilio.com
2. Add them to your `.env.local` file

## Database Schema Overview

The app uses the following main tables:
- `users` - User profiles
- `specialists` - Specialist-specific information
- `appointments` - Booking management
- `payments` - Payment tracking
- `reviews` - User reviews and ratings
- `availability` - Specialist availability schedules
- `disputes` - Dispute management
- `logs` - Activity logging

All tables use Row Level Security (RLS) to ensure users can only access their own data.

