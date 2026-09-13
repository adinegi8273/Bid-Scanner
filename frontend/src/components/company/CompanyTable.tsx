import { useState } from 'react';
import { Company, CompanyAnalysis } from '../../types';

interface Props {
  tenderId: string;
  companies: Company[];
  analyses: CompanyAnalysis[];
  showRanks?: boolean;
}

export function CompanyTable({ companies, analyses, showRanks = false }: Props) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const getAnalysis = (companyId: string) =>
    analyses.find((a) => a.companyId === companyId) ?? null;

  return (
    <div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {showRanks && <th>Rank</th>}
              <th>Company Name</th>
              <th>Submitted Details</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const analysis = getAnalysis(company.id);
              const rank = analysis?.rank ?? null;

              return (
                <tr key={company.id} onClick={() => setSelectedCompany(company)} style={{ cursor: 'pointer' }}>
                  {showRanks && (
                    <td>
                      {rank ? (
                        <span className={`rank-number rank-${rank <= 3 ? rank : 'n'}`}>
                          #{rank}
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                  )}
                  <td>
                    <div style={{ fontWeight: 600 }}>{company.name}</div>
                    <div className="td-muted">{company.companyType}{company.msmeCategory ? ` · ${company.msmeCategory}` : ''}</div>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" type="button">
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCompany && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-header">
            <div className="card-title">{selectedCompany.name}</div>
            <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelectedCompany(null)}>
              Close
            </button>
          </div>
          <div className="card-body" style={{ maxHeight: 290, overflowY: 'auto', paddingRight: 8 }}>
            <div className="info-grid">
              <div><div className="info-item-label">Legal Name</div><div className="info-item-value">{selectedCompany.name ?? '—'}</div></div>
              <div><div className="info-item-label">PAN</div><div className="info-item-value font-mono">{selectedCompany.pan ?? '—'}</div></div>
              <div><div className="info-item-label">GSTIN</div><div className="info-item-value font-mono">{selectedCompany.gstin ?? '—'}</div></div>
              <div><div className="info-item-label">Udyam Number</div><div className="info-item-value font-mono">{selectedCompany.udyamNumber ?? '—'}</div></div>
              <div><div className="info-item-label">Udyam Status</div><div className="info-item-value">{selectedCompany.udyamStatus ?? '—'}</div></div>
              <div><div className="info-item-label">Company Type</div><div className="info-item-value">{selectedCompany.companyType ?? '—'}</div></div>
              <div><div className="info-item-label">Bid Amount</div><div className="info-item-value">{selectedCompany.bidAmount !== undefined ? `₹${selectedCompany.bidAmount.toLocaleString('en-IN')}` : '—'}</div></div>
              <div><div className="info-item-label">City / State</div><div className="info-item-value">{selectedCompany.cityState ?? selectedCompany.registeredAddress ?? '—'}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
