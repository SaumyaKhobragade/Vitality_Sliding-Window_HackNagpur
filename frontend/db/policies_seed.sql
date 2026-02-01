-- Seed data for policies table
-- Date: 2026-02-01

-- Insert default triage policies
INSERT INTO public.policies (id, name, description, is_active, is_alert_mode, severity_weight, aging_rate_minutes, enable_aging, distress_decay)
VALUES 
  ('policy_standard', 'Standard Triage', 'Balanced approach for normal hospital operations with standard aging and priority calculations.', true, false, 0.85, 15, true, 0.5),
  ('policy_surge', 'Surge Protocol', 'High-volume optimized policy that prioritizes throughput during patient surges.', false, false, 0.75, 10, true, 0.6),
  ('policy_crisis', 'Crisis Override', 'Emergency mass casualty protocol that overrides standard triage logic.', false, true, 0.95, 5, true, 0.3),
  ('policy_equity', 'Equity-Focused', 'Policy emphasizing wait time fairness to prevent long-waiting patients from being overlooked.', false, false, 0.70, 20, true, 0.5)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  severity_weight = EXCLUDED.severity_weight,
  aging_rate_minutes = EXCLUDED.aging_rate_minutes,
  enable_aging = EXCLUDED.enable_aging,
  distress_decay = EXCLUDED.distress_decay,
  updated_at = now();
