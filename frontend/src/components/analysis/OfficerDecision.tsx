import { useState } from 'react';
import { OfficerDecisionType } from '../../types';
import { useDecisions } from '../../context/DecisionContext';

interface Props {
  tenderId: string;
  companyId: string;
}

const options: { value: OfficerDecisionType; label: string; sub: string; selClass: string }[] = [
  { value: 'Qualify',              label: '✅ Qualify',              sub: 'Company meets all compliance requirements',        selClass: 'selected-qualify' },
  { value: 'Disqualify',           label: '❌ Disqualify',           sub: 'Company fails critical compliance criteria',       selClass: 'selected-disqualify' },
  { value: 'Needs Further Review', label: '⏳ Needs Further Review', sub: 'Seek clarifications before final decision',        selClass: 'selected-review' },
];

export function OfficerDecision({ tenderId, companyId }: Props) {
  const { getDecision, saveDecision } = useDecisions();
  const existing = getDecision(tenderId, companyId);

  const [selected, setSelected] = useState<OfficerDecisionType | null>(existing?.decision ?? null);
  const [remarks, setRemarks] = useState(existing?.remarks ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveDecision(tenderId, companyId, selected, remarks);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="decision-panel">
      <div className="decision-panel-header">
        ⚖️ Procurement Officer Decision
        <span style={{ fontWeight: 400, fontSize: '0.78rem', marginLeft: 8, opacity: .8 }}>
          — This decision is made by the Officer, not by AI
        </span>
      </div>

      {/* IMPORTANT notice */}
      <div style={{ background: '#fef9c3', borderBottom: '1px solid #fef08a', padding: '10px 16px', fontSize: '0.8rem', color: '#713f12' }}>
        <strong>⚠️ Important:</strong> Artificial Intelligence has been used for decision support only. The final qualification decision is the sole responsibility of the Procurement Officer and must comply with GFR 2017 and GeM procurement guidelines.
      </div>

      <div className="decision-options">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`decision-btn${selected === opt.value ? ` ${opt.selClass}` : ''}`}
            onClick={() => setSelected(opt.value)}
          >
            <span className="decision-btn-label">{opt.label}</span>
            <span className="decision-btn-sub">{opt.sub}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <label className="form-label" htmlFor="remarks">
          Officer Remarks <span className="text-muted">(required for Disqualify / Further Review)</span>
        </label>
        <textarea
          id="remarks"
          className="form-textarea"
          placeholder="Record your rationale, references to applicable GFR rules, and any notes for the audit trail..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            className="btn btn-primary"
            disabled={!selected}
            onClick={handleSave}
          >
            {saved ? '✓ Decision Saved' : 'Save Decision'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setSelected(existing?.decision ?? null); setRemarks(existing?.remarks ?? ''); }}
          >
            Cancel
          </button>
        </div>

        {existing?.decidedAt && (
          <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            Last decision recorded: {new Date(existing.decidedAt).toLocaleString('en-IN')} · Officer ID: {existing.officerId}
          </div>
        )}
      </div>
    </div>
  );
}
