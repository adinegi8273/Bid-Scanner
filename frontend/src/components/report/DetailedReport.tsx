import { Tender, Company, CompanyAnalysis } from '../../types';
import { ComplianceStatusBadge, CriterionStatusBadge, DecisionBadge } from '../ui/StatusBadge';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { OfficerDecisionRecord } from '../../types';

interface Props {
  tender: Tender;
  company: Company;
  analysis: CompanyAnalysis;
  decision: OfficerDecisionRecord | null;
}

function formatCurrency(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Crore`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(2)} Lakh`;
  return `₹${v.toLocaleString('en-IN')}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function DetailedReport({ tender, company, analysis, decision }: Props) {
  const generatedAt = new Date().toLocaleString('en-IN');

  return (
    <div id="report-content">
      {/* ── Report Header ─────────────────────────────────────── */}
      <div className="report-header" style={{ borderBottom: '2px solid #1d4ed8', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Government e-Marketplace (GeM) — Bid-Scanner
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
              Compliance Verification Report
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
              Tender: {tender.id} &nbsp;·&nbsp; Company: {company.name}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
            <div>Generated: {generatedAt}</div>
            <div style={{ marginTop: 2 }}>Classification: For Official Use Only</div>
          </div>
        </div>
      </div>

      {/* ── Tender Information ─────────────────────────────────── */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">1. Tender Information</div></div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">Tender ID</div><div className="info-item-value font-mono">{tender.id}</div></div>
            <div><div className="info-item-label">Title</div><div className="info-item-value">{tender.title}</div></div>
            <div><div className="info-item-label">Department</div><div className="info-item-value">{tender.department}</div></div>
            <div><div className="info-item-label">Category</div><div className="info-item-value">{tender.category}</div></div>
            <div><div className="info-item-label">Estimated Value</div><div className="info-item-value" style={{ fontWeight: 700 }}>{formatCurrency(tender.value)}</div></div>
            <div><div className="info-item-label">Submission Deadline</div><div className="info-item-value">{formatDate(tender.deadline)}</div></div>
          </div>
        </div>
      </div>

      {/* ── Company Information ────────────────────────────────── */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">2. Company Information</div></div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">Company Name</div><div className="info-item-value" style={{ fontWeight: 700 }}>{company.name}</div></div>
            <div><div className="info-item-label">CIN</div><div className="info-item-value font-mono">{company.cin}</div></div>
            <div><div className="info-item-label">GSTIN</div><div className="info-item-value font-mono">{company.gstin}</div></div>
            <div><div className="info-item-label">PAN</div><div className="info-item-value font-mono">{company.pan}</div></div>
            <div><div className="info-item-label">Type</div><div className="info-item-value">{company.companyType}{company.msmeCategory ? ` (${company.msmeCategory} Enterprise)` : ''}</div></div>
            <div><div className="info-item-label">Registered Address</div><div className="info-item-value">{company.registeredAddress}</div></div>
          </div>
        </div>
      </div>

      {/* ── Compliance Score Summary ───────────────────────────── */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">3. Compliance Score Summary</div></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="info-item-label">Overall Score</div>
              <ScoreDisplay score={analysis.complianceScore} size="lg" showBar />
            </div>
            <div>
              <div className="info-item-label">Compliance Status</div>
              <div style={{ marginTop: 6 }}><ComplianceStatusBadge status={analysis.complianceStatus} /></div>
            </div>
            {analysis.rank && (
              <div>
                <div className="info-item-label">Rank (within Tender)</div>
                <div className={`rank-number ${analysis.rank <= 3 ? `rank-${analysis.rank}` : 'rank-n'}`} style={{ marginTop: 6, width: 'auto', padding: '6px 14px', borderRadius: 6 }}>
                  Rank #{analysis.rank}
                </div>
              </div>
            )}
            <div>
              <div className="info-item-label">Analysis Date</div>
              <div className="info-item-value">{analysis.analyzedAt ? formatDate(analysis.analyzedAt) : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Executive Summary ──────────────────────────────────── */}
      {analysis.aiAnalysis && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">4. Executive Summary (AI-Generated)</div>
            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>AI Decision Support</span>
          </div>
          <div className="card-body">
            <div className="ai-disclaimer" style={{ marginBottom: 14 }}>
              🤖 <strong>AI-generated decision support.</strong> The procurement officer makes the final decision.
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{analysis.aiAnalysis.overallConclusion}</p>

            {analysis.aiAnalysis.warnings.length > 0 && (
              <div className="alert alert-error mt-3" style={{ marginTop: 12 }}>
                <div className="alert-title">Critical Warnings</div>
                <ul style={{ listStyle: 'disc', paddingLeft: 16, marginTop: 4 }}>
                  {analysis.aiAnalysis.warnings.map((w, i) => <li key={i} style={{ marginTop: 4 }}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detailed Compliance Breakdown ─────────────────────── */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">5. Detailed Compliance Breakdown</div></div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Criterion</th>
                <th>Status</th>
                <th>Score</th>
                <th>Evidence</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {analysis.criteria.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><CriterionStatusBadge status={c.status} /></td>
                  <td><strong>{c.score}</strong><span style={{ color: 'var(--color-text-muted)' }}>/{c.maxScore}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.evidence}</td>
                  <td style={{ fontSize: '0.8rem' }}>{c.explanation}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--color-surface-2)', fontWeight: 700 }}>
                <td colSpan={3}>Total</td>
                <td colSpan={3}>
                  {analysis.criteria.reduce((s, c) => s + c.score, 0)} / {analysis.criteria.reduce((s, c) => s + c.maxScore, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AI Reasoning ──────────────────────────────────────── */}
      {analysis.aiAnalysis && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="card-header"><div className="card-title">6. AI Reasoning & Recommendations</div></div>
          <div className="card-body">
            <div style={{ marginBottom: 12 }}>
              <div className="info-item-label">Score Reasoning</div>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>{analysis.aiAnalysis.scoreReason}</p>
            </div>
            <div>
              <div className="info-item-label">Recommendation for Officer</div>
              <p style={{ fontSize: '0.875rem', marginTop: 4 }}>{analysis.aiAnalysis.recommendationForOfficer}</p>
            </div>
            {analysis.aiAnalysis.missingDocuments.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="info-item-label">Missing Documents</div>
                <ul style={{ listStyle: 'disc', paddingLeft: 16, fontSize: '0.85rem', marginTop: 4 }}>
                  {analysis.aiAnalysis.missingDocuments.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Audit Information ─────────────────────────────────── */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">7. Audit Information</div></div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">Analysis Status</div><div className="info-item-value">{analysis.analysisStatus}</div></div>
            <div><div className="info-item-label">Analyzed At</div><div className="info-item-value">{analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleString('en-IN') : '—'}</div></div>
            <div><div className="info-item-label">Report Generated</div><div className="info-item-value">{generatedAt}</div></div>
            <div><div className="info-item-label">System</div><div className="info-item-value">GeM Bid-Scanner v1.0 — SIH 2024</div></div>
          </div>
        </div>
      </div>

      {/* ── Officer Decision ───────────────────────────────────── */}
      <div className="card" style={{ borderWidth: 2, borderColor: '#0f172a' }}>
        <div className="card-header" style={{ background: '#0f172a' }}>
          <div className="card-title" style={{ color: '#fff' }}>8. Procurement Officer Decision</div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <div className="info-item-label">Decision</div>
              <div style={{ marginTop: 6 }}><DecisionBadge decision={decision?.decision ?? null} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="info-item-label">Officer Remarks</div>
              <div style={{ fontSize: '0.875rem', marginTop: 4, minHeight: 40 }}>
                {decision?.remarks || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No remarks recorded</span>}
              </div>
            </div>
            <div>
              <div className="info-item-label">Decided At</div>
              <div className="info-item-value">{decision?.decidedAt ? new Date(decision.decidedAt).toLocaleString('en-IN') : '—'}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            This decision has been recorded in the procurement audit trail as per GFR 2017 Rule 175. Officer ID: {decision?.officerId ?? '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
