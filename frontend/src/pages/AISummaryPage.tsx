import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AISummary } from '../components/analysis/AISummary';
import { LoadingState, ErrorState } from '../components/ui/States';
import { ScoreDisplay } from '../components/ui/ScoreDisplay';
import { ComplianceStatusBadge } from '../components/ui/StatusBadge';
import { getCompanyById } from '../services/companyService';
import { getTenderById } from '../services/tenderService';
import { getAnalysis } from '../services/analysisService';
import { Company, Tender, CompanyAnalysis } from '../types';

export function AISummaryPage() {
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
    ]).then(([c, t, a]) => { setCompany(c); setTender(t); setAnalysis(a); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [tenderId, companyId]);

  if (loading) return <AppLayout><LoadingState message="Loading AI summary..." /></AppLayout>;
  if (error || !company || !tender || !analysis?.aiAnalysis) {
    return <AppLayout><ErrorState message={error ?? 'AI summary not available for this company'} /></AppLayout>;
  }

  return (
    <AppLayout>
      <button className="btn btn-secondary btn-sm no-print" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Header */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{tender.title}</div>
            <div className="card-title" style={{ fontSize: '1.1rem' }}>🤖 AI Compliance Summary — {company.name}</div>
          </div>
          <div className="flex gap-3 items-center">
            <ScoreDisplay score={analysis.complianceScore} />
            <ComplianceStatusBadge status={analysis.complianceStatus} />
          </div>
        </div>
      </div>

      {/* AI Summary Content */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <AISummary ai={analysis.aiAnalysis} />
        </div>
      </div>

      {/* Navigate to actions */}
      <div className="flex gap-3 no-print">
        <button className="btn btn-secondary" onClick={() => navigate(`/tenders/${tenderId}/companies/${companyId}`)}>
          View Full Analysis
        </button>
        <button className="btn btn-primary" onClick={() => navigate(`/tenders/${tenderId}/companies/${companyId}/report`)}>
          Open Detailed Report
        </button>
      </div>
    </AppLayout>
  );
}
