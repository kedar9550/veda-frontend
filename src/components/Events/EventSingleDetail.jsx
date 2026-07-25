import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { EVENTS_DATA } from './eventsData';
import { useEvents } from './useEvents';
import { useSubEvents } from './useSubEvents';

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

  const { events } = useEvents();
  const school = events.find(e => e.id === schoolId) || EVENTS_DATA.find(e => e.id === schoolId);
  const { subEvents, loading } = useSubEvents(schoolId, school?._id);
  const event = subEvents.find(e => e.id === eventId);

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

        {/* Bottom info on hero */}
        <div className="esingle-hero__bottom">
          {!event.isOpen && (
            <span className="sub-event-card__closed-badge" style={{ position: 'static' }}>
              Registration Closed
            </span>
          )}
        </div>
      </div>

      {/* ── Main body ── */}
      <div ref={bodyRef} className="container-premium esingle-body">

        {/* Title */}
        <div className="esingle-title-block">
          <h1 className="esingle-title">{event.title}</h1>
        </div>

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
        {event.coordinator && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>FACULTY COORDINATOR</span><span className="esingle-section-colon"> :</span>
            </h2>
            <p className="esingle-section-text">
              <strong>{event.coordinator.name}</strong> — {event.coordinator.designation} ({event.coordinator.department})
            </p>
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

          <a
            href={event.registrationLink}
            className={`esingle-register-btn ${!event.isOpen ? 'esingle-register-btn--closed' : ''}`}
            onClick={!event.isOpen ? (e) => e.preventDefault() : undefined}
          >
            {event.isOpen ? 'Register' : 'Closed'}
            {event.isOpen && <i className="bi bi-arrow-right" />}
          </a>
        </div>

      </div>
    </div>
  );
}
