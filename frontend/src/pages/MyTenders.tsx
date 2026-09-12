import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { TenderTable } from '../components/tender/TenderTable';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getTenders } from '../services/tenderService';
import { getAnalysesForTender } from '../services/analysisService';
import { Tender, CompanyAnalysis } from '../types';

type FilterStatus = 'All' | 'Active' | 'Completed' | 'Pending Review';

export function MyTenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, CompanyAnalysis[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('All');

  useEffect(() => {
    getTenders()
      .then(async (ts) => {
        setTenders(ts);
        const map: Record<string, CompanyAnalysis[]> = {};
        await Promise.all(ts.map(async (t) => { map[t.id] = await getAnalysesForTender(t.id); }));
        setAnalyses(map);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? tenders : tenders.filter((t) => t.status === filter);
  const analyzedCountMap: Record<string, number> = {};
  Object.entries(analyses).forEach(([tid, anArr]) => {
    analyzedCountMap[tid] = anArr.filter((a) => a.analysisStatus === 'Analyzed').length;
  });

  const statuses: FilterStatus[] = ['All', 'Active', 'Completed', 'Pending Review'];

  return (
    <AppLayout>
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="page-title">My Tenders</div>
          <div className="page-subtitle">All tenders allocated to your officer account</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4" style={{ marginBottom: 16 }}>
        {statuses.map((s) => (
          <button
            key={s}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(s)}
          >
            {s} {s === 'All' ? `(${tenders.length})` : `(${tenders.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Tender List</div>
          <span className="badge badge-info">{filtered.length} tenders</span>
        </div>
        {loading
          ? <LoadingState message="Loading tenders..." />
          : error
            ? <ErrorState message={error} />
            : <TenderTable tenders={filtered} analyzedCountMap={analyzedCountMap} />
        }
      </div>
    </AppLayout>
  );
}
