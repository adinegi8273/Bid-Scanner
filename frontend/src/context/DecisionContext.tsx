/**
 * DecisionContext.tsx
 *
 * Holds officer decisions (Qualify / Disqualify / Needs Further Review) in
 * React state for the duration of the session.
 *
 * In production, decisions would be persisted to the backend via a POST/PUT
 * call after each save. The context interface stays the same; only the service
 * call inside saveDecision() changes.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { OfficerDecisionRecord, OfficerDecisionType } from '../types';
import { mockOfficer } from '../data/mockOfficer';

interface DecisionContextValue {
  decisions: Record<string, OfficerDecisionRecord>; // key: `${tenderId}::${companyId}`
  getDecision: (tenderId: string, companyId: string) => OfficerDecisionRecord | null;
  saveDecision: (
    tenderId: string,
    companyId: string,
    decision: OfficerDecisionType | null,
    remarks: string
  ) => void;
}

const DecisionContext = createContext<DecisionContextValue | null>(null);

export function DecisionProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, OfficerDecisionRecord>>({});

  const getDecision = useCallback(
    (tenderId: string, companyId: string): OfficerDecisionRecord | null => {
      return decisions[`${tenderId}::${companyId}`] ?? null;
    },
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
    <DecisionContext.Provider value={{ decisions, getDecision, saveDecision }}>
      {children}
    </DecisionContext.Provider>
  );
}

export function useDecisions() {
  const ctx = useContext(DecisionContext);
  if (!ctx) throw new Error('useDecisions must be used within DecisionProvider');
  return ctx;
}
