import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState, LoadingState } from '../components/ui/States';
import { getCompanyAnalysis } from '../services/analysisService';
import { DatabaseCompanyAnalysis, DatabaseCriterion, Tender } from '../types';
import { getTenderById } from '../services/tenderService';

function value(value: string | number | null | undefined) {
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

function Result({ criterion }: { criterion: DatabaseCriterion }) {
  return (
    <tr>
      <td style={{ fontWeight: 600 }}>{criterion.name}</td>
      <td><span className={`badge badge-${criterion.status === 'Passed' ? 'success' : 'error'}`}>{criterion.status}</span></td>
      <td>{criterion.evidence}</td>
    </tr>
  );
}

export function CompanyAnalysisPage() {
  const { tenderId, companyId } = useParams<{ tenderId: string; companyId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<DatabaseCompanyAnalysis | null>(null);
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenderId || !companyId) return;
    Promise.all([getCompanyAnalysis(tenderId, companyId), getTenderById(tenderId)])
      .then(([loadedAnalysis, loadedTender]) => {
        setAnalysis(loadedAnalysis);
        setTender(loadedTender);
      })
      .catch((reason) => setError(String(reason)))
      .finally(() => setLoading(false));
  }, [tenderId, companyId]);

  if (loading) return <AppLayout><LoadingState message="Loading database verification..." /></AppLayout>;
  if (error || !analysis || !tender) return <AppLayout><ErrorState message={error ?? 'Analysis data not found'} /></AppLayout>;

  const { company, verification } = analysis;
  return (
    <AppLayout>
      <button className="btn btn-secondary btn-sm no-print" style={{ marginBottom: 16 }} onClick={() => navigate(`/tenders/${tenderId}`)}>
        ← Back to Tender
      </button>
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="info-item-label">{tender.tenderNumber} · {tender.title}</div>
            <div className="card-title">{company.name}</div>
          </div>
          <span className="badge badge-info">Database verification</span>
        </div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">Company ID</div><div className="info-item-value font-mono">{company.id}</div></div>
            <div><div className="info-item-label">PAN</div><div className="info-item-value font-mono">{value(company.pan)}</div></div>
            <div><div className="info-item-label">GSTIN</div><div className="info-item-value font-mono">{value(company.gstin)}</div></div>
            <div><div className="info-item-label">Udyam Number</div><div className="info-item-value font-mono">{value(company.udyamNumber)}</div></div>
            <div><div className="info-item-label">Company Type</div><div className="info-item-value">{value(company.companyType)}</div></div>
            <div><div className="info-item-label">City / State</div><div className="info-item-value">{value(company.cityState)}</div></div>
            <div><div className="info-item-label">Bid Amount</div><div className="info-item-value">{company.bidAmount === null || company.bidAmount === undefined ? '—' : `₹${company.bidAmount.toLocaleString('en-IN')}`}</div></div>
          </div>
        </div>
      </div>

      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Verification Registry Results</div></div>
        <div className="card-body">
          <div className="info-grid">
            <div><div className="info-item-label">PAN Status</div><div className="info-item-value">{value(verification.panStatus)}</div></div>
            <div><div className="info-item-label">GST Filing Status</div><div className="info-item-value">{value(verification.gstFilingStatus)}</div></div>
            <div><div className="info-item-label">GST Linked PAN</div><div className="info-item-value font-mono">{value(verification.gstLinkedPan)}</div></div>
            <div><div className="info-item-label">Udyam Enterprise Type</div><div className="info-item-value">{value(verification.udyamEnterpriseType)}</div></div>
            <div><div className="info-item-label">Udyam Status</div><div className="info-item-value">{value(verification.udyamStatus)}</div></div>
            <div><div className="info-item-label">GeM Blacklisted</div><div className="info-item-value">{verification.isBlacklisted === null ? '—' : verification.isBlacklisted ? 'Yes' : 'No'}</div></div>
            {verification.blacklistReason && <div><div className="info-item-label">Blacklist Reason</div><div className="info-item-value">{verification.blacklistReason}</div></div>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Tender Criteria Results</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Criterion</th><th>Status</th><th>Evidence from database</th></tr></thead>
            <tbody>{analysis.criteria.map((criterion) => <Result key={criterion.key} criterion={criterion} />)}</tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
