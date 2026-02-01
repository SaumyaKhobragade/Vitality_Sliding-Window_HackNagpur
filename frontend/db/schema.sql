-- Enable UUID extension for auto-generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES (Users)
-- Extends Supabase auth.users
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'doctor', 'nurse', 'viewer', 'triage_supervisor')),
  department TEXT, -- e.g., 'Emergency', 'Pediatrics'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. HOSPITALS
-- Facilities in the network
-- ==========================================
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT, -- e.g., 'Downtown', 'North District'
  max_capacity INTEGER DEFAULT 50,
  current_status TEXT CHECK (current_status IN ('normal', 'busy', 'critical', 'offline')) DEFAULT 'normal',
  active_treatments_count INTEGER DEFAULT 0,
  active_doctor_count INTEGER DEFAULT 0,
  total_queue_size INTEGER DEFAULT 0,
  specialties TEXT[], -- e.g., ['Trauma', 'Burn Unit', 'Pediatrics']
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. PATIENTS
-- Core patient tracking
-- ==========================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_id TEXT NOT NULL, -- e.g., "#8X29-A1"
  hospital_id UUID REFERENCES hospitals(id), -- Current location
  target_hospital_id UUID REFERENCES hospitals(id), -- Intended destination (if redirecting)
  
  -- Triage & Status
  base_severity INTEGER CHECK (base_severity BETWEEN 1 AND 10),
  priority_score FLOAT, -- Dynamic calculated score (e.g., 98.5)
  distress_score INTEGER, -- 0-100
  status TEXT CHECK (status IN ('Stable', 'Critical', 'Nearing Threshold', 'Discharged', 'Redirected', 'Waiting', 'Treating')) DEFAULT 'Waiting',
  
  -- Timing
  arrival_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Medical Info
  condition_description TEXT, -- e.g. "Sudden loss of posture"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. TREATMENTS
-- Active medical procedures
-- ==========================================
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  hospital_id UUID REFERENCES hospitals(id),
  
  type TEXT, -- e.g., 'Trauma', 'Cardiac', 'Orthopedic'
  doctor_name TEXT, -- e.g., 'Dr. Emily Chen'
  location TEXT, -- e.g., 'Surgery Unit A', 'ICU Bed 4'
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_duration_minutes INTEGER,
  progress INTEGER CHECK (progress BETWEEN 0 AND 100) DEFAULT 0,
  
  color_code TEXT, -- e.g., 'purple', 'blue', 'teal' (for UI mapping)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. DISTRESS EVENTS (Alerts)
-- AI-detected events (CCTV analysis)
-- Source: app/dashboard/alerts/page.tsx
-- ==========================================
CREATE TABLE distress_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id),
  
  type TEXT CHECK (type IN ('COLLAPSE', 'AGITATION', 'SEIZURE', 'PROLONGED', 'OTHER')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  severity_score INTEGER CHECK (severity_score BETWEEN 1 AND 10),
  
  location_detail TEXT, -- e.g., "Waiting Area B"
  camera_feed_id TEXT, -- e.g., "CAM-04"
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'confirmed', 'dismissed', 'resolved')) DEFAULT 'active',
  
  -- Context
  queue_position_original INTEGER,
  queue_position_new INTEGER,
  recommended_action TEXT,
  
  -- User feedback
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. REDIRECTION DECISIONS
-- Audit log for inter-hospital transfers
-- Source: app/dashboard/decision-monitor/page.tsx
-- ==========================================
CREATE TABLE redirection_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  from_hospital_id UUID REFERENCES hospitals(id),
  to_hospital_id UUID REFERENCES hospitals(id),
  
  decision_type TEXT CHECK (decision_type IN ('safe', 'conditional', 'standard')),
  reason TEXT, -- e.g., "Bed Availability < 5%"
  
  status TEXT CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'pending',
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  
  policy_applied TEXT, -- e.g., "POL-2023-A (Trauma Divert)"
  constraints TEXT[], -- e.g., ["Specialist: Neurologist", "Transport < 20m"]
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. NOTIFICATIONS
-- System-wide alerts for top navbar
-- Source: NotificationPopover.tsx
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('critical', 'warning', 'info', 'success')),
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  
  related_entity_id UUID, -- Polymorphic ID (could be hospital, patient, decision)
  related_entity_type TEXT, -- 'hospital', 'patient', 'decision'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 8. SIMULATION / AUDIT LOGS
-- Event stream for the simulation engine
-- Source: EventStream.tsx
-- ==========================================
CREATE TABLE simulation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT CHECK (level IN ('INFO', 'WARN', 'CRITICAL', 'SUCCESS', 'SYSTEM')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 9. ANALYTICS / STATS
-- Time-series snapshots for charts
-- Source: PatientFlowChart.tsx, LiveImpactAnalysis.tsx
-- ==========================================
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  hospital_id UUID REFERENCES hospitals(id), -- NULL for City-wide aggregation
  
  total_patients_waiting INTEGER DEFAULT 0,
  total_doctors_active INTEGER DEFAULT 0,
  total_treatments_active INTEGER DEFAULT 0,
  average_wait_time_minutes FLOAT,
  surge_active BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- 10. POLICIES
-- Configuration for triage logic
-- Source: app/dashboard/policy-config/page.tsx
-- ==========================================
CREATE TABLE policies (
  id TEXT PRIMARY KEY, -- e.g. 'ADAPTIVE', 'STATIC_TRIAGE_V1'
  name TEXT NOT NULL,
  description TEXT,
  
  is_active BOOLEAN DEFAULT FALSE,
  is_alert_mode BOOLEAN DEFAULT FALSE, -- e.g., Crisis Override
  
  -- Configurable Parameters
  severity_weight FLOAT DEFAULT 0.85,
  aging_rate_minutes INTEGER DEFAULT 15,
  enable_aging BOOLEAN DEFAULT TRUE,
  distress_decay FLOAT DEFAULT 0.5,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- ==========================================
-- RLS (Row Level Security) - Basic Setup
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE distress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirection_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users for demo purposes
-- (In production, you'd want stricter policies)
CREATE POLICY "Public read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON patients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON treatments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON distress_events FOR SELECT USING (true);
CREATE POLICY "Public read access" ON redirection_decisions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public read access" ON simulation_logs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON analytics_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read access" ON policies FOR SELECT USING (true);

-- Allow service role (and maybe staff) to insert/update
-- For hackathon/demo, authenticated users can often do everything
CREATE POLICY "Auth users full access" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON hospitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON treatments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON distress_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON redirection_decisions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON simulation_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON analytics_snapshots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users full access" ON policies FOR ALL USING (auth.role() = 'authenticated');