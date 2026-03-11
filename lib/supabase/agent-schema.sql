-- Andén Track 2.0 — Smart Fiduciae Schema
-- Run this in the Supabase SQL Editor after running schema.sql

CREATE TABLE IF NOT EXISTS agent_expedients (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  status               TEXT DEFAULT 'draft',           -- draft | paid | en_revision | en_proceso | completado

  -- Diagnostic
  agent_function       TEXT,
  agent_assets         TEXT[],
  agent_volume         TEXT,
  agent_autonomy       TEXT,
  agent_supervision    TEXT,
  has_company          BOOLEAN,
  company_type         TEXT,
  agent_scope          TEXT,

  -- Structure
  tier                 TEXT DEFAULT 'professional',     -- starter | professional | enterprise
  scenario             INTEGER DEFAULT 2,

  -- Parameters
  limit_per_tx         NUMERIC,
  limit_daily          NUMERIC,
  limit_monthly        NUMERIC,
  allowed_assets       TEXT[],
  prohibited_assets    TEXT,
  override_conditions  TEXT[],
  override_drop_pct    NUMERIC,
  override_tx_threshold NUMERIC,
  beneficiary_type     TEXT,
  beneficiary_details  JSONB,

  -- Meta
  stripe_session_id    TEXT,
  amount_paid          NUMERIC,
  paid_at              TIMESTAMPTZ,
  is_founding_member   BOOLEAN DEFAULT TRUE,
  internal_notes       TEXT
);

-- RLS
ALTER TABLE agent_expedients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own agent expedient"
  ON agent_expedients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent expedient"
  ON agent_expedients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent expedient"
  ON agent_expedients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on agent_expedients"
  ON agent_expedients FOR ALL USING (auth.role() = 'service_role');

-- updated_at trigger (reuses function from schema.sql)
CREATE TRIGGER update_agent_expedients_updated_at
  BEFORE UPDATE ON agent_expedients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
