import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { CompanyTable } from '../components/company/CompanyTable';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { TenderStatusBadge } from '../components/ui/StatusBadge';
import { getCompaniesForTender } from '../services/companyService';
import { getTenderById } from '../services/tenderService';
import { Company, Tender } from '../types';

function formatCurrency(value: number | null) {
  if (value === null) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Crore`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} Lakh`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
}

export function TenderDetail() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  const [tender, setTender] = useState<Tender | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenderId) return;
    Promise.all([getTenderById(tenderId), getCompaniesForTender(tenderId)])
      .then(([loadedTender, loadedCompanies]) => {
        if (!loadedTender) {
          setError('Tender not found');
          return;
        }
        setTender(loadedTender);
        setCompanies(loadedCompanies);
      })
      .catch((reason) => setError(String(reason)))
      .finally(() => setLoading(false));
  }, [tenderId]);

  if (loading) return <AppLayout><LoadingState message="Loading tender details..." /></AppLayout>;
  if (error || !tender) return <AppLayout><ErrorState message={error ?? 'Tender not found'} /></AppLayout>;

  return (
    <AppLayout>
      <button className="btn btn-secondary btn-sm no-print" style={{ marginBottom: 16 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
              <span className="font-mono">{tender.id}</span> · {tender.tenderNumber} · {tender.department ?? '—'}
            </div>
            <div className="card-title" style={{ fontSize: '1.1rem' }}>{tender.title}</div>
          </div>
          <TenderStatusBadge status={tender.status} />
        </div>
        <div className="card-body">
          <div className="info-grid" style={{ marginBottom: 16 }}>
            <div><div className="info-item-label">Category</div><div className="info-item-value"><span className="chip">{tender.category ?? '—'}</span></div></div>
            <div><div className="info-item-label">Estimated Value</div><div className="info-item-value" style={{ fontWeight: 700 }}>{formatCurrency(tender.value)}</div></div>
            <div><div className="info-item-label">Submission Deadline</div><div className="info-item-value">{formatDate(tender.deadline)}</div></div>
            <div><div className="info-item-label">Total Bidders</div><div className="info-item-value">{tender.bidderCount}</div></div>
          </div>
          <div className="section-divider" />
          <div>
            <div className="info-item-label" style={{ marginBottom: 6 }}>Compliance Criteria</div>
            <div className="chip-list">
              {tender.complianceCriteria.map((criterion) => <span key={criterion} className="chip">{criterion}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Company Bidder List</div>
        </div>
        {companies.length === 0
          ? <EmptyState title="No bidders found" />
          : <CompanyTable tenderId={tender.id} companies={companies} analyses={[]} />}
      </div>
    </AppLayout>
  );
}
