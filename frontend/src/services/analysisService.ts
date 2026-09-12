/**
 * analysisService.ts
 *
 * Interface for compliance analysis API calls.
 * Mock-backed; replace bodies with axios calls when backend is ready.
 */

import { CompanyAnalysis } from '../types';
import { mockAnalyses } from '../data/mockAnalysis';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function getAnalysis(
  tenderId: string,
  companyId: string
): Promise<CompanyAnalysis | null> {
  await delay();
  return (
    mockAnalyses.find(
      (a) => a.tenderId === tenderId && a.companyId === companyId
    ) ?? null
  );
}

export async function getAnalysesForTender(
  tenderId: string
): Promise<CompanyAnalysis[]> {
  await delay();
  return mockAnalyses.filter((a) => a.tenderId === tenderId);
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
  const analyses = mockAnalyses
    .filter((a) => a.tenderId === tenderId && a.analysisStatus === 'Analyzed')
    .sort((a, b) => b.complianceScore - a.complianceScore)
    .map((a, i) => ({ ...a, rank: i + 1 }));
  return analyses;
}
