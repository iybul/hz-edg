CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE sqf_category AS ENUM (
  'food_manufacturing',
  'primary_production',
  'storage_distribution',
  'food_packaging',
  'quality_code',
  'other'
);

CREATE TYPE document_status AS ENUM (
  'pending',
  'completed'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sqf_category sqf_category NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE questionnaire_responses (
  facility_id UUID PRIMARY KEY REFERENCES facilities(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  s3_url TEXT,
  status document_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_facilities_user_id ON facilities(user_id);
CREATE INDEX idx_documents_facility_id ON documents(facility_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_questionnaire_responses_data ON questionnaire_responses USING GIN (data);
