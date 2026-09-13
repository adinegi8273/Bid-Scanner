import { Company, CompanyAnalysis, ComplianceCriterion, Tender } from '../types';
import rawData from '../../../new_mock_data.json';

type RawCriteria = {
  criterion_key: string;
  criterion_name: string;
  weight_points: number;
  is_mandatory: boolean;
};

type RawCompany = {
  legal_name: string;
  pan: string;
  gstin: string;
  udyam_number: string;
  udyam_status: string;
  company_type: string;
  bid_amount: number;
  city_state: string;
  is_blacklisted: boolean;
};

type RawTender = {
  tender_id: string;
  tender_number: string;
  title: string;
  category: string;
  department: string;
  estimated_value: number;
  submission_deadline: string;
  status: string;
  criteria: RawCriteria[];
  companies: RawCompany[];
};

const data = rawData as { tenders: RawTender[] };

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'company';

const toTenderStatus = (status: string): Tender['status'] => {
  switch (status) {
    case 'under_evaluation':
      return 'Active';
    case 'awarded':
      return 'Completed';
    case 'pending_review':
      return 'Pending Review';
    case 'expired':
      return 'Expired';
    default:
      return 'Active';
  }
};

const companyIdMap = new Map<string, string>();
const buildCompany = (company: RawCompany, index: number): Company => {
  const name = company.legal_name.trim();
  const existingId = companyIdMap.get(name);
  if (existingId) {
    return {
      id: existingId,
      name,
      gstin: company.gstin,
      pan: company.pan,
      registeredAddress: company.city_state,
      companyType: company.company_type,
      msmeCategory: company.company_type === 'msme' ? 'MSME' : undefined,
      udyamNumber: company.udyam_number,
      udyamStatus: company.udyam_status,
      bidAmount: company.bid_amount,
      cityState: company.city_state,
    };
  }

  const id = `comp-${slugify(name)}-${index + 1}`;
  companyIdMap.set(name, id);

  return {
    id,
    name,
    gstin: company.gstin,
    pan: company.pan,
    registeredAddress: company.city_state,
    companyType: company.company_type,
    msmeCategory: company.company_type === 'msme' ? 'MSME' : undefined,
    udyamNumber: company.udyam_number,
    udyamStatus: company.udyam_status,
    bidAmount: company.bid_amount,
    cityState: company.city_state,
  };
};

const getCriterionStatus = (
  criterionKey: string,
  company: RawCompany,
  isMandatory: boolean
): 'Passed' | 'Failed' | 'Warning' | 'Not Verified' => {
  if (criterionKey === 'not_blacklisted') {
    return company.is_blacklisted ? 'Failed' : 'Passed';
  }

  if (criterionKey === 'udyam_valid') {
    return company.udyam_status === 'active' ? 'Passed' : isMandatory ? 'Failed' : 'Warning';
  }

  if (criterionKey === 'pan_valid') {
    return company.pan ? 'Passed' : 'Failed';
  }

  if (criterionKey === 'gst_filing_current') {
    return company.gstin ? 'Passed' : 'Failed';
  }

  return company.gstin ? 'Passed' : 'Not Verified';
};

const buildCriteria = (
  company: RawCompany,
  criteria: RawCriteria[],
  tenderId: string
): ComplianceCriterion[] =>
  criteria.map((criterion, index) => {
    const status = getCriterionStatus(criterion.criterion_key, company, criterion.is_mandatory);
    const passed = status === 'Passed';
    const score = passed ? criterion.weight_points : 0;

    return {
      id: `${tenderId}-${criterion.criterion_key}-${index + 1}`,
      name: criterion.criterion_name,
      status,
      score,
      maxScore: criterion.weight_points,
      evidence: `${company.legal_name} ${criterion.criterion_name.toLowerCase()}.`,
      explanation:
        status === 'Passed'
          ? `${criterion.criterion_name} is compliant for this bidder.`
          : `${criterion.criterion_name} requires officer review or documentary confirmation.`,
    };
  });

const toAnalysis = (tender: RawTender, company: RawCompany, index: number): CompanyAnalysis => {
  const companyId = buildCompany(company, index).id;
  const criteria = buildCriteria(company, tender.criteria, tender.tender_id);
  const scoreBase = company.is_blacklisted ? 5 : 18;
  const udyamScore = company.udyam_status === 'active' ? 26 : 8;
  const gstScore = company.gstin ? 18 : 0;
  const panScore = company.pan ? 12 : 0;
  const typeScore = company.company_type === 'msme' ? 12 : company.company_type === 'startup' ? 10 : 8;
  const totalScore = Math.min(100, scoreBase + udyamScore + gstScore + panScore + typeScore);

  const complianceScore = Math.max(42, Math.min(99, totalScore));
  const complianceStatus =
    company.is_blacklisted || company.udyam_status === 'expired'
      ? 'Non-Compliant'
      : complianceScore >= 80
        ? 'Highly Compliant'
        : complianceScore >= 65
          ? 'Compliant'
          : 'Needs Review';

  const overallConclusion =
    company.is_blacklisted || company.udyam_status === 'expired'
      ? 'This bidder has a material compliance risk and should not proceed without documented clarification.'
      : 'This bidder is generally compliant for the tender and is suitable for officer review.';

  const strengths = [
    `${company.legal_name} has a valid GST profile and active participation record.`,
    company.udyam_status === 'active' ? 'Udyam/MSME status is active.' : 'Udyam/MSME status needs verification.',
  ];

  const weaknesses = company.is_blacklisted
    ? ['The bidder is flagged in blacklist/debarment checks.']
    : company.udyam_status === 'expired'
      ? ['The bidder Udyam status is expired and must be verified.']
      : ['Some tender compliance items may require officer verification before final approval.'];

  const missingDocuments = company.udyam_status === 'expired'
    ? ['Fresh Udyam registration certificate']
    : ['Any document not explicitly available in the uploaded bid pack'];

  return {
    companyId,
    tenderId: tender.tender_id,
    analysisStatus: 'Analyzed',
    complianceScore,
    complianceStatus,
    rank: null,
    criteria,
    aiAnalysis: {
      companyId,
      tenderId: tender.tender_id,
      overallConclusion,
      strengths,
      weaknesses,
      missingDocuments,
      warnings: company.is_blacklisted ? ['Blacklisting / debarment flag is active'] : ['Document verification recommended before final approval'],
      importantFindings: company.is_blacklisted
        ? ['Blacklisting status is a material red flag.']
        : ['Bidder meets the core tender compliance indicators.'],
      scoreReason: `Score derived from tender criteria, GST/PAN validity, Udyam status, and blacklist check for ${company.legal_name}.`,
      recommendationForOfficer:
        company.is_blacklisted || company.udyam_status === 'expired'
          ? 'Officer should seek immediate clarification or reject the bid pending compliance proof.'
          : 'Officer may proceed to review the bid documentation for final qualification.',
      generatedAt: new Date().toISOString(),
    },
    analyzedAt: new Date().toISOString(),
  };
};

const allCompanies = data.tenders.flatMap((tender) =>
  tender.companies.map((company, index) => ({ ...company, companyId: buildCompany(company, index).id }))
);

export const newMockCompanies: Company[] = Array.from(
  new Map(allCompanies.map((entry) => [entry.legal_name, buildCompany(entry, allCompanies.findIndex((c) => c.legal_name === entry.legal_name))])).values()
);

export const newMockTenders: Tender[] = data.tenders.map((tender) => {
  const companies = tender.companies.map((company, index) => buildCompany(company, index));
  return {
    id: tender.tender_id,
    title: tender.title,
    department: tender.department,
    category: tender.category,
    description: `${tender.title} for ${tender.department}. This tender is currently being evaluated by the procurement officer for compliance and capability review.`,
    value: tender.estimated_value,
    deadline: tender.submission_deadline,
    eligibilityRequirements: tender.criteria.map((criterion) => criterion.criterion_name),
    complianceCriteria: tender.criteria.map((criterion) => criterion.criterion_name),
    status: toTenderStatus(tender.status),
    bidderIds: companies.map((company) => company.id),
  };
});

export const newMockAnalyses: CompanyAnalysis[] = data.tenders.flatMap((tender) =>
  tender.companies.map((company, index) => toAnalysis(tender, company, index))
);
