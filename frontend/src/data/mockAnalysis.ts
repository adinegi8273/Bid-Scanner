import { CompanyAnalysis } from '../types';

// ─── Helper: criteria factories ───────────────────────────────────────────────

const udyamPassed = (score = 8) => ({
  id: 'udyam',
  name: 'Udyam / MSME Registration',
  status: 'Passed' as const,
  score,
  maxScore: 8,
  evidence: 'Udyam Registration Certificate No. UDYAM-DL-02-0047823 (Valid)',
  explanation: 'Valid Udyam certificate confirmed. Category: Small Enterprise. Registration active and not expired.',
});

const udyamNotApplicable = () => ({
  id: 'udyam',
  name: 'Udyam / MSME Registration',
  status: 'Not Verified' as const,
  score: 0,
  maxScore: 8,
  evidence: 'Company did not submit MSME/Udyam certificate',
  explanation: 'Company is a Public Limited entity and claims non-MSME status. NSIC/MSME benefits not applicable. No penalty applied.',
});

const gstPassed = (gstin: string) => ({
  id: 'gst-reg',
  name: 'GST Registration',
  status: 'Passed' as const,
  score: 10,
  maxScore: 10,
  evidence: `GSTIN: ${gstin} — Active registration verified on GSTN portal`,
  explanation: 'GST registration is active, valid, and matches the company PAN on record.',
});

const gstFilingPassed = () => ({
  id: 'gst-filing',
  name: 'GST Filing Compliance',
  status: 'Passed' as const,
  score: 10,
  maxScore: 10,
  evidence: 'GSTR-3B filed for last 8 quarters. No outstanding dues per GSTN portal.',
  explanation: 'All quarterly and monthly GST returns filed on time. No late fees or penalties detected.',
});

const gstFilingWarning = () => ({
  id: 'gst-filing',
  name: 'GST Filing Compliance',
  status: 'Warning' as const,
  score: 6,
  maxScore: 10,
  evidence: 'GSTR-3B: 2 quarters filed late (Q3 FY24, Q1 FY25). Late fees paid.',
  explanation: 'Returns filed but with delay in 2 quarters. Late fees are cleared; however, consistent delays indicate compliance risk.',
});

const gstFilingFailed = () => ({
  id: 'gst-filing',
  name: 'GST Filing Compliance',
  status: 'Failed' as const,
  score: 0,
  maxScore: 10,
  evidence: 'GSTR-3B missing for Q2 FY25 and Q3 FY25. Outstanding dues of ₹1,42,000.',
  explanation: 'Two consecutive quarters of non-filing detected. Outstanding dues not cleared. This is a critical disqualifying criterion per tender specification.',
});

const panPassed = (pan: string) => ({
  id: 'pan-it',
  name: 'PAN & Income Tax Compliance',
  status: 'Passed' as const,
  score: 12,
  maxScore: 12,
  evidence: `PAN: ${pan} — ITR filed for AY 2022-23, AY 2023-24, AY 2024-25. No outstanding demands.`,
  explanation: 'PAN verified and active. Income Tax Returns filed for all required assessment years. No tax demands or notices outstanding.',
});

const panWarning = (pan: string) => ({
  id: 'pan-it',
  name: 'PAN & Income Tax Compliance',
  status: 'Warning' as const,
  score: 8,
  maxScore: 12,
  evidence: `PAN: ${pan} — ITR filed for AY 2022-23 and AY 2023-24. AY 2024-25 return pending.`,
  explanation: 'Current year ITR not yet filed. Filing deadline has passed. This may indicate compliance lapse and warrants follow-up.',
});

const epfoPassed = () => ({
  id: 'epfo',
  name: 'EPFO Compliance',
  status: 'Passed' as const,
  score: 8,
  maxScore: 8,
  evidence: 'EPFO Establishment Code: DL/GGN/0078234. ECR filed for last 12 months. No arrears.',
  explanation: 'Employees\' Provident Fund contributions are current and all ECR challans are deposited on time.',
});

const epfoWarning = () => ({
  id: 'epfo',
  name: 'EPFO Compliance',
  status: 'Warning' as const,
  score: 5,
  maxScore: 8,
  evidence: 'ECR filing delayed for March 2025 and April 2025. Arrears of ₹38,400 partially cleared.',
  explanation: 'Recent ECR delay detected. Partial arrear outstanding. Company has submitted a clearance undertaking letter.',
});

const epfoFailed = () => ({
  id: 'epfo',
  name: 'EPFO Compliance',
  status: 'Failed' as const,
  score: 0,
  maxScore: 8,
  evidence: 'ECR not filed for last 5 months. Arrears: ₹2,14,000. EPFO show-cause notice issued.',
  explanation: 'Sustained non-compliance with PF obligations. Show-cause notice from EPFO is a critical disqualifier.',
});

const esicPassed = () => ({
  id: 'esic',
  name: 'ESIC Compliance',
  status: 'Passed' as const,
  score: 6,
  maxScore: 6,
  evidence: 'ESIC Registration No.: 42000345670000099. Half-yearly returns submitted. No dues.',
  explanation: 'ESIC registration active. Employee State Insurance contributions up to date. No pending dues.',
});

const esicNotVerified = () => ({
  id: 'esic',
  name: 'ESIC Compliance',
  status: 'Not Verified' as const,
  score: 0,
  maxScore: 6,
  evidence: 'ESIC certificate not submitted in bid documents',
  explanation: 'ESIC certificate not provided. Could not verify via portal due to API access limitation. Manual verification required.',
});

const startupPassed = () => ({
  id: 'startup',
  name: 'Startup India Registration',
  status: 'Passed' as const,
  score: 5,
  maxScore: 5,
  evidence: 'DPIIT Recognition No.: DIPP131077. Recognition valid till 31-03-2027.',
  explanation: 'Company is a DPIIT-recognised startup. Startup India benefits applicable as per tender clause 5.3.',
});

const startupNA = () => ({
  id: 'startup',
  name: 'Startup India Registration',
  status: 'Not Verified' as const,
  score: 0,
  maxScore: 5,
  evidence: 'Company did not claim Startup India benefits',
  explanation: 'Not applicable. Company does not qualify/claim Startup India registration. No marks allotted.',
});

const nsicPassed = () => ({
  id: 'nsic',
  name: 'NSIC Registration',
  status: 'Passed' as const,
  score: 4,
  maxScore: 4,
  evidence: 'NSIC Certificate No.: NS/2022/145673. Valid till 30-09-2026. Category: IT Equipment.',
  explanation: 'Valid NSIC registration in the relevant product category confirmed.',
});

const nsicNA = () => ({
  id: 'nsic',
  name: 'NSIC Registration',
  status: 'Not Verified' as const,
  score: 0,
  maxScore: 4,
  evidence: 'NSIC certificate not submitted',
  explanation: 'Company did not provide NSIC registration. Applicable marks not awarded.',
});

const oemPassed = () => ({
  id: 'oem',
  name: 'OEM Authorisation',
  status: 'Passed' as const,
  score: 15,
  maxScore: 15,
  evidence: 'OEM Authorisation Letter from Dell Technologies India Pvt Ltd, dated 01-07-2026. Valid for current tender.',
  explanation: 'Valid OEM authorisation letter submitted for all major hardware brands. Authorisation covers tender period.',
});

const oemWarning = () => ({
  id: 'oem',
  name: 'OEM Authorisation',
  status: 'Warning' as const,
  score: 10,
  maxScore: 15,
  evidence: 'OEM letter from HP Inc. valid. OEM letter from Cisco Systems expired on 30-06-2026.',
  explanation: 'Cisco authorisation expired before tender deadline. HP authorisation valid. Partial marks awarded; expired OEM letter must be replaced.',
});

const oemFailed = () => ({
  id: 'oem',
  name: 'OEM Authorisation',
  status: 'Failed' as const,
  score: 0,
  maxScore: 15,
  evidence: 'OEM authorisation letter not submitted in bid documents',
  explanation: 'OEM authorisation is a mandatory criterion as per NIT Clause 7. Non-submission results in disqualification from this criterion.',
});

const blacklistPassed = () => ({
  id: 'blacklist',
  name: 'Blacklisting / Debarment Check',
  status: 'Passed' as const,
  score: 12,
  maxScore: 12,
  evidence: 'Checked: GeM Portal, CVC Debarment list, DGS&D blacklist, MCA21. No adverse records found.',
  explanation: 'Company is clear on all government blacklisting and debarment databases as of verification date.',
});

const blacklistFailed = () => ({
  id: 'blacklist',
  name: 'Blacklisting / Debarment Check',
  status: 'Failed' as const,
  score: 0,
  maxScore: 12,
  evidence: 'CVC Debarment list: Entry found — SecureTech India Pvt Ltd debarred by MoD for 2 years (Order No. MoD/DIR/2024/1923, effective 01-01-2025)',
  explanation: 'Company is under active debarment order by Ministry of Defence. This is an absolute disqualifier. Officer must verify the order and take appropriate action.',
});

const tenderSpecificPassed = (evidence: string) => ({
  id: 'tender-specific',
  name: 'Tender-Specific Requirements',
  status: 'Passed' as const,
  score: 10,
  maxScore: 10,
  evidence,
  explanation: 'All tender-specific eligibility criteria verified and satisfied.',
});

const tenderSpecificWarning = (evidence: string) => ({
  id: 'tender-specific',
  name: 'Tender-Specific Requirements',
  status: 'Warning' as const,
  score: 6,
  maxScore: 10,
  evidence,
  explanation: 'Some tender-specific criteria are partially met. Officer review recommended before final decision.',
});

const tenderSpecificFailed = (evidence: string) => ({
  id: 'tender-specific',
  name: 'Tender-Specific Requirements',
  status: 'Failed' as const,
  score: 0,
  maxScore: 10,
  evidence,
  explanation: 'Critical tender-specific requirement not met. This may result in technical disqualification.',
});

// ─── Analyses: Tender 001 ─────────────────────────────────────────────────────

const t001c001: CompanyAnalysis = {
  companyId: 'comp-001',
  tenderId: 'tender-001',
  analysisStatus: 'Analyzed',
  complianceScore: 94,
  complianceStatus: 'Highly Compliant',
  rank: null,
  analyzedAt: '2026-09-10T09:15:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('07AABCA1234B1Z5'),
    gstFilingPassed(),
    panPassed('AABCA1234B'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicPassed(),
    oemPassed(),
    blacklistPassed(),
    tenderSpecificPassed('ISO 9001:2015 cert valid. Prior supply to NIC and BSNL confirmed. Annual turnover ₹18.4 Cr (FY25).'),
  ],
  aiAnalysis: {
    companyId: 'comp-001',
    tenderId: 'tender-001',
    overallConclusion:
      'ABC Technologies Pvt Ltd demonstrates strong statutory and regulatory compliance across all major criteria. The company is well-positioned for qualification in this tender.',
    strengths: [
      'Valid Udyam (Small Enterprise) registration with active NSIC certificate in IT Equipment category',
      'Impeccable GST filing record — all 8 quarters filed on time, zero penalties',
      'PAN and Income Tax returns filed for all 3 required assessment years with no outstanding demands',
      'Valid OEM authorisation from Dell Technologies covering the entire tender period',
      'Clean record on all government debarment and blacklisting databases',
      'Annual turnover of ₹18.4 Crore exceeds the ₹10 Crore minimum requirement by a significant margin',
    ],
    weaknesses: [
      'Startup India registration not claimed — company does not benefit from Startup India score allocation',
      'ESIC documentation submitted but some employee records require manual cross-check',
    ],
    missingDocuments: [],
    warnings: [],
    importantFindings: [
      'NSIC registration valid until 30-09-2026 — expires during the 5-year AMC period; renewal should be tracked',
      'Company has prior GeM seller registration with 4.7/5 rating (96 orders fulfilled)',
    ],
    scoreReason:
      'Score of 94/100 reflects full marks on GST, EPFO, OEM authorisation, blacklist check, and tender-specific requirements. 6 marks deducted as Startup India registration is not applicable (0/5) and minor ESIC documentation follow-up pending.',
    recommendationForOfficer:
      'This company presents a strong compliance profile. Recommend proceeding to financial and technical evaluation. Verify NSIC renewal timeline before AMC contract execution.',
    generatedAt: '2026-09-10T09:20:00Z',
  },
};

const t001c002: CompanyAnalysis = {
  companyId: 'comp-002',
  tenderId: 'tender-001',
  analysisStatus: 'Analyzed',
  complianceScore: 87,
  complianceStatus: 'Compliant',
  rank: null,
  analyzedAt: '2026-09-10T10:00:00Z',
  criteria: [
    udyamNotApplicable(),
    gstPassed('27AABCX9876C1ZA'),
    gstFilingWarning(),
    panPassed('AABCX9876C'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    oemPassed(),
    blacklistPassed(),
    tenderSpecificPassed('ISO 9001:2015 cert valid. Annual turnover ₹62 Cr. Supply history to MTNL and Railways confirmed.'),
  ],
  aiAnalysis: {
    companyId: 'comp-002',
    tenderId: 'tender-001',
    overallConclusion:
      'XYZ Systems Ltd is largely compliant with tender requirements. The company is a Public Limited entity with strong financials, but GST filing delays in two quarters are a noted concern.',
    strengths: [
      'Significantly above-threshold annual turnover of ₹62 Crore',
      'Valid OEM authorisation from multiple brands — comprehensive coverage',
      'EPFO and ESIC fully compliant with no arrears',
      'Proven track record of government supply (MTNL, Indian Railways)',
      'Clean debarment and blacklist record',
    ],
    weaknesses: [
      'GST returns filed late for Q3 FY24 and Q1 FY25 — 2 quarters with delays',
      'Late fees of ₹14,200 paid but delays indicate potential process gaps',
      'NSIC registration not held — applicable marks not awarded',
    ],
    missingDocuments: [],
    warnings: [
      'Repeated GST filing delays should be flagged for monitoring during contract execution if qualified',
    ],
    importantFindings: [
      'GST portal shows 2 delayed filings; however, all dues are cleared as of verification date',
      'Company is listed on GeM portal as verified seller with 4.5/5 rating',
    ],
    scoreReason:
      'Score of 87/100 reflects deductions for GST filing delays (-4 marks), absence of NSIC registration (-4 marks), and non-applicability of MSME/Udyam and Startup India marks. All other criteria passed with full marks.',
    recommendationForOfficer:
      'Company is eligible for consideration. The GST delays are a flag but not a disqualifier given the dues are cleared. Officer may seek an undertaking regarding future GST compliance before award.',
    generatedAt: '2026-09-10T10:05:00Z',
  },
};

const t001c003: CompanyAnalysis = {
  companyId: 'comp-003',
  tenderId: 'tender-001',
  analysisStatus: 'Analyzed',
  complianceScore: 76,
  complianceStatus: 'Needs Review',
  rank: null,
  analyzedAt: '2026-09-10T11:30:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('33AABCB5678D1Z2'),
    gstFilingWarning(),
    panWarning('AABCB5678D'),
    epfoWarning(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    oemWarning(),
    blacklistPassed(),
    tenderSpecificWarning('Annual turnover ₹9.2 Cr — below the ₹10 Cr threshold. Audited balance sheet submitted; company claims ₹11.2 Cr including group company.'),
  ],
  aiAnalysis: {
    companyId: 'comp-003',
    tenderId: 'tender-001',
    overallConclusion:
      'Bharat Solutions Pvt Ltd presents a mixed compliance profile. Several compliance gaps require officer attention before a qualification decision can be made.',
    strengths: [
      'Valid Udyam registration as a Medium Enterprise',
      'GST registration is active and verified',
      'ESIC compliance is in order',
      'Clean blacklist record',
    ],
    weaknesses: [
      'Annual turnover of ₹9.2 Crore falls below the mandatory ₹10 Crore threshold',
      'Income Tax return for AY 2024-25 not yet filed — a compliance gap',
      'EPFO arrears of ₹38,400 partially cleared — needs complete resolution',
      'Cisco OEM authorisation expired before tender deadline',
    ],
    missingDocuments: [
      'AY 2024-25 Income Tax Return',
      'Updated Cisco OEM authorisation letter',
      'Audited financial statements for FY 2024-25',
    ],
    warnings: [
      'Turnover below threshold — company has provided group company turnover data; officer must decide admissibility per NIT clause',
      'EPFO arrears partially outstanding — risk of escalation',
      'OEM letter expiry may disqualify hardware supply for Cisco equipment',
    ],
    importantFindings: [
      'Company applied turnover from associated entity (Bharat Group Holdings) to meet threshold — this requires legal interpretation of the NIT clause',
      'EPFO show-cause notice has not been issued; company is in active dialogue with EPFO regional office',
    ],
    scoreReason:
      'Score of 76/100 reflects partial marks on GST filing (6/10), PAN/IT (8/12), EPFO (5/8), OEM authorisation (10/15), and tender-specific requirements (6/10). NSIC and Startup India marks not applicable.',
    recommendationForOfficer:
      'This case requires careful review. The turnover shortfall and multiple compliance gaps make this a borderline bid. Officer should seek legal opinion on the group company turnover claim and obtain fresh OEM letter before making a qualification decision. Consider "Needs Further Review" status pending clarifications.',
    generatedAt: '2026-09-10T11:35:00Z',
  },
};

const t001c004: CompanyAnalysis = {
  companyId: 'comp-004',
  tenderId: 'tender-001',
  analysisStatus: 'Analyzed',
  complianceScore: 62,
  complianceStatus: 'Non-Compliant',
  rank: null,
  analyzedAt: '2026-09-10T12:00:00Z',
  criteria: [
    { ...udyamPassed(8), msmeCategory: undefined } as ReturnType<typeof udyamPassed>,
    gstPassed('29AABCS3456E1Z9'),
    gstFilingFailed(),
    panPassed('AABCS3456E'),
    epfoFailed(),
    esicNotVerified(),
    startupPassed(),
    nsicNA(),
    oemFailed(),
    blacklistFailed(),
    tenderSpecificFailed('Annual turnover ₹2.1 Cr — significantly below ₹10 Cr threshold. ISO 9001 certificate expired 15-03-2026.'),
  ],
  aiAnalysis: {
    companyId: 'comp-004',
    tenderId: 'tender-001',
    overallConclusion:
      'SecureTech India Pvt Ltd has critical compliance failures that make qualification for this tender inadvisable. Multiple mandatory criteria are not met.',
    strengths: [
      'Valid DPIIT Startup recognition (Startup India)',
      'GST registration is active',
      'PAN and IT compliance is clear',
    ],
    weaknesses: [
      'Company is under active MoD debarment order — this is an absolute disqualifier',
      'GST returns not filed for 2 consecutive quarters with outstanding dues',
      'EPFO compliance has completely broken down — show-cause notice issued',
      'OEM authorisation not submitted — mandatory criterion',
      'Annual turnover ₹2.1 Crore — far below the required ₹10 Crore',
      'ISO 9001:2015 certificate expired 6 months before tender deadline',
    ],
    missingDocuments: [
      'OEM Authorisation Letter',
      'ESIC Compliance Certificate',
      'Valid ISO 9001:2015 Certificate',
      'GST Returns for Q2 and Q3 FY25',
    ],
    warnings: [
      'CRITICAL: MoD debarment order (Order No. MoD/DIR/2024/1923) is active and valid',
      'CRITICAL: GST non-compliance with outstanding dues of ₹1,42,000',
      'CRITICAL: EPFO show-cause notice with arrears of ₹2,14,000',
    ],
    importantFindings: [
      'The MoD debarment order disqualifies the company from all central government procurement under GFR Rule 151',
      'Multiple simultaneous compliance failures suggest systemic governance issues',
      'Company appears to be in financial distress based on turnover trend',
    ],
    scoreReason:
      'Score of 62/100 is misleadingly high due to GST registration and PAN/IT base marks. Effective compliance score considering critical disqualifiers is functionally zero.',
    recommendationForOfficer:
      'STRONG RECOMMENDATION: Reject this bid. The active MoD debarment order alone is sufficient grounds for disqualification under GFR. The multiple additional compliance failures reinforce this recommendation. Officer should formally disqualify and record reason citing the debarment order.',
    generatedAt: '2026-09-10T12:05:00Z',
  },
};

// ─── Analyses: Tender 002 ─────────────────────────────────────────────────────

const t002c001: CompanyAnalysis = {
  companyId: 'comp-001',
  tenderId: 'tender-002',
  analysisStatus: 'Analyzed',
  complianceScore: 91,
  complianceStatus: 'Highly Compliant',
  rank: null,
  analyzedAt: '2026-09-08T14:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('07AABCA1234B1Z5'),
    gstFilingPassed(),
    panPassed('AABCA1234B'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    oemPassed(),
    blacklistPassed(),
    tenderSpecificPassed('BIS certificates submitted for all 4 camera models. Security clearance certificate valid till 2027.'),
  ],
  aiAnalysis: {
    companyId: 'comp-001',
    tenderId: 'tender-002',
    overallConclusion: 'ABC Technologies Pvt Ltd is highly compliant for the CCTV surveillance tender with strong credentials.',
    strengths: ['Full GST and PAN compliance', 'Valid OEM authorisations', 'BIS certified products', 'Security clearance valid'],
    weaknesses: ['NSIC registration not held — applicable marks not awarded'],
    missingDocuments: [],
    warnings: [],
    importantFindings: ['MHA empanelment certificate not submitted but not mandatory per NIT'],
    scoreReason: 'Score 91/100. Deductions: NSIC (0/4), Startup India (0/5 — not applicable).',
    recommendationForOfficer: 'Strong candidate. Proceed to technical evaluation.',
    generatedAt: '2026-09-08T14:05:00Z',
  },
};

const t002c002: CompanyAnalysis = {
  companyId: 'comp-002',
  tenderId: 'tender-002',
  analysisStatus: 'Analyzed',
  complianceScore: 84,
  complianceStatus: 'Compliant',
  rank: null,
  analyzedAt: '2026-09-08T15:00:00Z',
  criteria: [
    udyamNotApplicable(),
    gstPassed('27AABCX9876C1ZA'),
    gstFilingWarning(),
    panPassed('AABCX9876C'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    oemPassed(),
    blacklistPassed(),
    tenderSpecificPassed('BIS certification valid. Security clearance certificate submitted for all key personnel.'),
  ],
  aiAnalysis: {
    companyId: 'comp-002',
    tenderId: 'tender-002',
    overallConclusion: 'XYZ Systems Ltd is compliant with this tender\'s requirements, with a minor GST filing concern.',
    strengths: ['Strong financial standing', 'Valid OEM authorisations and BIS certs', 'Security clearances in order'],
    weaknesses: ['GST filing delays in 2 quarters', 'No MSME/NSIC benefit'],
    missingDocuments: [],
    warnings: ['Monitor GST compliance during contract period'],
    importantFindings: ['Company has executed similar CCTV contracts for state police departments'],
    scoreReason: 'Score 84/100. Deductions: GST filing (-4), MSME/Udyam (0/8 — not applicable), NSIC (0/4).',
    recommendationForOfficer: 'Eligible for qualification. Seek GST compliance undertaking.',
    generatedAt: '2026-09-08T15:05:00Z',
  },
};

const t002c003: CompanyAnalysis = {
  companyId: 'comp-003',
  tenderId: 'tender-002',
  analysisStatus: 'Analyzed',
  complianceScore: 71,
  complianceStatus: 'Needs Review',
  rank: null,
  analyzedAt: '2026-09-08T16:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('33AABCB5678D1Z2'),
    gstFilingWarning(),
    panWarning('AABCB5678D'),
    epfoWarning(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    oemWarning(),
    blacklistPassed(),
    tenderSpecificWarning('One camera model (PTZ-4K) lacks valid BIS certificate. Security clearance for 2 key personnel pending renewal.'),
  ],
  aiAnalysis: {
    companyId: 'comp-003',
    tenderId: 'tender-002',
    overallConclusion: 'Bharat Solutions Pvt Ltd has several compliance gaps. Review recommended before qualification decision.',
    strengths: ['Udyam registration valid', 'Clean blacklist record', 'ESIC compliant'],
    weaknesses: ['Missing BIS certificate for key camera model', 'Security clearance renewal pending', 'EPFO arrears partially outstanding', 'OEM letter expired for one vendor'],
    missingDocuments: ['BIS certificate for PTZ-4K camera model', 'Renewed security clearance for 2 personnel', 'Updated Cisco OEM letter'],
    warnings: ['BIS certification gap may be a technical disqualifier under NIT clause', 'Security clearance lapse is a risk for a MHA tender'],
    importantFindings: ['BIS certificate for PTZ-4K model lapsed 45 days before tender submission'],
    scoreReason: 'Score 71/100. Multiple partial marks and missing documents drive the lower score.',
    recommendationForOfficer: 'Issue clarification notice. Ask company to submit fresh BIS certificate and renewed security clearances within 7 days. Consider "Needs Further Review" pending documents.',
    generatedAt: '2026-09-08T16:05:00Z',
  },
};

const t002c004: CompanyAnalysis = {
  companyId: 'comp-004',
  tenderId: 'tender-002',
  analysisStatus: 'Analyzed',
  complianceScore: 55,
  complianceStatus: 'Non-Compliant',
  rank: null,
  analyzedAt: '2026-09-08T17:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('29AABCS3456E1Z9'),
    gstFilingFailed(),
    panPassed('AABCS3456E'),
    epfoFailed(),
    esicNotVerified(),
    startupPassed(),
    nsicNA(),
    oemFailed(),
    blacklistFailed(),
    tenderSpecificFailed('Security clearance certificate not submitted. BIS certificates missing for all products.'),
  ],
  aiAnalysis: {
    companyId: 'comp-004',
    tenderId: 'tender-002',
    overallConclusion: 'SecureTech India Pvt Ltd fails multiple critical criteria for this MHA tender. Qualification is not recommended.',
    strengths: ['Startup India recognition', 'Udyam registration valid'],
    weaknesses: ['Active MoD debarment order', 'GST non-compliance', 'EPFO failure', 'No security clearance for MHA tender', 'OEM authorisation missing', 'BIS certificates missing'],
    missingDocuments: ['Security Clearance Certificate', 'BIS Certificates for all products', 'OEM Authorisation Letters', 'GST Returns Q2 & Q3 FY25', 'ESIC Certificate'],
    warnings: ['CRITICAL: MoD debarment order active', 'CRITICAL: Security clearance absent — this is mandatory for MHA procurement', 'All critical criteria failed simultaneously'],
    importantFindings: ['The absence of security clearance alone disqualifies from MHA tender procurement', 'Debarment order compounds the disqualification'],
    scoreReason: 'Score 55/100 reflects base marks from Udyam, GST registration, PAN, and Startup India. All operational compliance criteria failed.',
    recommendationForOfficer: 'Disqualify immediately. Security clearance absence and debarment order are absolute bars. No further review needed.',
    generatedAt: '2026-09-08T17:05:00Z',
  },
};

// ─── Analyses: Tender 003 (only 3 bidders, comp-004 not bidding) ──────────────

const t003c001: CompanyAnalysis = {
  companyId: 'comp-001',
  tenderId: 'tender-003',
  analysisStatus: 'Analyzed',
  complianceScore: 89,
  complianceStatus: 'Compliant',
  rank: null,
  analyzedAt: '2026-09-11T09:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('07AABCA1234B1Z5'),
    gstFilingPassed(),
    panPassed('AABCA1234B'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    {
      id: 'cdsco',
      name: 'CDSCO Licence & ISO 13485',
      status: 'Passed',
      score: 15,
      maxScore: 15,
      evidence: 'CDSCO MD-16 Licence No.: MD-37/15/2023/MDC for Medical Devices. ISO 13485:2016 cert from TÜV SÜD, valid till 2027.',
      explanation: 'CDSCO manufacturing licence and ISO 13485 certification valid and covering the required medical device categories.',
    },
    blacklistPassed(),
    tenderSpecificPassed('AERB approval submitted for X-ray equipment (Ref: AERB/MED/2025/0094). Prior supply to AIIMS Delhi and PGIMER Chandigarh confirmed.'),
  ],
  aiAnalysis: {
    companyId: 'comp-001',
    tenderId: 'tender-003',
    overallConclusion: 'ABC Technologies Pvt Ltd demonstrates good compliance for the medical equipment tender. CDSCO and AERB credentials are in order.',
    strengths: ['Valid CDSCO licence and ISO 13485', 'AERB approval for X-ray equipment', 'Proven supply history to AIIMS and PGIMER', 'Full GST and statutory compliance'],
    weaknesses: ['NSIC marks not applicable — minor scoring gap'],
    missingDocuments: [],
    warnings: [],
    importantFindings: ['Company has supplied similar equipment to 4 Government hospitals in last 3 years'],
    scoreReason: 'Score 89/100. Deductions: NSIC (0/4), Startup India (0/5 — not applicable). All other criteria passed.',
    recommendationForOfficer: 'Eligible for qualification. Verify AERB approval validity date during contract execution.',
    generatedAt: '2026-09-11T09:05:00Z',
  },
};

const t003c002: CompanyAnalysis = {
  companyId: 'comp-002',
  tenderId: 'tender-003',
  analysisStatus: 'Analyzed',
  complianceScore: 84,
  complianceStatus: 'Compliant',
  rank: null,
  analyzedAt: '2026-09-11T10:15:00Z',
  criteria: [
    udyamNotApplicable(),
    gstPassed('27AABCX9876C1ZA'),
    gstFilingWarning(),
    panPassed('AABCX9876C'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    {
      id: 'cdsco',
      name: 'CDSCO Licence & ISO 13485',
      status: 'Passed',
      score: 15,
      maxScore: 15,
      evidence: 'CDSCO Import Licence No. IL-MD-2024/0918. ISO 13485:2016 certificate valid up to December 2026.',
      explanation: 'Valid CDSCO import licence and ISO 13485 quality certification for medical diagnostic equipment submitted.',
    },
    blacklistPassed(),
    tenderSpecificWarning('AERB type approval submitted for portable ultrasound; AERB clearance for X-ray equipment under renewal application (Ref: AERB/RNW/2026/1102).'),
  ],
  aiAnalysis: {
    companyId: 'comp-002',
    tenderId: 'tender-003',
    overallConclusion: 'XYZ Systems Ltd qualifies on major statutory and CDSCO parameters, but AERB renewal for X-ray units requires officer follow-up.',
    strengths: [
      'High annual turnover of ₹62 Crore exceeds the ₹25 Crore tender threshold',
      'Valid CDSCO import licence and ISO 13485 certification',
      'EPFO and ESIC records fully compliant',
      'No adverse blacklist or debarment history',
    ],
    weaknesses: [
      'AERB clearance for X-ray equipment is under renewal; temporary acknowledgement letter submitted',
      'GST filing delays in 2 previous quarters',
    ],
    missingDocuments: ['Final renewed AERB Approval Certificate for Digital X-Ray model'],
    warnings: ['AERB equipment clearance pending renewal — must be resolved prior to supply in district hospitals'],
    importantFindings: ['Company submitted an undertaking to furnish renewed AERB certificate within 14 days'],
    scoreReason: 'Score of 84/100 reflects minor deductions for GST delays (-4 marks) and provisional AERB renewal status (-4 marks).',
    recommendationForOfficer: 'Candidate is technically strong but requires officer to verify AERB renewal status before issuing contract award.',
    generatedAt: '2026-09-11T10:20:00Z',
  },
};

const t003c003: CompanyAnalysis = {
  companyId: 'comp-003',
  tenderId: 'tender-003',
  analysisStatus: 'Analyzed',
  complianceScore: 68,
  complianceStatus: 'Needs Review',
  rank: null,
  analyzedAt: '2026-09-11T11:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('33AABCB5678D1Z2'),
    gstFilingWarning(),
    panWarning('AABCB5678D'),
    epfoWarning(),
    esicPassed(),
    startupNA(),
    nsicNA(),
    {
      id: 'cdsco',
      name: 'CDSCO Licence & ISO 13485',
      status: 'Warning',
      score: 8,
      maxScore: 15,
      evidence: 'CDSCO licence submitted is expired (Lapsed 30-04-2026). ISO 13485 valid.',
      explanation: 'Mandatory CDSCO manufacturing/import licence expired before the tender submission date. Critical regulatory discrepancy.',
    },
    blacklistPassed(),
    tenderSpecificFailed('Annual turnover ₹9.2 Cr falls below the mandatory ₹25 Cr requirement. No AERB certificate submitted for X-Ray machinery.'),
  ],
  aiAnalysis: {
    companyId: 'comp-003',
    tenderId: 'tender-003',
    overallConclusion: 'Bharat Solutions Pvt Ltd fails key regulatory criteria including expired CDSCO licence, missing AERB certification, and turnover shortfall.',
    strengths: ['Valid Udyam Medium Enterprise registration', 'ESIC compliance up to date', 'Clean debarment and blacklist records'],
    weaknesses: [
      'CRITICAL: CDSCO medical device licence expired on 30-04-2026',
      'CRITICAL: Annual turnover of ₹9.2 Cr is significantly below the ₹25 Cr requirement',
      'Missing AERB clearance for radiation equipment',
      'Pending AY 2024-25 Income Tax Return and partial EPFO arrears',
    ],
    missingDocuments: [
      'Valid CDSCO Medical Device Licence (MD-16/17)',
      'AERB Type Approval for X-Ray equipment',
      'Audited balance sheets demonstrating ₹25 Cr turnover',
    ],
    warnings: [
      'Supplying medical radiation equipment without valid AERB and CDSCO licence violates Medical Device Rules 2017',
      'Turnover shortfall of ₹15.8 Crore against tender requirement',
    ],
    importantFindings: ['Company requested exemption under MSME relaxation clause, but CDSCO statutory safety rules cannot be relaxed'],
    scoreReason: 'Score of 68/100 heavily penalized due to expired CDSCO licence (8/15), failed tender-specific requirements (0/10), and statutory warnings.',
    recommendationForOfficer: 'Recommend disqualification on grounds of expired CDSCO licence and failure to meet the ₹25 Cr turnover requirement.',
    generatedAt: '2026-09-11T11:05:00Z',
  },
};

// ─── Analyses: Tender 004 (2 bidders) ────────────────────────────────────────

const t004c002: CompanyAnalysis = {
  companyId: 'comp-002',
  tenderId: 'tender-004',
  analysisStatus: 'Analyzed',
  complianceScore: 92,
  complianceStatus: 'Highly Compliant',
  rank: null,
  analyzedAt: '2026-08-25T10:00:00Z',
  criteria: [
    udyamNotApplicable(),
    gstPassed('27AABCX9876C1ZA'),
    gstFilingPassed(),
    panPassed('AABCX9876C'),
    epfoPassed(),
    esicPassed(),
    startupNA(),
    {
      id: 'gem-seller',
      name: 'GeM Seller Registration',
      status: 'Passed',
      score: 10,
      maxScore: 10,
      evidence: 'GeM Seller ID: GEM/2019/B/452731. Active seller with 4.8/5 rating, 213 fulfilled orders.',
      explanation: 'Active GeM portal registration with excellent track record. All required product categories listed.',
    },
    blacklistPassed(),
    tenderSpecificPassed('Annual turnover ₹62 Cr. Supplying stationery to 8 central govt ministries currently.'),
  ],
  aiAnalysis: {
    companyId: 'comp-002',
    tenderId: 'tender-004',
    overallConclusion: 'XYZ Systems Ltd is highly compliant for this stationery ARC tender with excellent GeM credentials.',
    strengths: ['Top-rated GeM seller', 'Fully compliant on all statutory criteria', 'Strong delivery track record', 'Existing ministry relationships'],
    weaknesses: ['No MSME/Udyam — applicable marks not awarded'],
    missingDocuments: [],
    warnings: [],
    importantFindings: ['Company currently supplies stationery to Ministry of Railways — similar scope'],
    scoreReason: 'Score 92/100. Deductions only for non-applicable MSME/Udyam (0/8).',
    recommendationForOfficer: 'Highly recommended for qualification in this ARC tender.',
    generatedAt: '2026-08-25T10:05:00Z',
  },
};

const t004c004: CompanyAnalysis = {
  companyId: 'comp-004',
  tenderId: 'tender-004',
  analysisStatus: 'Analyzed',
  complianceScore: 58,
  complianceStatus: 'Non-Compliant',
  rank: null,
  analyzedAt: '2026-08-25T11:00:00Z',
  criteria: [
    udyamPassed(8),
    gstPassed('29AABCS3456E1Z9'),
    gstFilingFailed(),
    panPassed('AABCS3456E'),
    epfoFailed(),
    esicNotVerified(),
    startupPassed(),
    {
      id: 'gem-seller',
      name: 'GeM Seller Registration',
      status: 'Warning',
      score: 5,
      maxScore: 10,
      evidence: 'GeM Seller ID: GEM/2021/B/789012. Account suspended due to 3 unfulfilled orders. Rating: 2.9/5.',
      explanation: 'GeM account is under suspension review. Suspended accounts cannot participate in GeM tenders per GeM portal policy.',
    },
    blacklistFailed(),
    tenderSpecificFailed('GeM seller account suspended. GST non-compliance disqualifies under MSME scheme clause.'),
  ],
  aiAnalysis: {
    companyId: 'comp-004',
    tenderId: 'tender-004',
    overallConclusion: 'SecureTech India Pvt Ltd fails multiple criteria for this GeM ARC tender. Not recommended for qualification.',
    strengths: ['Udyam registration valid', 'Startup India recognition', 'PAN compliance clear'],
    weaknesses: ['GeM seller account suspended', 'GST non-compliance', 'EPFO failure', 'Debarment order active'],
    missingDocuments: ['ESIC Certificate', 'GST Returns Q2 & Q3 FY25'],
    warnings: ['GeM suspended sellers cannot participate in GeM ARCs — immediate disqualifier', 'Debarment order makes this an absolute bar'],
    importantFindings: ['GeM account has 3 unfulfilled orders resulting in suspension — indicates delivery reliability risk'],
    scoreReason: 'Score 58/100. GST filing, EPFO, GeM seller status, and blacklist failures drive down the score.',
    recommendationForOfficer: 'Disqualify. GeM account suspension alone bars participation in this tender type.',
    generatedAt: '2026-08-25T11:05:00Z',
  },
};

// ─── Master Export ─────────────────────────────────────────────────────────────

export const mockAnalyses: CompanyAnalysis[] = [
  t001c001, t001c002, t001c003, t001c004,
  t002c001, t002c002, t002c003, t002c004,
  t003c001, t003c002, t003c003,
  t004c002, t004c004,
];
