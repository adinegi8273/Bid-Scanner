import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CompanyTable } from '../components/company/CompanyTable';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { TenderStatusBadge } from '../components/ui/StatusBadge';
import { getTenderById } from '../services/tenderService';
import { getCompaniesByIds } from '../services/companyService';
import { getAnalysesForTender, rankCompaniesForTender } from '../services/analysisService';
import { Tender, Company, CompanyAnalysis } from '../types';

function formatCurrency(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Crore`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(2)} Lakh`;
  return `₹${v.toLocaleString('en-IN')}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function TenderDetail() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();

  const [tender, setTender] = useState<Tender | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analyses, setAnalyses] = useState<CompanyAnalysis[]>([]);
  const [rankedOrder, setRankedOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenderId) return;
    Promise.all([
      getTenderById(tenderId),
      getAnalysesForTender(tenderId),
    ]).then(async ([t, anArr]) => {
      if (!t) { setError('Tender not found'); return; }
      setTender(t);
      setAnalyses(anArr);
      const comps = await getCompaniesByIds(t.bidderIds);
      const unranked = [...comps].sort(() => 0.5 - Math.random());
      setCompanies(unranked);
    }).catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [tenderId]);

  const handleRank = async () => {
    if (!tenderId) return;
    setRanking(true);
    const response = await rankCompaniesForTender(tenderId);
    setRankedOrder(response.rankedCompanyIds);
    setRanking(false);
  };

  if (loading) return <AppLayout><LoadingState message="Loading tender details..." /></AppLayout>;
  if (error || !tender) return <AppLayout><ErrorState message={error ?? 'Tender not found'} /></AppLayout>;

  const displayCompanies = rankedOrder.length
    ? rankedOrder
        .map((id) => companies.find((company) => company.id === id))
        .filter((company): company is Company => Boolean(company))
    : companies;

  return (
    <AppLayout>
      <button className="btn btn-secondary btn-sm no-print" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              <span className="font-mono">{tender.id}</span> · {tender.department}
            </div>
            <div className="card-title" style={{ fontSize: '1.1rem' }}>{tender.title}</div>
          </div>
          <TenderStatusBadge status={tender.status} />
        </div>
        <div className="card-body">
          <div className="info-grid" style={{ marginBottom: 16 }}>
            <div><div className="info-item-label">Category</div><div className="info-item-value"><span className="chip">{tender.category}</span></div></div>
            <div><div className="info-item-label">Estimated Value</div><div className="info-item-value" style={{ fontWeight: 700 }}>{formatCurrency(tender.value)}</div></div>
            <div><div className="info-item-label">Submission Deadline</div><div className="info-item-value">{formatDate(tender.deadline)}</div></div>
            <div><div className="info-item-label">Total Bidders</div><div className="info-item-value">{tender.bidderIds.length}</div></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div className="info-item-label" style={{ marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--color-text)' }}>{tender.description}</p>
          </div>

          <div className="section-divider" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div className="info-item-label" style={{ marginBottom: 6 }}>Eligibility Requirements</div>
              <ul style={{ listStyle: 'disc', paddingLeft: 18, fontSize: '0.82rem', lineHeight: 1.8 }}>
                {tender.eligibilityRequirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div>
              <div className="info-item-label" style={{ marginBottom: 6 }}>Compliance Criteria</div>
              <div className="chip-list">
                {tender.complianceCriteria.map((c, i) => <span key={i} className="chip">{c}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Company Bidder List</div>
          </div>
          <button
            className={`btn ${rankedOrder.length ? 'btn-success' : 'btn-primary'}`}
            disabled={ranking || companies.length === 0}
            onClick={handleRank}
          >
            {ranking ? '⏳ Ranking...' : rankedOrder.length ? '✓ Rank All Companies' : '📊 Rank All Companies'}
          </button>
        </div>

        {companies.length === 0 ? (
          <EmptyState title="No bidders found" />
        ) : (
          <CompanyTable
            tenderId={tender.id}
            companies={displayCompanies}
            analyses={analyses}
            showRanks={rankedOrder.length > 0}
          />
        )}
      </div>
    </AppLayout>
  );
}
