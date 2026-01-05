export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  user_id: string;
  phone_number: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
}

export type CandidateStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'scheduled' | 'hired' | 'rejected';

export interface Candidate {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  job_title: string | null;
  company: string | null;
  location: string | null;
  skills: string[] | null;
  notes: string | null;
  status: CandidateStatus;
  resume_url: string | null;
  linkedin_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CallStatus = 'initiated' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
export type CallOutcome = 'interested' | 'not_interested' | 'callback_requested' | 'wrong_number' | 'voicemail' | 'no_response';

export interface Call {
  id: string;
  user_id: string;
  candidate_id: string | null;
  phone_number_id: string | null;
  company_profile_id: string | null;
  bolna_call_id: string | null;
  status: CallStatus;
  outcome: CallOutcome | null;
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  notes: string | null;
  started_at: string;
  ended_at: string | null;
  // Joined fields
  candidate?: Candidate;
  phone_number?: PhoneNumber;
  company_profile?: CompanyProfile;
}
