import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyMagneticEffect } from '../utils/animationUtils';

export default function Header({ activePage, onNavigate }) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const [loggedStudent, setLoggedStudent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const studentStr = localStorage.getItem('eventStudent');
    if (studentStr) {
      try { setLoggedStudent(JSON.parse(studentStr)); } catch (e) { }
    }

    const handleStorageChange = () => {
      const updated = localStorage.getItem('eventStudent');
      if (updated) {
        try { setLoggedStudent(JSON.parse(updated)); } catch (e) { }
      } else {
        setLoggedStudent(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentLoggedIn', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentLoggedIn', handleStorageChange);
    };
  }, []);

  // Close profile dropdown on click outside when open
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  const admissionsBtnRef = useRef(null);

  // Synchronize theme to document body and LocalStorage
  useEffect(() => {
    if (themeMode === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  // Monitor scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply magnetic effect to Admissions button
  useEffect(() => {
    const cleanupAdmissions = applyMagneticEffect(admissionsBtnRef.current, null, 0.25);

    return () => {
      if (cleanupAdmissions) cleanupAdmissions();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileActive(!isMobileActive);
  };

  const toggleTheme = (e) => {
    const isDark = themeMode === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    // Get trigger button / profile avatar position
    const targetElement = e?.currentTarget || dropdownRef.current?.querySelector('.profile-trigger-btn') || dropdownRef.current;
    const rect = targetElement ? targetElement.getBoundingClientRect() : null;

    const profileX = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const profileY = rect ? rect.top + rect.height / 2 : 40;

    if (!document.startViewTransition) {
      setThemeMode(nextTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      setThemeMode(nextTheme);
    });

    transition.ready.then(() => {
      if (nextTheme === 'dark') {
        // Dark mode: expands outward from profile avatar (top-right)
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
      } else {
        // Light mode: expands from desktop bottom-left corner towards top-right
        const startX = 0;
        const startY = window.innerHeight;
        const maxRadiusFromBL = Math.hypot(window.innerWidth, window.innerHeight);

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${startX}px ${startY}px)`,
              `circle(${maxRadiusFromBL}px at ${startX}px ${startY}px)`
            ],
          },
          {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      }
    });
  };

  // Unified cross-page navigation handler
  const handleLinkClick = (targetPage) => {
    setIsMobileActive(false);
    navigate(targetPage === 'home' ? '/' : `/${targetPage}`);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <nav className={`navbar-custom ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container-premium nav-container">

        {/* Logo */}
        <a
          href="#"
          className="nav-logo"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home', null);
          }}
        >
          <img src="/site-logo.svg" alt="Aditya University" style={{ height: '45px', width: 'auto' }} />
          <div style={{ height: '40px', width: '2px', backgroundColor: '#e5e7eb' }}></div>
          <img src="/naac-logo.svg" alt="NAAC A++ Grade" style={{ height: '40px', width: 'auto' }} />
        </a>

        {/* Menu Navigation */}
        <ul className={`nav-menu ${isMobileActive ? 'active' : ''}`}>
          <li>
            <a
              href="#"
              className={`nav-item-link ${activePage === 'home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('home', null);
              }}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#events"
              className={`nav-item-link ${activePage === 'events' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('events', null);
              }}
            >
              Events
            </a>
          </li>
          <li>
            <a
              href="#team"
              className={`nav-item-link ${activePage === 'team' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('team', null);
              }}
            >
              Team
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className={`nav-item-link ${activePage === 'contact' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('contact', null);
              }}
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="#gallery"
              className={`nav-item-link ${activePage === 'gallery' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('gallery', null);
              }}
            >
              Gallery
            </a>
          </li>
        </ul>

        {/* Actions (Admissions, Theme) */}
        <div className="nav-actions">
          {/* Theme Toggle Button outside profile dropdown */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              color: themeMode === 'dark' ? '#fff' : '#1e293b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
            aria-label="Toggle Theme"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <i className={`bi ${themeMode === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`}></i>
          </button>

          {/* Admissions CTA / Logged in User */}
          {loggedStudent ? (
            <div ref={dropdownRef} className="profile-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
                className="profile-trigger-btn"
                style={{
                  cursor: 'pointer',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  border: '2px solid rgba(var(--primary-rgb), 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  padding: 0,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'none',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
                }}
                title="Profile Menu"
              >
                {getInitials(loggedStudent.name)}
              </button>

              {dropdownOpen && (
                <div
                  className="profile-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                    padding: '16px',
                    minWidth: '240px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(var(--primary-rgb), 0.1)',
                      color: 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}>
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-light)', fontSize: '0.9rem', wordBreak: 'break-all', lineHeight: '1.2' }}>
                        {loggedStudent.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Student Account
                      </span>
                    </div>
                  </div>

                  <a
                    href="#dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      navigate('/dashboard', { state: { activeTab: 'overview' } });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-light)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="bi bi-speedometer2" style={{ fontSize: '1rem' }}></i>
                    Dashboard
                  </a>

                  <a
                    href="#profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      navigate('/dashboard', { state: { activeTab: 'profile', isEditingProfile: true, timestamp: Date.now() } });
                      window.dispatchEvent(new CustomEvent('openProfileTab'));
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-light)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="bi bi-person-badge-fill" style={{ fontSize: '1rem' }}></i>
                    Profile
                  </a>

                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#dc3545',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      localStorage.removeItem('eventStudent');
                      window.dispatchEvent(new Event('studentLoggedIn'));
                      setLoggedStudent(null);
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className="bi bi-box-arrow-right" style={{ fontSize: '1rem' }}></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              ref={admissionsBtnRef}
              href="#login"
              className="btn-admissions"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('login', null);
              }}
            >
              Login
            </a>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <i className={`bi ${isMobileActive ? 'bi-x' : 'bi-list'}`}></i>
        </button>

      </div>
    </nav>
  );
}
