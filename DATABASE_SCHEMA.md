# H.I.T.S. Supabase Database Schema Documentation

## Overview
This document describes the complete database schema for the H.I.T.S. (Hire I.T. Specialists) application, including all tables, relationships, security policies, and helper functions.

## Database Tables

### 1. Users Table
**Purpose**: Stores user profiles and authentication information
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('client', 'specialist', 'admin')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key, references Supabase auth.users
- `name`: User's display name
- `email`: User's email address (unique)
- `role`: User role (client, specialist, admin)
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### 2. Specialists Table
**Purpose**: Stores specialist-specific information and credentials
```sql
CREATE TABLE specialists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  credentials TEXT,
  hourly_rate NUMERIC(10,2),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `user_id`: References users table (one-to-one)
- `verified`: Whether specialist is verified by admin
- `credentials`: Professional credentials and certifications
- `hourly_rate`: Specialist's hourly rate
- `bio`: Professional biography

### 3. Appointments Table
**Purpose**: Manages appointment bookings between clients and specialists
```sql
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  specialist_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  total_cost NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `client_id`: References users (client)
- `specialist_id`: References users (specialist)
- `date`: Appointment date
- `start_time`: Appointment start time
- `end_time`: Appointment end time
- `status`: Appointment status
- `total_cost`: Total cost of the appointment
- `description`: Appointment description/requirements

### 4. Payments Table
**Purpose**: Tracks payment information for appointments
```sql
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  method TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `appointment_id`: References appointments table
- `amount`: Payment amount
- `status`: Payment status
- `method`: Payment method (e.g., 'stripe', 'paypal')
- `stripe_payment_intent_id`: Stripe payment intent ID for tracking

### 5. Reviews Table
**Purpose**: Stores reviews and ratings for completed appointments
```sql
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `appointment_id`: References appointments table
- `reviewer_id`: References users (who wrote the review)
- `rating`: Rating from 1-5 stars
- `comment`: Review comment text

### 6. Availability Table
**Purpose**: Manages specialist availability schedules
```sql
CREATE TABLE availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  specialist_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  day TEXT CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `specialist_id`: References users (specialist)
- `day`: Day of the week
- `start_time`: Available start time
- `end_time`: Available end time
- `is_active`: Whether this availability slot is active

### 7. Disputes Table
**Purpose**: Handles dispute resolution between clients and specialists
```sql
CREATE TABLE disputes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `appointment_id`: References appointments table
- `raised_by`: References users (who raised the dispute)
- `reason`: Reason for the dispute
- `status`: Dispute status
- `resolution_notes`: Admin resolution notes
- `resolved_by`: References users (admin who resolved)
- `resolved_at`: Resolution timestamp

### 8. Logs Table
**Purpose**: Activity logging and audit trails
```sql
CREATE TABLE logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Primary key
- `user_id`: References users table
- `action`: Action performed
- `metadata`: Additional data in JSON format
- `ip_address`: User's IP address
- `user_agent`: User's browser/device info

## Row Level Security (RLS) Policies

### Security Principles
1. **Clients**: Can only view/edit their own data
2. **Specialists**: Can only see their own appointments and profile
3. **Admins**: Have full access to everything
4. **Public**: Can view verified specialists for browsing

### Key Policies

#### Users Table
- Users can view/update their own profile
- Admins can view/update all users
- Anyone can create a user profile (registration)

#### Specialists Table
- Specialists can manage their own profile
- Anyone can view verified specialists
- Admins have full access

#### Appointments Table
- Clients can view/create/update their own appointments
- Specialists can view/update appointments where they're the specialist
- Admins have full access

#### Payments Table
- Users can view payments for their appointments
- Clients can create payments for their appointments
- Admins have full access

#### Reviews Table
- Users can view/create reviews for appointments they're involved in
- Users can update their own reviews
- Admins have full access

#### Availability Table
- Specialists can manage their own availability
- Anyone can view active availability (for booking)
- Admins have full access

#### Disputes Table
- Users can view/create disputes for appointments they're involved in
- Users can update disputes they raised
- Admins have full access

#### Logs Table
- Users can view their own logs
- System can create logs
- Admins can view all logs

## Helper Functions

### Role Checking Functions
- `is_admin(user_id)`: Checks if user is admin
- `is_specialist(user_id)`: Checks if user is specialist
- `is_client(user_id)`: Checks if user is client

### Utility Functions
- `update_updated_at_column()`: Trigger function for updating timestamps
- `handle_new_user()`: Handles new user registration

## Indexes
Comprehensive indexes are created for optimal query performance:
- Email and role indexes on users
- User ID and verification status on specialists
- Client/specialist/date/status indexes on appointments
- Payment status and appointment ID indexes
- Review and availability indexes
- Dispute and log indexes

## Triggers
- Automatic `updated_at` timestamp updates on all tables
- Automatic user profile creation on auth registration

## Permissions
- Proper grants for `anon` and `authenticated` roles
- All necessary table and sequence permissions

This schema provides a robust foundation for the H.I.T.S. application with proper security, performance optimization, and data integrity.
