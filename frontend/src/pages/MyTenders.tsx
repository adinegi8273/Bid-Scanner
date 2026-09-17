import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { TenderTable } from '../components/tender/TenderTable';
import { LoadingState, ErrorState } from '../components/ui/States';
import { getTenders } from '../services/tenderService';
import { Tender } from '../types';

type FilterStatus = 'All' | Tender['status'];

export function MyTenders() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('All');

  useEffect(() => {
    getTenders()
      .then(async (ts) => {
        setTenders(ts);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? tenders : tenders.filter((t) => t.status === filter);

  const statuses: FilterStatus[] = ['All', 'Open', 'Under Evaluation', 'Awarded', 'Closed'];

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
            : <TenderTable
                tenders={filtered}
              />
        }
      </div>
    </AppLayout>
  );
}
