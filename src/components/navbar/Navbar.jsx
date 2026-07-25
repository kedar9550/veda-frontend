import React, { useState, useEffect, useRef } from 'react';
import { applyMagneticEffect } from '../utils/animationUtils';
export default function Navbar({ activePage, onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileActive, setIsMobileActive] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

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

          {/* Admissions CTA */}
          <a
            ref={admissionsBtnRef}
            href="#admissions"
            className="btn-admissions"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact', null);
            }}
          >
            Login
            <i className="bi bi-arrow-right"></i>
          </a>
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
