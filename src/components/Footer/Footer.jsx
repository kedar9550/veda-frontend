import React, { useEffect, useRef, useState } from 'react';
import { applyMagneticEffect } from '../utils/animationUtils';
export default function Footer({ onNavigate }) {
  const [email, setEmail] = useState('');
  const socialRefs = useRef([]);

  const handleFooterLinkClick = (targetPage) => {
    window.location.hash = targetPage === 'home' ? '' : `#${targetPage}`;
  };

  useEffect(() => {
    // Bind magnetic pulls to each social icon button
    const cleanups = socialRefs.current.map((btn) => {
      if (btn) {
        return applyMagneticEffect(btn, null, 0.3);
      }
      return null;
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    alert(`Thank you for subscribing! Newsletter updates will be sent to ${email}`);
    setEmail('');
  };

  return (
    <footer className="footer-custom">
      {/* Animated Waves on top boundary */}
      <div className="footer-waves-container">
        <div className="footer-wave wave-1"></div>
        <div className="footer-wave wave-2"></div>
        <div className="footer-wave wave-3"></div>
      </div>

      <div className="container-premium">
        <div className="row">
          
          {/* Col 1: Branding & Description */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <a href="#" className="footer-logo">
              <span className="text-light">
                VEDA <span style={{ color: 'var(--secondary)' }}>2026</span>
              </span>
            </a>
            <p className="footer-text">
              Inspiring excellence and driving innovation in research, engineering, agricultural 
              advancement, and digital management. Leading student lifecycles to global success.
            </p>
            
            {/* Social Icons */}
            <div className="social-links">
              <a
                ref={(el) => (socialRefs.current[0] = el)}
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <a
                ref={(el) => (socialRefs.current[1] = el)}
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Twitter"
              >
                <i className="bi bi-twitter-x"></i>
              </a>
              <a
                ref={(el) => (socialRefs.current[2] = el)}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram"></i>
              </a>
              <a
                ref={(el) => (socialRefs.current[3] = el)}
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="YouTube"
              >
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFooterLinkClick('about', null);
                  }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#schools"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFooterLinkClick('events', null);
                  }}
                >
                  Our Schools
                </a>
              </li>
              <li>
                <a
                  href="#programs"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFooterLinkClick('about', 'programs');
                  }}
                >
                  Lifecycle Journeys
                </a>
              </li>
              <li>
                <a
                  href="#campus"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFooterLinkClick('poster', null);
                  }}
                >
                  Smart Campus
                </a>
              </li>
              <li>
                <a
                  href="#research"
                  onClick={(e) => {
                    e.preventDefault();
                    handleFooterLinkClick('home', 'research');
                  }}
                >
                  Research & Patents
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h4 className="footer-col-title">Contact</h4>
            <ul className="footer-links">
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                Aditya Nagar, ADB Road, Surampalem, Andhra Pradesh, India
              </li>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className="bi bi-telephone-fill me-2 text-primary"></i>
                +91 1800-425-7347
              </li>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <i className="bi bi-envelope-fill me-2 text-primary"></i>
                admissions@aditya.edu.in
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Subscription */}
          <div className="col-lg-3 col-md-6">
            <h4 className="footer-col-title">Newsletter</h4>
            <p className="footer-text" style={{ marginBottom: '16px' }}>
              Subscribe to stay updated on our admissions schedule and patent filings.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                <i className="bi bi-chevron-right"></i>
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom copyright area */}
        <div className="footer-bottom">
          <div className="row">
            <div className="col-lg-6 text-center text-lg-start">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Aditya University. All rights reserved. Approved by AICTE & UGC.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="footer-bottom-links text-center text-lg-end">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms & Conditions</a>
                <a href="#sitemap">Sitemap</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
