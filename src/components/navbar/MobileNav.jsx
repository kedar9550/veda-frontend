import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileNav.css';

export default function MobileNav({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const current = localStorage.getItem('theme') || (document.body.classList.contains('dark-theme') ? 'dark' : 'light');
      setThemeMode(current);
    };

    const observer = new MutationObserver(() => {
      setThemeMode(document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = (e) => {
    const isDark = document.body.classList.contains('dark-theme');
    const nextTheme = isDark ? 'light' : 'dark';

    const targetElement = e?.currentTarget;
    const rect = targetElement ? targetElement.getBoundingClientRect() : null;

    const profileX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const profileY = rect ? rect.top + rect.height / 2 : window.innerHeight - 40;

    const applyThemeChange = () => {
      if (nextTheme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
      localStorage.setItem('theme', nextTheme);
      setThemeMode(nextTheme);
    };

    if (!document.startViewTransition) {
      applyThemeChange();
      return;
    }

    const transition = document.startViewTransition(() => {
      applyThemeChange();
    });

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(profileX, window.innerWidth - profileX),
        Math.max(profileY, window.innerHeight - profileY)
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${profileX}px ${profileY}px)`,
            `circle(${endRadius}px at ${profileX}px ${profileY}px)`
          ],
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

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

        {/* Theme Toggle Button at the end of mobile nav */}
        <button
          className="mobile-nav-item theme-toggle-item"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="mobile-nav-icon-wrapper">
            <i className={`bi ${themeMode === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
          </div>
        </button>
      </nav>
    </div>
  );
}
