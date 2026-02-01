-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accounts (
  id text NOT NULL,
  user_id text NOT NULL,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamp with time zone,
  refresh_token_expires_at timestamp with time zone,
  scope text,
  password text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.analytics_snapshots (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  timestamp timestamp with time zone DEFAULT now(),
  hospital_id uuid,
  total_patients_waiting integer DEFAULT 0,
  total_doctors_active integer DEFAULT 0,
  total_treatments_active integer DEFAULT 0,
  average_wait_time_minutes double precision,
  surge_active boolean DEFAULT false,
  CONSTRAINT analytics_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_snapshots_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.distress_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  hospital_id uuid,
  type text CHECK (type = ANY (ARRAY['COLLAPSE'::text, 'AGITATION'::text, 'SEIZURE'::text, 'PROLONGED'::text, 'OTHER'::text])),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  severity_score integer CHECK (severity_score >= 1 AND severity_score <= 10),
  location_detail text,
  camera_feed_id text,
  detected_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'confirmed'::text, 'dismissed'::text, 'resolved'::text])),
  queue_position_original integer,
  queue_position_new integer,
  recommended_action text,
  resolution_notes text,
  resolved_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT distress_events_pkey PRIMARY KEY (id),
  CONSTRAINT distress_events_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT distress_events_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.hospitals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location text,
  max_capacity integer DEFAULT 50,
  current_status text DEFAULT 'normal'::text CHECK (current_status = ANY (ARRAY['normal'::text, 'busy'::text, 'critical'::text, 'offline'::text])),
  active_treatments_count integer DEFAULT 0,
  active_doctor_count integer DEFAULT 0,
  total_queue_size integer DEFAULT 0,
  specialties ARRAY,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hospitals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type text CHECK (type = ANY (ARRAY['critical'::text, 'warning'::text, 'info'::text, 'success'::text])),
  title text NOT NULL,
  description text,
  is_read boolean DEFAULT false,
  related_entity_id uuid,
  related_entity_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  display_id text NOT NULL,
  hospital_id uuid,
  target_hospital_id uuid,
  base_severity integer CHECK (base_severity >= 1 AND base_severity <= 10),
  priority_score double precision,
  distress_score integer,
  status text DEFAULT 'Waiting'::text CHECK (status = ANY (ARRAY['Stable'::text, 'Critical'::text, 'Nearing Threshold'::text, 'Discharged'::text, 'Redirected'::text, 'Waiting'::text, 'Treating'::text])),
  arrival_time timestamp with time zone DEFAULT now(),
  condition_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT patients_target_hospital_id_fkey FOREIGN KEY (target_hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.policies (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  is_alert_mode boolean DEFAULT false,
  severity_weight double precision DEFAULT 0.85,
  aging_rate_minutes integer DEFAULT 15,
  enable_aging boolean DEFAULT true,
  distress_decay double precision DEFAULT 0.5,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  CONSTRAINT policies_pkey PRIMARY KEY (id),
  CONSTRAINT policies_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  role text DEFAULT 'staff'::text CHECK (role = ANY (ARRAY['admin'::text, 'doctor'::text, 'nurse'::text, 'viewer'::text, 'triage_supervisor'::text])),
  department text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.redirection_decisions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid,
  from_hospital_id uuid,
  to_hospital_id uuid,
  decision_type text CHECK (decision_type = ANY (ARRAY['safe'::text, 'conditional'::text, 'standard'::text])),
  reason text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['completed'::text, 'pending'::text, 'failed'::text])),
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  policy_applied text,
  constraints ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT redirection_decisions_pkey PRIMARY KEY (id),
  CONSTRAINT redirection_decisions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT redirection_decisions_from_hospital_id_fkey FOREIGN KEY (from_hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT redirection_decisions_to_hospital_id_fkey FOREIGN KEY (to_hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.sessions (
  id text NOT NULL,
  user_id text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.simulation_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  level text CHECK (level = ANY (ARRAY['INFO'::text, 'WARN'::text, 'CRITICAL'::text, 'SUCCESS'::text, 'SYSTEM'::text])),
  message text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT simulation_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.treatments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  patient_id uuid,
  hospital_id uuid,
  type text,
  doctor_name text,
  location text,
  started_at timestamp with time zone DEFAULT now(),
  estimated_duration_minutes integer,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  color_code text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT treatments_pkey PRIMARY KEY (id),
  CONSTRAINT treatments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT treatments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean DEFAULT false,
  name text,
  image text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.verification_tokens (
  id text NOT NULL,
  identifier text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT verification_tokens_pkey PRIMARY KEY (id)
);