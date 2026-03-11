-- Andén POC — Supabase Schema
-- Run this in the Supabase SQL editor

-- Expedientes table
CREATE TABLE IF NOT EXISTS expedientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expediente_id TEXT UNIQUE,
  caso TEXT NOT NULL DEFAULT 'CASO_3',
  lec_status TEXT DEFAULT 'eligible',
  advisor_mode TEXT DEFAULT 'solo',
  status TEXT DEFAULT 'onboarding',
  payment_status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  amount_paid DECIMAL(10,2),
  paid_at TIMESTAMPTZ,
  onboarding_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;

-- Users can read their own expedientes
CREATE POLICY "Users can read own expediente"
  ON expedientes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own expediente
CREATE POLICY "Users can insert own expediente"
  ON expedientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own expediente
CREATE POLICY "Users can update own expediente"
  ON expedientes FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do everything (for webhook)
CREATE POLICY "Service role full access"
  ON expedientes FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expedientes_updated_at
  BEFORE UPDATE ON expedientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
