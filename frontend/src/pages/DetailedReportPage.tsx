import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DetailedReport } from '../components/report/DetailedReport';
import { ReportExport } from '../components/report/ReportExport';
import { OfficerDecision } from '../components/analysis/OfficerDecision';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getCompanyById } from '../services/companyService';
import { getTenderById } from '../services/tenderService';
import { getAnalysis } from '../services/analysisService';
import { useDecisions } from '../context/DecisionContext';
import { Company, Tender, CompanyAnalysis } from '../types';

export function DetailedReportPage() {
  const { tenderId, companyId } = useParams<{ tenderId: string; companyId: string }>();
  const navigate = useNavigate();
  const { getDecision } = useDecisions();

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

  if (loading) return <AppLayout><LoadingState message="Loading report..." /></AppLayout>;
  if (error || !company || !tender || !analysis) {
    return <AppLayout><ErrorState message={error ?? 'Report data not found'} /></AppLayout>;
  }

  const decision = getDecision(tenderId!, companyId!);

  return (
    <AppLayout>
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between no-print" style={{ marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/tenders/${tenderId}/companies/${companyId}/ai-summary`)}>
            🤖 View AI Summary
          </button>
          {company && tender && <ReportExport company={company} tender={tender} />}
        </div>
      </div>

      {/* Report Content */}
      <DetailedReport
        tender={tender}
        company={company}
        analysis={analysis}
        decision={decision}
      />

      {/* Officer Decision (below report, not on print) */}
      <div className="no-print" style={{ marginTop: 24 }}>
        <OfficerDecision tenderId={tender.id} companyId={company.id} />
      </div>
    </AppLayout>
  );
}
