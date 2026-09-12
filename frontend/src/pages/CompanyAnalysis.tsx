import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ComplianceBreakdown } from '../components/analysis/ComplianceBreakdown';
import { OfficerDecision } from '../components/analysis/OfficerDecision';
import { ScoreDisplay } from '../components/ui/ScoreDisplay';
import { ComplianceStatusBadge, AnalysisStatusBadge } from '../components/ui/StatusBadge';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getCompanyById } from '../services/companyService';
import { getTenderById } from '../services/tenderService';
import { getAnalysis } from '../services/analysisService';
import { Company, Tender, CompanyAnalysis } from '../types';

export function CompanyAnalysisPage() {
  const { tenderId, companyId } = useParams<{ tenderId: string; companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [tender, setTender] = useState<Tender | null>(null);
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenderId || !companyId) return;
    Promise.all([
      getCompanyById(companyId),
      getTenderById(tenderId),
      getAnalysis(tenderId, companyId),
    ]).then(([c, t, a]) => {
      setCompany(c);
      setTender(t);
      setAnalysis(a);
    }).catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [tenderId, companyId]);

  if (loading) return <AppLayout><LoadingState message="Loading company analysis..." /></AppLayout>;
  if (error || !company || !tender) return <AppLayout><ErrorState message={error ?? 'Not found'} /></AppLayout>;

  const isAnalyzed = analysis?.analysisStatus === 'Analyzed';

  return (
    <AppLayout>
      {/* Back nav */}
      <button className="btn btn-secondary btn-sm no-print" style={{ marginBottom: 16 }} onClick={() => navigate(`/tenders/${tenderId}`)}>
        ← Back to Tender
      </button>

      {/* Company Header */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{tender.title}</div>
            <div className="card-title" style={{ fontSize: '1.15rem' }}>{company.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {company.companyType}{company.msmeCategory ? ` · ${company.msmeCategory} Enterprise` : ''}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            {analysis && <AnalysisStatusBadge status={analysis.analysisStatus} />}
            {isAnalyzed && analysis && <ComplianceStatusBadge status={analysis.complianceStatus} />}
          </div>
        </div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">CIN</div><div className="info-item-value font-mono">{company.cin}</div></div>
            <div><div className="info-item-label">GSTIN</div><div className="info-item-value font-mono">{company.gstin}</div></div>
            <div><div className="info-item-label">PAN</div><div className="info-item-value font-mono">{company.pan}</div></div>
            <div><div className="info-item-label">Registered Address</div><div className="info-item-value">{company.registeredAddress}</div></div>
          </div>
        </div>
      </div>

      {/* Score + Quick Actions */}
      {isAnalyzed && analysis && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div className="info-item-label">Compliance Score</div>
              <ScoreDisplay score={analysis.complianceScore} size="lg" showBar />
            </div>
            <div>
              <div className="info-item-label">Status</div>
              <div style={{ marginTop: 6 }}><ComplianceStatusBadge status={analysis.complianceStatus} /></div>
            </div>
            {analysis.rank && (
              <div>
                <div className="info-item-label">Rank</div>
                <div className="info-item-value" style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>#{analysis.rank}</div>
              </div>
            )}
            <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/tenders/${tenderId}/companies/${companyId}/ai-summary`)} disabled={!analysis.aiAnalysis}>
                🤖 See AI Summary
              </button>
              <button className="btn btn-primary" onClick={() => navigate(`/tenders/${tenderId}/companies/${companyId}/report`)}>
                📄 Detailed Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Breakdown */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Compliance Criteria Breakdown</div>
          {isAnalyzed && analysis && (
            <span className="badge badge-info">
              {analysis.criteria.filter(c => c.status === 'Passed').length} / {analysis.criteria.length} passed
            </span>
          )}
        </div>
        {!isAnalyzed || !analysis
          ? (
            <div className="state-center" style={{ padding: '32px 16px' }}>
              <div className="state-icon">⏳</div>
              <div className="state-title">Analysis {analysis?.analysisStatus ?? 'not started'}</div>
              <div className="state-desc">Compliance criteria will appear once analysis is complete.</div>
            </div>
          )
          : <ComplianceBreakdown criteria={analysis.criteria} />
        }
      </div>

      {/* Officer Decision */}
      {tenderId && companyId && (
        <div>
          <OfficerDecision tenderId={tenderId} companyId={companyId} />
        </div>
      )}
    </AppLayout>
  );
}
