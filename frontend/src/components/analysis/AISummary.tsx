import { AIAnalysis } from '../../types';

interface Props {
  ai: AIAnalysis;
}

function Section({ title, items, variant = 'neutral' }: {
  title: string;
  items: string[];
  variant?: 'success' | 'error' | 'warning' | 'neutral';
}) {
  if (items.length === 0) return null;
  const colorMap = { success: '#16a34a', error: '#dc2626', warning: '#d97706', neutral: '#64748b' };
  const bgMap = { success: '#f0fdf4', error: '#fef2f2', warning: '#fffbeb', neutral: '#f8fafc' };
  const borderMap = { success: '#bbf7d0', error: '#fecaca', warning: '#fde68a', neutral: '#e2e8f0' };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: colorMap[variant], marginBottom: 6 }}>
        {title}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{
            background: bgMap[variant],
            border: `1px solid ${borderMap[variant]}`,
            borderLeft: `3px solid ${colorMap[variant]}`,
            borderRadius: 4,
            padding: '7px 11px',
            fontSize: '0.82rem',
            color: 'var(--color-text)',
          }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AISummary({ ai }: Props) {
  return (
    <div>
      {/* AI Disclaimer */}
      <div className="ai-disclaimer" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: '1.1rem' }}>🤖</span>
        <div>
          <strong>AI-generated decision support.</strong> This analysis was generated automatically using the compliance scoring engine and AI language model.
          The final procurement decision — Qualify, Disqualify, or Needs Further Review — <strong>must be made by the Procurement Officer.</strong>
        </div>
      </div>

      {/* Overall Conclusion */}
      <div style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginBottom: 20,
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
          Overall Conclusion
        </div>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{ai.overallConclusion}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
        <div>
          <Section title="✅ Compliance Strengths" items={ai.strengths} variant="success" />
        </div>
        <div>
          <Section title="⚠️ Weaknesses" items={ai.weaknesses} variant="warning" />
        </div>
      </div>

      <Section title="📄 Missing Documents" items={ai.missingDocuments} variant="error" />
      <Section title="🚨 Warnings" items={ai.warnings} variant="error" />
      <Section title="🔍 Important Findings" items={ai.importantFindings} variant="neutral" />

      {/* Score Reason */}
      <div style={{
        background: 'var(--color-info-bg)',
        border: '1px solid var(--color-info-border)',
        borderLeft: '3px solid var(--color-info)',
        borderRadius: 4,
        padding: '10px 14px',
        fontSize: '0.82rem',
        marginBottom: 14,
      }}>
        <strong>Score Reasoning:</strong> {ai.scoreReason}
      </div>

      {/* Recommendation */}
      <div style={{
        background: '#fefce8',
        border: '1px solid #fef08a',
        borderLeft: '3px solid #ca8a04',
        borderRadius: 4,
        padding: '10px 14px',
        fontSize: '0.82rem',
      }}>
        <strong>Recommendation for Officer Attention:</strong> {ai.recommendationForOfficer}
      </div>

      <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
        Generated: {new Date(ai.generatedAt).toLocaleString('en-IN')}
      </div>
    </div>
  );
}
