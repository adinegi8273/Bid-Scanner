/**
 * tenderService.ts
 *
 * Interface for tender-related API calls.
 * Currently backed by mock data; swap the implementation with real axios calls
 * when the backend is available. Keep the signatures stable.
 */

import { Tender } from '../types';
import { newMockTenders } from '../data/newMockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function getTenders(): Promise<Tender[]> {
  await delay();
  return [...newMockTenders];
}

export async function getTenderById(id: string): Promise<Tender | null> {
  await delay();
  return newMockTenders.find((t) => t.id === id) ?? null;
}
