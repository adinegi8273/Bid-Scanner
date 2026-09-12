/**
 * officerService.ts
 *
 * Interface for officer profile API calls.
 * Mock-backed; replace with real API when backend is ready.
 */

import { Officer } from '../types';
import { mockOfficer } from '../data/mockOfficer';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export async function getOfficerProfile(): Promise<Officer> {
  await delay();
  return { ...mockOfficer };
}

export async function updateOfficerProfile(updates: Partial<Officer>): Promise<Officer> {
  await delay(400);
  // ponytail: in-memory only; real API would persist to backend
  Object.assign(mockOfficer, updates);
  return { ...mockOfficer };
}
