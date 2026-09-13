/**
 * analysisService.ts
 *
 * Interface for compliance analysis API calls.
 * Mock-backed; replace bodies with axios calls when backend is ready.
 */

import { CompanyAnalysis } from '../types';
import { newMockAnalyses, newMockCompanies } from '../data/newMockData';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function getAnalysis(
  tenderId: string,
  companyId: string
): Promise<CompanyAnalysis | null> {
  await delay();
  return (
    newMockAnalyses.find(
      (a) => a.tenderId === tenderId && a.companyId === companyId
    ) ?? null
  );
}

export async function getAnalysesForTender(
  tenderId: string
): Promise<CompanyAnalysis[]> {
  await delay();
  return newMockAnalyses.filter((a) => a.tenderId === tenderId);
}

export async function rankCompaniesForTender(
  tenderId: string
): Promise<{ tenderId: string; rankedCompanyIds: string[] }> {
  await delay(450);

  const companiesForTender = newMockCompanies.filter((company) =>
    company.id.startsWith('comp-')
  );

  const rankedCompanyIds = [...companiesForTender]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((company) => company.id);

  return {
    tenderId,
    rankedCompanyIds,
  };
}

/**
 * Returns a ranked copy of analyzed companies for a tender.
 * Ranking is purely by complianceScore descending.
 * In production this would be a backend call that persists ranks.
 */
export async function getRankedAnalyses(
  tenderId: string
): Promise<CompanyAnalysis[]> {
  await delay(200);
  const analyses = newMockAnalyses
    .filter((a) => a.tenderId === tenderId && a.analysisStatus === 'Analyzed')
    .sort((a, b) => b.complianceScore - a.complianceScore)
    .map((a, i) => ({ ...a, rank: i + 1 }));
  return analyses;
}
