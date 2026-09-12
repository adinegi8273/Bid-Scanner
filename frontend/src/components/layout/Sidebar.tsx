import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',        label: 'Dashboard',  icon: '⊞' },
  { to: '/tenders', label: 'My Tenders', icon: '📋' },
  { to: '/profile', label: 'My Profile', icon: '👤' },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">🔍 Bid-Scanner</div>
        <div className="sidebar-brand-sub">GeM Procurement Officer Portal</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>GeM Bid-Scanner v1.0</div>
        <div>SIH 2024 — Team Build</div>
      </div>
    </aside>
  );
}
