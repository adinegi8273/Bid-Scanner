/**
 * companyService.ts
 *
 * Interface for company-related API calls.
 * Mock-backed; replace bodies with axios calls when backend is ready.
 */

import { Company } from '../types';
import { newMockCompanies } from '../data/newMockData';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function getCompanyById(id: string): Promise<Company | null> {
  await delay();
  return newMockCompanies.find((c) => c.id === id) ?? null;
}

export async function getCompaniesByIds(ids: string[]): Promise<Company[]> {
  await delay();
  return newMockCompanies.filter((c) => ids.includes(c.id));
}
