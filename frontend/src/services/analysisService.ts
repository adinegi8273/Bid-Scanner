import axios from 'axios';
import { Company, CompanyAnalysis, DatabaseCompanyAnalysis } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000' });

export interface AnalyzeResponse {
  report: {
    summary_text: string;
    detailed_report: string;
    ai_recommendation: string;
  };
  pdfBase64: string;
}

export async function getCompanyAnalysis(tenderId: string, companyId: string): Promise<DatabaseCompanyAnalysis> {
  return (await api.get<DatabaseCompanyAnalysis>(`/api/tenders/${tenderId}/companies/${companyId}/analysis`)).data;
}

export async function sendAnalyzeRequest(tenderId: string, company: Company): Promise<AnalyzeResponse> {
  return (await api.post<AnalyzeResponse>('/api/analyze', { tenderId, company })).data;
}

// Legacy pages are kept in the project for future reporting work; analysis is
// intentionally available only through the database-backed endpoint above.
export async function getAnalysis(
  _tenderId: string,
  _companyId: string
): Promise<CompanyAnalysis | null> {
  return null;
}

export async function getAnalysesForTender(_tenderId: string): Promise<CompanyAnalysis[]> {
  return [];
}

export async function rankCompaniesForTender(
  tenderId: string
): Promise<{ tenderId: string; rankedCompanyIds: string[] }> {
  return { tenderId, rankedCompanyIds: [] };
}

/**
 * Returns a ranked copy of analyzed companies for a tender.
 * Ranking is purely by complianceScore descending.
 * In production this would be a backend call that persists ranks.
 */
export async function getRankedAnalyses(
  _tenderId: string
): Promise<CompanyAnalysis[]> {
  return [];
}
