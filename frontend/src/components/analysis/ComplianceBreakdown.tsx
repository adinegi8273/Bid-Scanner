import { useState } from 'react';
import { ComplianceCriterion } from '../../types';
import { CriterionStatusBadge } from '../ui/StatusBadge';

interface Props {
  criteria: ComplianceCriterion[];
}

export function ComplianceBreakdown({ criteria }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="table-wrapper">
      <table className="criterion-table">
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Status</th>
            <th>Score</th>
            <th>Evidence & Explanation</th>
          </tr>
        </thead>
        <tbody>
          {criteria.map((c) => (
            <>
              <tr key={c.id}>
                <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{c.name}</td>
                <td><CriterionStatusBadge status={c.status} /></td>
                <td>
                  <span style={{ fontWeight: 700 }}>{c.score}</span>
                  <span className="text-muted">/{c.maxScore}</span>
                </td>
                <td>
                  <div>{c.evidence}</div>
                  <button className="criterion-expand" onClick={() => toggle(c.id)}>
                    {expanded === c.id ? '▲ Hide explanation' : '▼ Show explanation'}
                  </button>
                  {expanded === c.id && (
                    <div className="criterion-evidence mt-2" style={{ background: 'var(--color-surface-2)', padding: '8px 10px', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--color-border-strong)' }}>
                      {c.explanation}
                    </div>
                  )}
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
