# H.I.T.S. (Hire I.T. Specialists)

A full-stack Next.js 14 application for connecting clients with IT specialists, featuring secure payments, real-time communication, and project management.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: SendGrid
- **SMS**: Twilio
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account
- SendGrid account
- Twilio account

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd hits-app
npm install
```

### 2. Environment Variables

Copy the environment template and fill in your credentials:

```bash
cp env.template .env.local
```

Update `.env.local` with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@hits-app.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 3. Supabase Database Setup

Run the complete SQL schema from `supabase-schema.sql` in your Supabase SQL editor. This will create all necessary tables with proper relationships, indexes, and Row Level Security policies.

The schema includes:

- **users**: User profiles with roles (client, specialist, admin)
- **specialists**: Specialist-specific information (verification, credentials, rates)
- **appointments**: Booking system with date/time slots
- **payments**: Payment tracking with Stripe integration
- **reviews**: Rating and review system
- **availability**: Specialist availability schedules
- **disputes**: Dispute resolution system
- **logs**: Activity logging for audit trails

**Key Features:**
- Complete Row Level Security (RLS) policies
- Automatic user registration triggers
- Comprehensive indexes for performance
- Proper foreign key relationships
- Audit trails with created_at/updated_at timestamps

To set up the database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the script

The schema includes helper functions and policies that ensure:
- Clients can only view/edit their own data
- Specialists can only see their own appointments
- Admins have full access to everything
- Public access to verified specialists for browsing

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   └── ui/             # Shadcn/UI components
├── lib/                 # Utility functions and configurations
│   ├── supabaseClient.ts    # Supabase client setup
│   ├── stripe.ts            # Stripe configuration
│   ├── sendgrid.ts          # Email service
│   └── twilio.ts            # SMS service
└── types/               # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

The app is ready to be deployed on Vercel, Netlify, or any other platform that supports Next.js.

Make sure to:
1. Set all environment variables in your deployment platform
2. Configure your Supabase project for production
3. Update webhook URLs for Stripe, SendGrid, and Twilio

## 📝 Features

- **User Authentication**: Sign up/sign in with Supabase Auth
- **Role-based Access**: Clients, Specialists, and Admins with different permissions
- **Appointment System**: Book and manage appointments with IT specialists
- **Availability Management**: Specialists can set their available time slots
- **Payment Processing**: Secure payments with Stripe integration
- **Review System**: Rate and review completed appointments
- **Dispute Resolution**: Handle conflicts between clients and specialists
- **Activity Logging**: Comprehensive audit trails for all actions
- **Communication**: Email and SMS notifications via SendGrid and Twilio
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.