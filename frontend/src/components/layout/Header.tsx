import { useLocation } from 'react-router-dom';
import { mockOfficer } from '../../data/mockOfficer';

const titleMap: Record<string, string> = {
  '/':        'Officer Dashboard',
  '/tenders': 'My Tenders',
  '/profile': 'Officer Profile',
};

function getTitle(pathname: string) {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.includes('/companies/') && pathname.includes('/ai-summary')) return 'AI Compliance Summary';
  if (pathname.includes('/companies/') && pathname.includes('/report')) return 'Detailed Compliance Report';
  if (pathname.includes('/companies/')) return 'Company Analysis';
  if (pathname.startsWith('/tenders/')) return 'Tender Details';
  return 'Bid-Scanner';
}

export function Header() {
  const { pathname } = useLocation();
  const initials = mockOfficer.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <header className="header">
      <div>
        <div className="header-title">{getTitle(pathname)}</div>
        <div className="header-breadcrumb">Government e-Marketplace — Procurement Officer Portal</div>
      </div>
      <div className="header-right">
        <div className="header-officer">
          <div className="header-officer-name">{mockOfficer.name}</div>
          <div className="header-officer-id">{mockOfficer.officerId}</div>
        </div>
        <div className="header-avatar">{initials}</div>
      </div>
    </header>
  );
}
