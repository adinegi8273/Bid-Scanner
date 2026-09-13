import { useNavigate } from 'react-router-dom';
import { Tender } from '../../types';
import { TenderStatusBadge } from '../ui/StatusBadge';

interface Props {
  tenders: Tender[];
  analyzedCountMap?: Record<string, number>;
}

function formatCurrency(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)} Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function TenderTable({ tenders }: Props) {
  const navigate = useNavigate();

  if (tenders.length === 0) return (
    <div className="state-center"><div className="state-icon">📋</div><div className="state-title">No tenders found</div></div>
  );

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Tender ID</th>
            <th>Title</th>
            <th>Department</th>
            <th>Category</th>
            <th>Value</th>
            <th>Deadline</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((t) => (
            <tr key={t.id}>
              <td><span className="font-mono text-sm">{t.id}</span></td>
              <td style={{ maxWidth: 260 }}>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
              </td>
              <td className="td-muted">{t.department.split('(')[0].trim()}</td>
              <td><span className="chip">{t.category}</span></td>
              <td style={{ fontWeight: 600 }}>{formatCurrency(t.value)}</td>
              <td className="td-muted">{formatDate(t.deadline)}</td>
              <td><TenderStatusBadge status={t.status} /></td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/tenders/${t.id}`)}>
                  View Tender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
