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

  const accentColor = event.categoryColor || '#7c3aed';
  const rawDepts = event.raw?.department || [];
  const isAllDepartments = rawDepts.length > 1;
  const badgeName = isAllDepartments
    ? 'ALL DEPTS'
    : (event.groupShortName || event.category || 'EVENT');

  const displayOrganizer = isAllDepartments
    ? 'All Departments'
    : (event.organizer || event.category || event.groupName || 'Event');

  const dateStr = event.raw?.startDate ? new Date(event.raw.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(' ', ' - ') : (import.meta.env.VITE_EVENT_DATE || '11 - 12 SEP, 2k26');

  return (
    <div
      ref={cardRef}
      className="event-card event-card--modern"
      style={{ '--card-accent': accentColor, overflow: 'visible' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${event.title} details`}
    >
      <div className="event-card__img-container-tech" style={{ margin: '0 auto 1rem', width: '220px', height: '220px', position: 'relative' }}>
        <img src={event.image || 'https://placehold.co/600x400/1e293b/94a3b8?text=Event+Image'} alt={event.title} className="event-card__img-tech" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        <div className="event-card__date-badge-tech" style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#001f3f', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', zIndex: 2, whiteSpace: 'nowrap', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <i className="bi bi-calendar-event"></i> {dateStr}
        </div>
        <div className="event-card__icon-badge-tech" style={{ position: 'absolute', bottom: '10px', left: '10px', background: '#0055ff', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {event.title.toLowerCase().includes('robo') ? <i className="bi bi-robot"></i> :
            event.title.toLowerCase().includes('hack') ? <i className="bi bi-lock-fill"></i> :
              <i className="bi bi-cpu"></i>}
        </div>
      </div>

      <div className="event-card__header-modern" style={{ textAlign: 'center', padding: '0' }}>
        <h3 className="event-card__title-modern" style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 auto 0.5rem', width: '100%', textAlign: 'center' }}>{event.title}</h3>
      </div>

      <p className="event-card__tagline-tech" style={{ textAlign: 'center', marginTop: '0.5rem' }}>{event.tagline || 'Explore exciting events, challenges and competitions'}</p>

      <div className="event-card__divider-wrapper">
        <div className="event-card__divider-modern" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)` }} />
      </div>

      <div className="event-card__stats-row">
        {/* Stat Item: Teams Registered */}
        <div className="event-card__stat-col stat-events">
          <div className="event-card__stat-icon-wrap" style={{ color: '#7c3aed', backgroundColor: 'rgba(124, 58, 237, 0.12)' }}>
            <i className="bi bi-people-fill" />
          </div>
          <span className="event-card__stat-label">Teams</span>
          <span className="event-card__stat-val">{event.realRegistrationsCount || event.registeredStudents || 0}</span>
        </div>

        {/* Stat Item: Fee */}
        <div className="event-card__stat-col stat-participants">
          <div className="event-card__stat-icon-wrap" style={{ color: '#0ea5e9', backgroundColor: 'rgba(14, 165, 233, 0.12)' }}>
            <i className="bi bi-currency-rupee" />
          </div>
          <span className="event-card__stat-label">Fee</span>
          <span className="event-card__stat-val" style={{ color: '#0ea5e9' }}>
            {event.feeAmount ? '₹' + event.feeAmount : 'Free'}
          </span>
        </div>

        {/* Stat Item: Participants */}
        <div className="event-card__stat-col stat-participants">
          <div className="event-card__stat-icon-wrap" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
            <i className="bi bi-person-check-fill" />
          </div>
          <span className="event-card__stat-label">Participants</span>
          <span className="event-card__stat-val" style={{ color: '#3b82f6' }}>
            {event.realParticipantsCount || event.participants || 0}
          </span>
        </div>
      </div>

      {/* Organizer Row */}
      {/* <div className="event-card__organizer-row-modern">
        <div className="event-card__organizer-info-modern">
          <div className="event-card__organizer-icon-modern" style={{ color: accentColor }}>
            {event.groupLogo || event.image ? (
              <img
                src={event.groupLogo || event.image}
                alt={displayOrganizer}
                className="event-card__organizer-logo-img"
              />
            ) : (
              <i className="bi bi-grid" />
            )}
          </div>
          <div className="event-card__organizer-text-modern">
            <span className="event-card__organizer-label-modern">Organized By</span>
            <span className="event-card__organizer-name-modern">{displayOrganizer}</span>
          </div>
        </div>
      </div> */}

      {/* Footer */}
      <div className="event-card__footer-modern">
        <button
          className="event-card__cta"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`View ${event.title} details`}
        >
          View Details
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
              {school.category || 'VEDA 2k26'}
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






