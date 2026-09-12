/**
 * DecisionContext.tsx
 *
 * Holds officer decisions (Qualify / Disqualify / Needs Further Review) in
 * React state for the duration of the session.
 *
 * Initialized with pre-seeded decisions from mockDecisions.ts so that
 * completed tenders already show their historical audit trail on first load.
 *
 * In production, decisions would be fetched from backend on mount and
 * persisted via POST/PUT after each save. The context interface stays stable.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { OfficerDecisionRecord, OfficerDecisionType } from '../types';
import { mockOfficer } from '../data/mockOfficer';
import { mockDecisions } from '../data/mockDecisions';

interface DecisionContextValue {
  decisions: Record<string, OfficerDecisionRecord>; // key: `${tenderId}::${companyId}`
  getDecision: (tenderId: string, companyId: string) => OfficerDecisionRecord | null;
  getDecisionsForTender: (tenderId: string) => OfficerDecisionRecord[];
  saveDecision: (
    tenderId: string,
    companyId: string,
    decision: OfficerDecisionType | null,
    remarks: string
  ) => void;
}

const DecisionContext = createContext<DecisionContextValue | null>(null);

// Build initial state from pre-seeded mock decisions (simulates loading from backend)
const seedDecisions = (): Record<string, OfficerDecisionRecord> => {
  const init: Record<string, OfficerDecisionRecord> = {};
  mockDecisions.forEach((d) => {
    init[`${d.tenderId}::${d.companyId}`] = d;
  });
  return init;
};

export function DecisionProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, OfficerDecisionRecord>>(seedDecisions);

  const getDecision = useCallback(
    (tenderId: string, companyId: string): OfficerDecisionRecord | null =>
      decisions[`${tenderId}::${companyId}`] ?? null,
    [decisions]
  );

  /** Returns all decisions recorded for a given tender (for progress counts). */
  const getDecisionsForTender = useCallback(
    (tenderId: string): OfficerDecisionRecord[] =>
      Object.values(decisions).filter(
        (d) => d.tenderId === tenderId && d.decision !== null
      ),
    [decisions]
  );

  const saveDecision = useCallback(
    (tenderId: string, companyId: string, decision: OfficerDecisionType | null, remarks: string) => {
      const key = `${tenderId}::${companyId}`;
      setDecisions((prev) => ({
        ...prev,
        [key]: {
          companyId,
          tenderId,
          decision,
          remarks,
          decidedAt: new Date().toISOString(),
          officerId: mockOfficer.id,
        },
      }));
    },
    []
  );

  return (
    <DecisionContext.Provider value={{ decisions, getDecision, getDecisionsForTender, saveDecision }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecisions() {
  const ctx = useContext(DecisionContext);
  if (!ctx) throw new Error('useDecisions must be used within DecisionProvider');
  return ctx;
}
