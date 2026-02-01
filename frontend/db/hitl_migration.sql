-- Migration: Human-in-the-Loop Distress Workflow & Policy Integration
-- Date: 2026-02-01

-- 1. Create triage_policies table for flexible key-value configuration
CREATE TABLE IF NOT EXISTS public.triage_policies (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    key text NOT NULL UNIQUE,
    value text NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT triage_policies_pkey PRIMARY KEY (id)
);

-- Seed initial HITL and Triage constants
INSERT INTO public.triage_policies (key, value, description)
VALUES 
('distress_provisional_boost', '50', 'Priority points added immediately when distress is detected (Provisional)'),
('distress_provisional_timeout', '120', 'Seconds before a pending distress signal expires and boost is rolled back'),
('distress_confirmed_boost', '100', 'Total priority points added once a nurse confirms the distress signal'),
('severity_weight', '10.0', 'Multiplier for base severity in priority calculation'),
('aging_factor', '0.5', 'Points added per minute of waiting time');

-- 2. Update distress_events table to support HITL state machine
-- Note: schema.sql already has a status check, we'll update it to include EXPIRED
ALTER TABLE public.distress_events 
DROP CONSTRAINT IF EXISTS distress_events_status_check;

ALTER TABLE public.distress_events 
ADD CONSTRAINT distress_events_status_check 
CHECK (status = ANY (ARRAY['PENDING'::text, 'CONFIRMED'::text, 'DISMISSED'::text, 'EXPIRED'::text, 'active'::text, 'resolved'::text]));

-- Add HITL specific columns
ALTER TABLE public.distress_events
ADD COLUMN IF NOT EXISTS nurse_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS justification_note text,
ADD COLUMN IF NOT EXISTS priority_delta integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- 3. Update status of existing events if necessary
UPDATE public.distress_events SET status = 'PENDING' WHERE status = 'active';
