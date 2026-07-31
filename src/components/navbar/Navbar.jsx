import React, { useState, useEffect, useRef } from 'react';
import { applyMagneticEffect } from '../utils/animationUtils';

export default function Navbar({ activePage, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const [loggedStudent, setLoggedStudent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const studentStr = localStorage.getItem('eventStudent');
    if (studentStr) {
      try { setLoggedStudent(JSON.parse(studentStr)); } catch (e) {}
    }
    
    const handleStorageChange = () => {
      const updated = localStorage.getItem('eventStudent');
      if (updated) {
        try { setLoggedStudent(JSON.parse(updated)); } catch (e) {}
      } else {
        setLoggedStudent(null);
      }
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentLoggedIn', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentLoggedIn', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Unified cross-page navigation handler
  const handleLinkClick = (targetPage) => {
    setIsMobileActive(false);
    window.location.hash = targetPage === 'home' ? '' : `#${targetPage}`;
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
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home', null);
          }}
        >
          <span>
            <span className="logo-text-aditya">VEDA</span>
            <span className="logo-text-uni">&nbsp;2026</span>
          </span>
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
              href="#about"
              className={`nav-item-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('about', null);
              }}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#poster"
              className={`nav-item-link ${activePage === 'poster' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('poster', null);
              }}
            >
              Poster
            </a>
          </li>
        </ul>

        {/* Actions (Admissions, Theme) */}
        <div className="nav-actions">


          {/* Admissions CTA / Logged in User */}
          {loggedStudent ? (
            <div ref={dropdownRef} className="profile-dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
                  boxShadow: '0 4px 10px rgba(var(--primary-rgb), 0.2)',
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
                      handleLinkClick('dashboard', null);
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

                  <button
                    onClick={toggleTheme}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: 'var(--text-muted)',
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-light)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <i className={`bi ${themeMode === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`} style={{ fontSize: '1rem' }}></i>
                    {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

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
                      window.location.hash = '';
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
              <i className="bi bi-arrow-right"></i>
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
