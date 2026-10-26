export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Job {
  id: number;
  name: string;
  description: string | null;
  available: boolean;
  date: string;
  category: Category | null;
}

export interface JobRequest {
  name: string;
  description: string | null;
  available: boolean;
  date: string;
  categoryId: number;
}

export interface Address {
  id?: number;
  street: string | null;
  houseNumber: string | null;
  zipCode: string | null;
}

export interface Candidate {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  address: Address | null;
}

export interface CandidateRequest {
  firstname: string;
  lastname: string;
  email: string;
  address: Omit<Address, 'id'> | null;
}

export interface Application {
  id: number;
  motivation: string;
  applicationDate: string;
  candidate: Candidate;
  job: Job;
}

export interface ApplicationRequest {
  candidateId: number;
  jobId: number;
  motivation: string;
}
