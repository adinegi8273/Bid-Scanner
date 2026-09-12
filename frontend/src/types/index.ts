// ─── Core Domain Types ──────────────────────────────────────────────────────

export type TenderStatus = 'Active' | 'Completed' | 'Pending Review' | 'Expired';

export type AnalysisStatus = 'Analyzed' | 'Pending' | 'In Progress';

export type ComplianceStatus =
  | 'Highly Compliant'
  | 'Compliant'
  | 'Needs Review'
  | 'Non-Compliant';

export type CriterionStatus = 'Passed' | 'Failed' | 'Warning' | 'Not Verified';

export type OfficerDecisionType =
  | 'Qualify'
  | 'Disqualify'
  | 'Needs Further Review';

// ─── Entity Types ────────────────────────────────────────────────────────────

export interface Officer {
  id: string;
  name: string;
  officerId: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  officeLocation: string;
}

export interface Tender {
  id: string;
  title: string;
  department: string;
  category: string;
  description: string;
  value: number; // INR
  deadline: string; // ISO date string
  eligibilityRequirements: string[];
  complianceCriteria: string[];
  status: TenderStatus;
  bidderIds: string[];
}

export interface Company {
  id: string;
  name: string;
  cin: string;
  gstin: string;
  pan: string;
  registeredAddress: string;
  companyType: string; // e.g. "Private Limited", "Public Limited"
  msmeCategory?: string; // "Micro" | "Small" | "Medium"
}

export interface ComplianceCriterion {
  id: string;
  name: string;
  status: CriterionStatus;
  score: number;
  maxScore: number;
  evidence: string;
  explanation: string;
}

export interface AIAnalysis {
  companyId: string;
  tenderId: string;
  overallConclusion: string;
  strengths: string[];
  weaknesses: string[];
  missingDocuments: string[];
  warnings: string[];
  importantFindings: string[];
  scoreReason: string;
  recommendationForOfficer: string;
  generatedAt: string; // ISO date string
}

export interface CompanyAnalysis {
  companyId: string;
  tenderId: string;
  analysisStatus: AnalysisStatus;
  complianceScore: number; // 0–100
  complianceStatus: ComplianceStatus;
  rank: number | null; // null until ranked
  criteria: ComplianceCriterion[];
  aiAnalysis: AIAnalysis | null;
  analyzedAt: string | null; // ISO date string
}

export interface OfficerDecisionRecord {
  companyId: string;
  tenderId: string;
  decision: OfficerDecisionType | null;
  remarks: string;
  decidedAt: string | null;
  officerId: string;
}

// ─── View Helpers ─────────────────────────────────────────────────────────────

/** Company with its analysis pre-joined — used in tender detail table */
export interface CompanyWithAnalysis {
  company: Company;
  analysis: CompanyAnalysis | null;
}
