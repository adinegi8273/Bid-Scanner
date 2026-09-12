import { Company } from '../types';

export const mockCompanies: Company[] = [
  {
    id: 'comp-001',
    name: 'ABC Technologies Pvt Ltd',
    cin: 'U72200DL2011PTC219847',
    gstin: '07AABCA1234B1Z5',
    pan: 'AABCA1234B',
    registeredAddress: '4th Floor, DLF Cyber Hub, DLF Phase-2, Gurugram, Haryana – 122002',
    companyType: 'Private Limited',
    msmeCategory: 'Small',
  },
  {
    id: 'comp-002',
    name: 'XYZ Systems Ltd',
    cin: 'L30007MH1998PLC112345',
    gstin: '27AABCX9876C1ZA',
    pan: 'AABCX9876C',
    registeredAddress: '901, Marathon Futurex, NM Joshi Marg, Lower Parel, Mumbai – 400013',
    companyType: 'Public Limited',
  },
  {
    id: 'comp-003',
    name: 'Bharat Solutions Pvt Ltd',
    cin: 'U74999TN2015PTC098765',
    gstin: '33AABCB5678D1Z2',
    pan: 'AABCB5678D',
    registeredAddress: 'No. 12, 3rd Main Road, SIPCOT IT Park, Siruseri, Chennai – 603103',
    companyType: 'Private Limited',
    msmeCategory: 'Medium',
  },
  {
    id: 'comp-004',
    name: 'SecureTech India Pvt Ltd',
    cin: 'U72900KA2017PTC102938',
    gstin: '29AABCS3456E1Z9',
    pan: 'AABCS3456E',
    registeredAddress: '#205, Prestige Tech Cloud, Outer Ring Road, Bellandur, Bengaluru – 560103',
    companyType: 'Private Limited',
    msmeCategory: 'Micro',
  },
];
