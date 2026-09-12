import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { TenderTable } from '../components/tender/TenderTable';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getTenders } from '../services/tenderService';
import { getAnalysesForTender } from '../services/analysisService';
import { mockOfficer } from '../data/mockOfficer';
import { Tender, CompanyAnalysis } from '../types';

export function Dashboard() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, CompanyAnalysis[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTenders()
      .then(async (ts) => {
        setTenders(ts);
        const map: Record<string, CompanyAnalysis[]> = {};
        await Promise.all(ts.map(async (t) => {
          map[t.id] = await getAnalysesForTender(t.id);
        }));
        setAnalyses(map);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const active    = tenders.filter((t) => t.status === 'Active').length;
  const completed = tenders.filter((t) => t.status === 'Completed').length;
  const attention = tenders.filter((t) => t.status === 'Pending Review').length;

  // Analyzed count per tender
  const analyzedCountMap: Record<string, number> = {};
  Object.entries(analyses).forEach(([tid, anArr]) => {
    analyzedCountMap[tid] = anArr.filter((a) => a.analysisStatus === 'Analyzed').length;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">Welcome, {mockOfficer.name.split(' ')[0]}</div>
        <div className="page-subtitle">{mockOfficer.designation} · {mockOfficer.department}</div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Allocated Tenders</div>
          <div className="stat-value">{tenders.length}</div>
          <div className="stat-meta">Assigned to your officer ID</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-label">Active Tenders</div>
          <div className="stat-value">{active}</div>
          <div className="stat-meta">Currently open for evaluation</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completed}</div>
          <div className="stat-meta">All decisions finalized</div>
        </div>
        <div className="stat-card stat-attention">
          <div className="stat-label">Requiring Attention</div>
          <div className="stat-value">{attention}</div>
          <div className="stat-meta">Pending review / action</div>
        </div>
      </div>

      {/* Tender Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Allocated Tenders</div>
          <span className="badge badge-info">{tenders.length} tenders</span>
        </div>
        {loading
          ? <LoadingState message="Loading tenders..." />
          : error
            ? <ErrorState message={error} />
            : <TenderTable
                tenders={tenders}
                analyzedCountMap={analyzedCountMap}
              />
        }
      </div>
    </AppLayout>
  );
}
