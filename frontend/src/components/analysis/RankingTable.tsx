import { useNavigate } from 'react-router-dom';
import { CompanyAnalysis, Company } from '../../types';
import { ComplianceStatusBadge } from '../ui/StatusBadge';
import { ScoreDisplay } from '../ui/ScoreDisplay';

interface RankedEntry {
  analysis: CompanyAnalysis;
  company: Company;
}

interface Props {
  tenderId: string;
  entries: RankedEntry[];
}

const rankClass = (rank: number) => (rank <= 3 ? `rank-${rank}` : 'rank-n');

export function RankingTable({ tenderId, entries }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      {/* Methodology notice */}
      <div className="alert alert-info mb-4" style={{ marginBottom: 16 }}>
        <div className="alert-title">Ranking Methodology</div>
        Ranking is based on the transparent compliance scoring model — Udyam/MSME, GST filing, PAN/IT, EPFO/ESIC, OEM authorisation, blacklist status, and tender-specific requirements.
        Each criterion carries a defined weightage. The procurement officer makes the final qualification decision.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {entries.map(({ analysis, company }) => (
          <div key={company.id} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 18px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div className={`rank-number ${rankClass(analysis.rank ?? 99)}`}>
              #{analysis.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{company.name}</div>
              <div className="text-muted text-sm">{company.companyType}{company.msmeCategory ? ` · ${company.msmeCategory} Enterprise` : ''}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ScoreDisplay score={analysis.complianceScore} size="lg" showBar />
            </div>
            <div style={{ minWidth: 140 }}>
              <ComplianceStatusBadge status={analysis.complianceStatus} />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/tenders/${tenderId}/companies/${company.id}`)}>
                Analysis
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/tenders/${tenderId}/companies/${company.id}/report`)}>
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        ⚖️ <strong>Ranking is based on the transparent compliance scoring model.</strong> The procurement officer makes the final Qualify / Disqualify / Further Review decision. AI analysis is decision support only.
      </div>
    </div>
  );
}
