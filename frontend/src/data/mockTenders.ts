import { Tender } from '../types';

export const mockTenders: Tender[] = [
  {
    id: 'tender-001',
    title: 'Supply and Installation of Server Infrastructure for UIDAI Data Centre',
    department: 'Ministry of Electronics & Information Technology (MeitY)',
    category: 'IT Infrastructure',
    description:
      'Procurement of high-performance rack servers, blade chassis, storage area network (SAN) equipment, and associated networking hardware for the UIDAI Tier-IV Data Centre, Manesar, Haryana. The vendor shall also provide on-site installation, configuration, and a 5-year comprehensive AMC.',
    value: 42000000, // ₹4.2 Cr
    deadline: '2026-10-15',
    eligibilityRequirements: [
      'Minimum annual turnover of ₹10 Crore in each of the last 3 financial years',
      'Valid MSME/Udyam registration (preferred for MSEs)',
      'OEM authorisation letter for all hardware supplied',
      'ISO 9001:2015 certification mandatory',
      'No adverse findings in CBI/Vigilance records for last 7 years',
      'Prior experience of supply to at least 2 Central/State Government entities',
    ],
    complianceCriteria: [
      'Udyam / MSME Registration',
      'GST Registration & Filing (last 4 quarters)',
      'PAN & Income Tax Returns (last 3 AYs)',
      'EPFO Compliance',
      'ESIC Compliance',
      'OEM Authorisation Letter',
      'ISO Certification',
      'Blacklisting / Debarment Check',
      'NSIC Registration (if applicable)',
      'Startup India Registration (if applicable)',
    ],
    status: 'Active',
    bidderIds: ['comp-001', 'comp-002', 'comp-003', 'comp-004'],
  },
  {
    id: 'tender-002',
    title: 'Procurement of IP-Based CCTV Surveillance System for Border Security Force',
    department: 'Ministry of Home Affairs (MHA)',
    category: 'Security Equipment',
    description:
      'Supply, installation, testing, and commissioning of 2,400 IP-based PTZ cameras, NVR systems, video management software (VMS), and control room equipment for BSF Forward Operating Bases across the Western border. The contract includes a 3-year comprehensive maintenance contract post-commissioning.',
    value: 18000000, // ₹1.8 Cr
    deadline: '2026-09-28',
    eligibilityRequirements: [
      'Valid DSIR recognition or DPIIT Startup registration preferred',
      'Minimum 3 years of experience in security/surveillance systems',
      'MHA/MoD empanelment certificate (desirable)',
      'All products must be BIS certified or carry valid type approval',
      'Company and key personnel must have valid security clearance',
    ],
    complianceCriteria: [
      'Udyam / MSME Registration',
      'GST Registration & Filing',
      'PAN & Income Tax Returns',
      'EPFO Compliance',
      'ESIC Compliance',
      'BIS Certification for Products',
      'Security Clearance Certificate',
      'Blacklisting / Debarment Check',
      'OEM Authorisation',
    ],
    status: 'Active',
    bidderIds: ['comp-001', 'comp-002', 'comp-003', 'comp-004'],
  },
  {
    id: 'tender-003',
    title: 'Supply of Medical Diagnostic Equipment to District Hospitals under Ayushman Bharat',
    department: 'Ministry of Health & Family Welfare (MoHFW)',
    category: 'Medical Equipment',
    description:
      'Procurement of digital X-ray machines, portable ultrasound units, automated haematology analysers, and biochemistry analysers for 18 District Hospitals across Madhya Pradesh and Rajasthan. Equipment must comply with CDSCO registration requirements. Comprehensive AMC for 5 years included.',
    value: 75000000, // ₹7.5 Cr
    deadline: '2026-11-30',
    eligibilityRequirements: [
      'CDSCO Manufacturing Licence or valid import licence for all equipment',
      'Minimum annual turnover of ₹25 Crore',
      'Valid AERB approval for X-ray equipment',
      'ISO 13485 certification mandatory',
      'Prior supply to at least 3 Government hospitals',
    ],
    complianceCriteria: [
      'Udyam / MSME Registration',
      'GST Registration & Filing',
      'PAN & Income Tax Returns',
      'EPFO Compliance',
      'ESIC Compliance',
      'CDSCO Licence',
      'ISO 13485 Certification',
      'AERB Approval',
      'Blacklisting / Debarment Check',
    ],
    status: 'Pending Review',
    bidderIds: ['comp-001', 'comp-002', 'comp-003'],
  },
  {
    id: 'tender-004',
    title: 'Annual Rate Contract for Office Stationery and Consumables — North Block',
    department: 'Ministry of Finance',
    category: 'Office Supplies',
    description:
      'Annual Rate Contract (ARC) for supply of office stationery, printer cartridges, toner, files, registers, and general consumables for North Block and Shastri Bhavan offices under the Ministry of Finance. Estimated annual requirement based on historical consumption data.',
    value: 4500000, // ₹45 L
    deadline: '2026-09-20',
    eligibilityRequirements: [
      'Valid MSME/Udyam registration mandatory',
      'GeM Portal registered seller',
      'GST compliant for past 8 quarters',
      'No blacklisting on DGS&D or GeM portal',
    ],
    complianceCriteria: [
      'Udyam / MSME Registration',
      'GST Registration & Filing',
      'PAN & Income Tax Returns',
      'EPFO Compliance',
      'ESIC Compliance',
      'GeM Seller Registration',
      'Blacklisting / Debarment Check',
    ],
    status: 'Completed',
    bidderIds: ['comp-002', 'comp-004'],
  },
];
