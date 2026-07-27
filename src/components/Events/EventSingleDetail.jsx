import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { EVENTS_DATA } from './eventsData';
import { useEvents } from './useEvents';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function EventSingleDetail({ schoolId, eventId, onBack, onBackToSchool }) {
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const bodyRef = useRef(null);

  const { events, loading } = useEvents();
  const school = events.find((e) => e.groupSlug === schoolId) || EVENTS_DATA.find(e => e.id === schoolId);
  const event = events.find((e) => e.groupSlug === schoolId && e.id === eventId);
  
  const coordinator = event?.coordinator || null;
  const coordinatorName = coordinator?.employeeName || coordinator?.name || coordinator?.fullName || '';
  const coordinatorCode = coordinator?.employeeCode || coordinator?.employeeId || coordinator?.id || coordinator?._id || '';
  const empBase = import.meta.env.VITE_EMP_URL || import.meta.env.EMP_URL || '';
  const initials = (coordinatorName || '').split(' ').filter(Boolean).slice(0,2).map(n => n[0]).join('').toUpperCase() || 'FC';
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-size='46' fill='%23ffffff'>${initials}</text></svg>`;
  const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;
  useEffect(() => {
    if (!event || !school) return;
    window.scrollTo(0, 0);
    if (!heroRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(statsRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo(bodyRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (loading) {
    return (
      <div className="esingle-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event || !school) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Event not found.</p>
        <button className="event-detail-back" onClick={onBack} style={{ position: 'static', marginTop: '1rem' }}>
          <i className="bi bi-arrow-left" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="esingle-page">

      {/* ── Full-bleed Hero Image ── */}
      <div ref={heroRef} className="esingle-hero" style={{ '--ev-accent': event.categoryColor }}>
        <img src={event.image} alt={event.title} className="esingle-hero__img" />
        <div className="esingle-hero__overlay" />

        {/* Breadcrumb / back nav */}
        <div className="esingle-hero__nav">
          <button className="event-detail-back" onClick={onBack}>
            <i className="bi bi-arrow-left" /> {school.title}
          </button>
        </div>

        <div className="esingle-hero__content">
          <span className="esingle-hero__badge">{event.category || school.title}</span>
          <h1 className="esingle-hero__title">{event.title}</h1>
          {event.tagline && <p className="esingle-hero__subtitle">{event.tagline}</p>}
          <div className="esingle-hero__details-row">
            <div className="esingle-hero__detail">
              <i className="bi bi-calendar3" />
              <span>{event.date ? formatDate(event.date) : 'Date TBD'}</span>
            </div>
            <div className="esingle-hero__detail">
              <i className="bi bi-geo-alt" />
              <span>{event.venue || 'Venue TBD'}</span>
            </div>
          </div>
        </div>

        <div className="esingle-hero__bottom">
          {!event.isOpen && (
            <span className="sub-event-card__closed-badge" style={{ position: 'static' }}>
              Registration Closed
            </span>
          )}
        </div>
      </div>

      <div className="esingle-stats-bar">
        <div className="esingle-stats-bar__inner">
          <div className="esingle-stat">
            <span className="esingle-stat__number">{event.registeredStudents || 0}</span>
            <span className="esingle-stat__label">Users Registered</span>
          </div>
          <div className="esingle-stat">
            <span className="esingle-stat__number">{String(event.feeAmount)}</span>
            <span className="esingle-stat__label">Rupees</span>
          </div>
          <div className="esingle-stat">
            <span className="esingle-stat__number">{event.participants || 0}</span>
            <span className="esingle-stat__label">Participation</span>
          </div>
        </div>
      </div>

      <div ref={bodyRef} className="container-premium esingle-body">

        {/* ── OVERVIEW ── */}
        {event.overview && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>OVERVIEW</span><span className="esingle-section-colon"> :</span>
            </h2>
            <p className="esingle-section-text">{event.overview}</p>
          </div>
        )}

        {/* ── RULES ── */}
        {event.rules && event.rules.length > 0 && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>Rules</span><span className="esingle-section-colon"> :</span>
            </h2>
            <ul className="esingle-rules-list">
              {event.rules.map((rule, i) => (
                <li key={i} className="esingle-rule-item">
                  <span className="esingle-rule-bullet">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── REGISTRATION FEES ── */}
        {event.registrationFee && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>Registration Fees</span><span className="esingle-section-colon"> :</span>
            </h2>
            <p className="esingle-section-text">{event.registrationFee}</p>
          </div>
        )}

        {/* ── COORDINATOR DETAILS ── */}
        {coordinator && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>FACULTY COORDINATOR</span><span className="esingle-section-colon"> :</span>
            </h2>
            <div className="esingle-coordinator-row">
              <img
                src={coordinatorCode ? `${empBase}/${coordinatorCode}.jpg` : placeholderDataUrl}
                alt={`Photo of ${coordinatorName || 'Coordinator'}`}
                className="esingle-coordinator-photo"
                onError={(e) => {
                  if (e.currentTarget.src !== placeholderDataUrl) {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholderDataUrl;
                  }
                }}
              />

              <div className="esingle-coordinator-info">
                <p className="esingle-section-text">
                  <strong>{coordinatorName || coordinator?.designation || 'Faculty Coordinator'}</strong>
                  {coordinator?.designation && coordinatorName ? ` — ${coordinator.designation}` : null}
                </p>
                <p className="esingle-section-text">
                  <small className="esingle-coordinator-code">Employee Code: {coordinatorCode || 'N/A'}</small>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── VENUE + REGISTER BUTTON ── */}
        <div className="esingle-venue-row">
          <div className="esingle-section esingle-section--no-mb">
            <h2 className="esingle-section-title">
              <span>VENUE</span><span className="esingle-section-colon"> :</span>
            </h2>
            <p className="esingle-section-text">{event.venue}</p>
          </div>

          <button
            type="button"
            className={`esingle-register-btn ${!event.isOpen ? 'esingle-register-btn--closed' : ''}`}
            onClick={(e) => {
              if (!event.isOpen) return e.preventDefault();
              window.location.hash = `register/${schoolId}/${eventId}`;
            }}
          >
            {event.isOpen ? 'Register' : 'Closed'}
            {event.isOpen && <i className="bi bi-arrow-right" />}
          </button>
        </div>

      </div>
    </div>
  );
}
