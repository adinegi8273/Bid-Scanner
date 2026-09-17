import { useState } from 'react';
import { Company, CompanyAnalysis } from '../../types';
import { AnalyzeResponse, sendAnalyzeRequest } from '../../services/analysisService';

interface Props {
  tenderId: string;
  companies: Company[];
  analyses: CompanyAnalysis[];
  showRanks?: boolean;
}

export function CompanyTable({ tenderId, companies, analyses, showRanks = false }: Props) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [analyzingCompanyId, setAnalyzingCompanyId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, AnalyzeResponse>>({});
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleAnalyze = async (company: Company) => {
    setAnalyzingCompanyId(company.id);
    setAnalysisError(null);
    try {
      const response = await sendAnalyzeRequest(tenderId, company);
      setReports((current) => ({ ...current, [company.id]: response }));
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Unable to generate report');
    } finally {
      setAnalyzingCompanyId(null);
    }
  };

  const downloadReport = (company: Company, response: AnalyzeResponse) => {
    const bytes = Uint8Array.from(atob(response.pdfBase64), (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.id}-verification-report.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
                <tr key={company.id}>
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
                    <div className="flex gap-2">
                      <button
                        className="btn btn-secondary btn-sm"
                        type="button"
                        onClick={() => setSelectedCompany((current) => current?.id === company.id ? null : company)}
                      >
                        {selectedCompany?.id === company.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        disabled={analyzingCompanyId === company.id}
                        onClick={() => handleAnalyze(company)}
                      >
                        {analyzingCompanyId === company.id ? 'Sending...' : 'Analyze'}
                      </button>
                    </div>
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
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={() => setSelectedCompany(null)}
            >
              Close
            </button>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div><div className="info-item-label">Company ID</div><div className="info-item-value font-mono">{selectedCompany.id}</div></div>
              <div><div className="info-item-label">Legal Name</div><div className="info-item-value">{selectedCompany.name}</div></div>
              <div><div className="info-item-label">PAN</div><div className="info-item-value font-mono">{selectedCompany.pan ?? '—'}</div></div>
              <div><div className="info-item-label">GSTIN</div><div className="info-item-value font-mono">{selectedCompany.gstin ?? '—'}</div></div>
              <div><div className="info-item-label">Udyam Number</div><div className="info-item-value font-mono">{selectedCompany.udyamNumber ?? '—'}</div></div>
              <div><div className="info-item-label">Company Type</div><div className="info-item-value">{selectedCompany.companyType ?? '—'}</div></div>
              <div><div className="info-item-label">Bid Amount</div><div className="info-item-value">{selectedCompany.bidAmount === undefined ? '—' : `₹${selectedCompany.bidAmount.toLocaleString('en-IN')}`}</div></div>
              <div><div className="info-item-label">City / State</div><div className="info-item-value">{selectedCompany.cityState ?? '—'}</div></div>
            </div>
          </div>
        </div>
      )}

      {analysisError && <div className="state-desc" style={{ marginTop: 16, color: 'var(--color-error)' }}>{analysisError}</div>}

      {Object.entries(reports).map(([companyId, response]) => {
        const company = companies.find((item) => item.id === companyId);
        if (!company) return null;
        return (
          <div className="card" style={{ marginTop: 18 }} key={companyId}>
            <div className="card-header">
              <div className="card-title">AI Recommendation — {company.name}</div>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => downloadReport(company, response)}>
                Download PDF
              </button>
            </div>
            <div className="card-body">
              <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                {response.report.ai_recommendation}
              </div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{response.report.summary_text}</p>
            </div>
          </div>
        );
      })}

    </div>
  );
}
