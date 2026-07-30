import React, { useState, useEffect, useRef } from 'react';
import { applyMagneticEffect } from '../utils/animationUtils';

export default function Navbar({ activePage, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const [loggedStudent, setLoggedStudent] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
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
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentLoggedIn', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentLoggedIn', handleStorageChange);
    };
  }, []);

  const admissionsBtnRef = useRef(null);
  const themeToggleRef = useRef(null);

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

  // Apply magnetic effect to Admissions & Theme Toggle buttons
  useEffect(() => {
    const cleanupAdmissions = applyMagneticEffect(admissionsBtnRef.current, null, 0.25);
    const cleanupTheme = applyMagneticEffect(themeToggleRef.current, null, 0.35);

    return () => {
      if (cleanupAdmissions) cleanupAdmissions();
      if (cleanupTheme) cleanupTheme();
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
          <li>
            <a
              href="#dashboard"
              className={`nav-item-link ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('dashboard', null);
              }}
            >
              Dashboard
            </a>
          </li>
        </ul>

        {/* Actions (Admissions, Theme) */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            ref={themeToggleRef}
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bi ${themeMode === 'dark' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
          </button>

          {/* Admissions CTA / Logged in User */}
          {loggedStudent ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <a
                href="#dashboard"
                className="btn-admissions"
                style={{
                  cursor: 'pointer',
                  background: 'rgba(0, 123, 255, 0.1)',
                  color: '#007bff',
                  border: '1px solid rgba(0, 123, 255, 0.3)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('dashboard', null);
                }}
                title="Go to Student Dashboard"
              >
                <i className="bi bi-person-circle"></i>
                {loggedStudent.name}
              </a>
              <button
                className="theme-toggle-btn"
                style={{ color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.3)', background: 'rgba(220, 53, 69, 0.1)' }}
                onClick={() => {
                  localStorage.removeItem('eventStudent');
                  window.dispatchEvent(new Event('studentLoggedIn'));
                  setLoggedStudent(null);
                  window.location.hash = '';
                }}
                title="Logout"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          ) : (
            <a
              ref={admissionsBtnRef}
              href="#login"
              className="btn-admissions"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('dashboard', null);
              }}
            >
              Login / Profile
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
