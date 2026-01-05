-- Create database schema for Recruit Connect

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  job_title VARCHAR(255),
  company VARCHAR(255),
  location VARCHAR(255),
  skills TEXT[],
  notes TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'not_interested', 'scheduled', 'hired', 'rejected')),
  linkedin_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Phone numbers table
CREATE TABLE phone_numbers (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  label VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company profiles table
CREATE TABLE company_profiles (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
  phone_number_id INTEGER REFERENCES phone_numbers(id) ON DELETE SET NULL,
  company_profile_id INTEGER REFERENCES company_profiles(id) ON DELETE SET NULL,
  bolna_call_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer', 'busy')),
  outcome VARCHAR(50) CHECK (outcome IN ('interested', 'not_interested', 'callback_requested', 'wrong_number', 'voicemail', 'no_response')),
  duration_seconds INTEGER,
  transcript TEXT,
  summary TEXT,
  notes TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);