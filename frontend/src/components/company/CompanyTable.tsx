import { useNavigate } from 'react-router-dom';
import { Company, CompanyAnalysis } from '../../types';
import { ComplianceStatusBadge, AnalysisStatusBadge, DecisionBadge } from '../ui/StatusBadge';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { useDecisions } from '../../context/DecisionContext';

interface Props {
  tenderId: string;
  companies: Company[];
  analyses: CompanyAnalysis[];
  showRanks?: boolean;
}

export function CompanyTable({ tenderId, companies, analyses, showRanks = false }: Props) {
  const navigate = useNavigate();
  const { getDecision } = useDecisions();

  const getAnalysis = (companyId: string) =>
    analyses.find((a) => a.companyId === companyId) ?? null;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {showRanks && <th>Rank</th>}
            <th>Company Name</th>
            <th>CIN</th>
            <th>Analysis</th>
            <th>Score</th>
            <th>Compliance</th>
            <th>Officer Decision</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => {
            const analysis = getAnalysis(company.id);
            const decision = getDecision(tenderId, company.id);
            const isAnalyzed = analysis?.analysisStatus === 'Analyzed';

            return (
              <tr key={company.id}>
                {showRanks && (
                  <td>
                    {analysis?.rank ? (
                      <span className={`rank-number rank-${analysis.rank <= 3 ? analysis.rank : 'n'}`}>
                        #{analysis.rank}
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                )}
                <td>
                  <div style={{ fontWeight: 600 }}>{company.name}</div>
                  <div className="td-muted">{company.companyType}{company.msmeCategory ? ` · ${company.msmeCategory} Enterprise` : ''}</div>
                </td>
                <td><span className="font-mono text-sm td-muted">{company.cin}</span></td>
                <td>
                  {analysis
                    ? <AnalysisStatusBadge status={analysis.analysisStatus} />
                    : <span className="badge badge-neutral">Not Started</span>}
                </td>
                <td>
                  {isAnalyzed && analysis
                    ? <ScoreDisplay score={analysis.complianceScore} showBar />
                    : <span className="text-muted">—</span>}
                </td>
                <td>
                  {isAnalyzed && analysis
                    ? <ComplianceStatusBadge status={analysis.complianceStatus} />
                    : <span className="text-muted">—</span>}
                </td>
                <td>
                  <DecisionBadge decision={decision?.decision ?? null} />
                </td>
                <td>
                  <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={!isAnalyzed}
                      onClick={() => navigate(`/tenders/${tenderId}/companies/${company.id}`)}
                    >
                      Analysis
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={!isAnalyzed || !analysis?.aiAnalysis}
                      onClick={() => navigate(`/tenders/${tenderId}/companies/${company.id}/ai-summary`)}
                    >
                      AI Summary
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!isAnalyzed}
                      onClick={() => navigate(`/tenders/${tenderId}/companies/${company.id}/report`)}
                    >
                      Report
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
