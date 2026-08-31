import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileNav.css';

export default function MobileNav({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleNav = (target, e) => {
    if (e) e.preventDefault();
    if (onNavigate) {
      onNavigate(target);
    } else {
      navigate(target === 'home' ? '/' : `/${target}`);
    }
  };

  // Determine active item key
  const getActiveKey = () => {
    if (activePage) return activePage;
    if (currentPath === '/' || currentPath === '/home') return 'home';
    if (currentPath.startsWith('/events')) return 'events';
    if (currentPath.startsWith('/team')) return 'team';
    if (currentPath.startsWith('/gallery')) return 'gallery';
    if (currentPath.startsWith('/contact')) return 'contact';
    // if (currentPath.startsWith('/about')) return 'about';
    return '';
  };

  const activeKey = getActiveKey();

  const navItems = [
    {
      key: 'home',
      label: 'Home',
      iconActive: 'bi-house-door-fill',
      iconInactive: 'bi-house-door',
      path: 'home',
    },
    {
      key: 'events',
      label: 'Events',
      iconActive: 'bi-calendar-event-fill',
      iconInactive: 'bi-calendar-event',
      path: 'events',
    },
    {
      key: 'team',
      label: 'Team',
      iconActive: 'bi-people-fill',
      iconInactive: 'bi-people',
      path: 'team',
    },
    {
      key: 'gallery',
      label: 'Gallery',
      iconActive: 'bi-easel-fill',
      iconInactive: 'bi-easel',
      path: 'gallery',
    },
    {
      key: 'contact',
      label: 'Contact',
      iconActive: 'bi-envelope-fill',
      iconInactive: 'bi-envelope',
      path: 'contact',
    },
  ];

  return (
    <div className="mobile-nav-wrapper">
      <nav className="mobile-nav-pill">
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={(e) => handleNav(item.path, e)}
              aria-label={item.label}
              title={item.label}
            >
              <div className="mobile-nav-icon-wrapper">
                <i className={`bi ${isActive ? item.iconActive : item.iconInactive}`}></i>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
