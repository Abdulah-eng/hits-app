-- H.I.T.S. (Hire I.T. Specialists) Database Schema
-- Supabase PostgreSQL Schema with Row Level Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('client', 'specialist', 'admin')) DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Specialists table
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

-- 3. Appointments table
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

-- 4. Payments table
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

-- 5. Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Availability table
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

-- 7. Disputes table
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

-- 8. Logs table
CREATE TABLE logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_specialists_user_id ON specialists(user_id);
CREATE INDEX idx_specialists_verified ON specialists(verified);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_specialist_id ON appointments(specialist_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_availability_specialist_id ON availability(specialist_id);
CREATE INDEX idx_availability_day ON availability(day);
CREATE INDEX idx_disputes_appointment_id ON disputes(appointment_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is specialist
CREATE OR REPLACE FUNCTION is_specialist(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'specialist'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is client
CREATE OR REPLACE FUNCTION is_client(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'client'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for USERS table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (is_admin(auth.uid()));

-- Anyone can create a user profile (for registration)
CREATE POLICY "Anyone can create user profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for SPECIALISTS table
-- Specialists can view their own specialist profile
CREATE POLICY "Specialists can view own profile" ON specialists
  FOR SELECT USING (auth.uid() = user_id);

-- Specialists can update their own specialist profile
CREATE POLICY "Specialists can update own profile" ON specialists
  FOR UPDATE USING (auth.uid() = user_id);

-- Specialists can insert their own specialist profile
CREATE POLICY "Specialists can create own profile" ON specialists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can view verified specialists (for browsing)
CREATE POLICY "Anyone can view verified specialists" ON specialists
  FOR SELECT USING (verified = TRUE);

-- Admins can view all specialists
CREATE POLICY "Admins can view all specialists" ON specialists
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all specialists
CREATE POLICY "Admins can update all specialists" ON specialists
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for APPOINTMENTS table
-- Clients can view their own appointments
CREATE POLICY "Clients can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = client_id);

-- Specialists can view appointments where they are the specialist
CREATE POLICY "Specialists can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = specialist_id);

-- Clients can create appointments
CREATE POLICY "Clients can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own appointments (for cancellation)
CREATE POLICY "Clients can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = client_id);

-- Specialists can update appointments where they are the specialist (for status changes)
CREATE POLICY "Specialists can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = specialist_id);

-- Admins can view all appointments
CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all appointments
CREATE POLICY "Admins can update all appointments" ON appointments
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for PAYMENTS table
-- Users can view payments for their appointments
CREATE POLICY "Users can view own appointment payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = payments.appointment_id 
      AND (appointments.client_id = auth.uid() OR appointments.specialist_id = auth.uid())
    )
  );

-- Users can create payments for their appointments
CREATE POLICY "Users can create payments for own appointments" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = payments.appointment_id 
      AND appointments.client_id = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all payments
CREATE POLICY "Admins can update all payments" ON payments
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for REVIEWS table
-- Users can view reviews for appointments they're involved in
CREATE POLICY "Users can view reviews for own appointments" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = reviews.appointment_id 
      AND (appointments.client_id = auth.uid() OR appointments.specialist_id = auth.uid())
    )
  );

-- Users can create reviews for appointments they're involved in
CREATE POLICY "Users can create reviews for own appointments" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = reviews.appointment_id 
      AND (appointments.client_id = auth.uid() OR appointments.specialist_id = auth.uid())
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all reviews
CREATE POLICY "Admins can update all reviews" ON reviews
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for AVAILABILITY table
-- Specialists can view their own availability
CREATE POLICY "Specialists can view own availability" ON availability
  FOR SELECT USING (auth.uid() = specialist_id);

-- Specialists can update their own availability
CREATE POLICY "Specialists can update own availability" ON availability
  FOR UPDATE USING (auth.uid() = specialist_id);

-- Specialists can create their own availability
CREATE POLICY "Specialists can create own availability" ON availability
  FOR INSERT WITH CHECK (auth.uid() = specialist_id);

-- Anyone can view active availability (for booking)
CREATE POLICY "Anyone can view active availability" ON availability
  FOR SELECT USING (is_active = TRUE);

-- Admins can view all availability
CREATE POLICY "Admins can view all availability" ON availability
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all availability
CREATE POLICY "Admins can update all availability" ON availability
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for DISPUTES table
-- Users can view disputes for appointments they're involved in
CREATE POLICY "Users can view disputes for own appointments" ON disputes
  FOR SELECT USING (
    auth.uid() = raised_by OR
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = disputes.appointment_id 
      AND (appointments.client_id = auth.uid() OR appointments.specialist_id = auth.uid())
    )
  );

-- Users can create disputes for appointments they're involved in
CREATE POLICY "Users can create disputes for own appointments" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() = raised_by AND
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = disputes.appointment_id 
      AND (appointments.client_id = auth.uid() OR appointments.specialist_id = auth.uid())
    )
  );

-- Users can update disputes they raised
CREATE POLICY "Users can update own disputes" ON disputes
  FOR UPDATE USING (auth.uid() = raised_by);

-- Admins can view all disputes
CREATE POLICY "Admins can view all disputes" ON disputes
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all disputes
CREATE POLICY "Admins can update all disputes" ON disputes
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for LOGS table
-- Users can view their own logs
CREATE POLICY "Users can view own logs" ON logs
  FOR SELECT USING (auth.uid() = user_id);

-- System can create logs (this would typically be done server-side)
CREATE POLICY "System can create logs" ON logs
  FOR INSERT WITH CHECK (true);

-- Admins can view all logs
CREATE POLICY "Admins can view all logs" ON logs
  FOR SELECT USING (is_admin(auth.uid()));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specialists_updated_at BEFORE UPDATE ON specialists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract user metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::TEXT,
    'client'
  );

  -- Insert into users table
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_role
  );

  -- If user role is 'specialist', also insert into specialists table
  IF user_role = 'specialist' THEN
    INSERT INTO public.specialists (user_id, verified, credentials, hourly_rate, bio)
    VALUES (
      NEW.id,
      FALSE, -- New specialists start as unverified
      NULL,
      NULL,
      NULL
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (optional, only if you have error logging)
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute permission on helper functions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_specialist(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_client(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;

-- Note: SECURITY DEFINER functions bypass RLS, so no explicit INSERT grants needed
-- The handle_new_user function will run with elevated privileges
