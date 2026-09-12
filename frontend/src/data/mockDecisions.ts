import { OfficerDecisionRecord } from '../types';

/**
 * Pre-seeded officer decisions for completed tenders.
 * In production these would be loaded from the backend audit trail.
 */
export const mockDecisions: OfficerDecisionRecord[] = [
  {
    companyId: 'comp-002',
    tenderId: 'tender-004',
    decision: 'Qualify',
    remarks:
      'XYZ Systems Ltd meets all eligibility criteria for this Annual Rate Contract. GeM seller account has an excellent rating (4.8/5) with 213 fulfilled orders and full statutory compliance across all criteria. Recommended for ARC contract award.',
    decidedAt: '2026-08-30T11:22:00Z',
    officerId: 'off-001',
  },
  {
    companyId: 'comp-004',
    tenderId: 'tender-004',
    decision: 'Disqualify',
    remarks:
      'Disqualified as per GFR 2017 Rule 151. GeM seller account is under suspension due to 3 unfulfilled orders. Active MoD debarment order (No. MoD/DIR/2024/1923, effective 01-01-2025) is an absolute bar for central government procurement. GST non-compliance with outstanding dues of ₹1,42,000 further supports this decision.',
    decidedAt: '2026-08-30T11:45:00Z',
    officerId: 'off-001',
  },
];
