import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// import { EVENTS_DATA } from './eventsData';

/* ─── Skeleton card (minimal) ─── */
function SubEventSkeleton() {
  return (
    <div className="sub-event-card sub-event-card--skeleton">
      <div className="sub-event-card__img-wrap skeleton-img" />
      <div className="sub-event-card__simple-body">
        <div className="skeleton-line" style={{ height: '1.1rem', width: '65%', borderRadius: '6px' }} />
        <div className="skeleton-line" style={{ height: '0.75rem', width: '40%', borderRadius: '6px', marginTop: '0.4rem' }} />
      </div>
    </div>
  );
}

function formatEventDate(date) {
  if (!date) return 'TBD';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? 'TBD'
    : parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatEventFee(feeAmount) {
  const feeText = feeAmount === undefined || feeAmount === null || feeAmount === ''
    ? 'Free'
    : String(feeAmount);
  return feeText;
}

/* ─── Minimal event card — image + title only ─── */
function SubEventCard({ event, cardRef, school }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/events/${school.slug}/${event.slug}`);
  };

  const organizerLogo = event.groupLogo || event.image;
  const organizerName = event.category || event.groupName || 'CSE';
  const mainFestName = school?.shortName || school?.title || event.groupName || 'VEDA 2026';

  return (
    <div
      ref={cardRef}
      className="sub-event-card sub-event-card--modern"
      style={{ '--sub-accent': event.categoryColor || '#7c3aed' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${event.title} details`}
    >
      {/* Header Row: Event Title on Left, Main Fest Name (Kriya/Digi) Badge on Right */}
      <div className="sub-event-card__header-modern">
        <div className="sub-event-card__title-wrap-modern">
          <h3 className="sub-event-card__title-modern">{event.title}</h3>
          <div className="sub-event-card__underline-modern" />
        </div>
        <span className="sub-event-card__badge-modern">
          {mainFestName}
        </span>
      </div>

      {/* Description / Tagline */}
      {event.tagline && (
        <p className="sub-event-card__tagline-modern">{event.tagline}</p>
      )}

      {/* Middle Stats Row: Circular Icon Columns */}
      <div className="sub-event-card__stats-modern">
        <div className="sub-event-card__stat-item-modern">
          <div className="sub-event-card__stat-icon-wrap-modern stat-purple">
            <i className="bi bi-people-fill" />
          </div>
          <span className="sub-event-card__stat-val-modern">
            {event.realRegistrationsCount || event.registeredStudents || 0}
          </span>
          <span className="sub-event-card__stat-label-modern">Teams Registered</span>
        </div>

        <div className="sub-event-card__stat-item-modern">
          <div className="sub-event-card__stat-icon-wrap-modern stat-teal">
            <i className="bi bi-currency-rupee" />
          </div>
          <span className="sub-event-card__stat-val-modern">
            {event.feeText || formatEventFee(event.feeAmount)}
          </span>
          <span className="sub-event-card__stat-label-modern">Rupees</span>
        </div>

        <div className="sub-event-card__stat-item-modern">
          <div className="sub-event-card__stat-icon-wrap-modern stat-blue">
            <i className="bi bi-people" />
          </div>
          <span className="sub-event-card__stat-val-modern">
            {event.realParticipantsCount || event.participants || 0}
          </span>
          <span className="sub-event-card__stat-label-modern">Participation</span>
        </div>
      </div>

      {/* Bottom Organizer Row & Action Button */}
      <div className="sub-event-card__organizer-row-modern">
        <div className="sub-event-card__organizer-info-modern">
          <div className="sub-event-card__organizer-icon-modern">
            {organizerLogo ? (
              <img src={organizerLogo} alt={organizerName} className="sub-event-card__organizer-logo-img" />
            ) : (
              <i className="bi bi-grid-fill" />
            )}
          </div>
          <div className="sub-event-card__organizer-text-modern">
            <span className="sub-event-card__organizer-label-modern">ORGANIZED BY</span>
            <span className="sub-event-card__organizer-name-modern">{organizerName}</span>
          </div>
        </div>

        <button
          type="button"
          className="sub-event-card__cta-modern"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {event.isOpen ? 'View Event' : 'Closed'}
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

import { useEvents } from './useEvents';

/* ─── Main EventDetail page ─── */
export default function EventDetail({ schoolId }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const heroRef = useRef(null);

  const { events, groups, loading, error } = useEvents();
  
  const school = groups.find((g) => g.slug === schoolId) || null;
  const subEvents = school ? events.filter((e) => e.groupSlug === school.slug) : [];

  const schoolParticipants = subEvents.reduce((acc, curr) => acc + (curr.realParticipantsCount || curr.participants || 0), 0);

  // Hero entrance
  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(heroRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, [schoolId]);

  // Cards entrance
  useEffect(() => {
    if (loading || subEvents.length === 0) return;
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.15 }
    );
  }, [loading, subEvents]);

  if (!school) {
    if (loading) {
      return (
        <section className="event-detail-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading events...</div>
        </section>
      );
    }
    return null;
  }

  return (
    <div ref={sectionRef} className="esingle-page">
      {/* Hero */}
      <div ref={heroRef} className="esingle-hero" style={{ '--ev-accent': school.accentColor }}>
        <img src={school.image} alt={school.title} className="esingle-hero__img" />
        <div className="esingle-hero__overlay" />
      </div>

      <div className="esingle-stats-bar">
        <div className="esingle-stats-bar__inner">
          <div className="esingle-stat">
            <span className="esingle-stat__number">{school.eventCount}</span>
            <span className="esingle-stat__label">Events</span>
          </div>
          <div className="esingle-stat">
            <span className="esingle-stat__number">{schoolParticipants}</span>
            <span className="esingle-stat__label">Total Participation</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-premium esingle-body">

        {/* School Page Header Block */}
        <div className="esingle-header-block">
          <div className="esingle-badge-row">
            <button
              type="button"
              className="esingle-back-pill"
              onClick={() => navigate('/events')}
              aria-label="All Events"
            >
              <i className="bi bi-arrow-left" />
            </button>
            <span className="esingle-category-badge">
              {school.category || 'VEDA 2026'}
            </span>
          </div>
          <h1 className="esingle-page-title">
            {school.title}
          </h1>
          <p className="esingle-page-subtitle">
            {school.tagline}
          </p>
        </div>

        <div className="event-detail-content-header" style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
          <h2 className="event-detail-content-title"><span className="text-gradient">EVENTS</span></h2>
        </div>

        {error && <div className="events-error"><i className="bi bi-exclamation-triangle" /><p>Could not load events.</p></div>}

        {!loading && !error && subEvents.length === 0 && (
          <div className="event-detail-empty">
            <i className="bi bi-calendar2-x" />
            <h3>No Events Yet</h3>
            <p>Events will be announced soon. Stay tuned!</p>
          </div>
        )}

        <div className="sub-events-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SubEventSkeleton key={i} />)
            : subEvents.map((event, index) => (
              <SubEventCard
                key={event.id}
                event={event}
                school={school}
                cardRef={(el) => (cardsRef.current[index] = el)}
              />
            ))}

        </div>
      </div>
    </div>
  );
}
