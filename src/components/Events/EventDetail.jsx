import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSubEvents } from './useSubEvents';
import { EVENTS_DATA } from './eventsData';

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

/* ─── Minimal event card — image + title only ─── */
function SubEventCard({ event, cardRef, schoolId }) {
  const handleClick = () => {
    window.location.hash = `events/${schoolId}/${event.id}`;
  };

  return (
    <div
      ref={cardRef}
      className="sub-event-card sub-event-card--minimal"
      style={{ '--sub-accent': event.categoryColor }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View ${event.title} details`}
    >
      {/* Image fills most of card */}
      <div className="sub-event-card__img-wrap">
        <img src={event.image} alt={event.title} className="sub-event-card__img" loading="lazy" />
        <div className="sub-event-card__img-overlay" />

        {/* Category badge */}
        <span className="sub-event-card__badge" style={{ background: event.categoryColor }}>
          {event.category}
        </span>

        {/* Closed pill */}
        {!event.isOpen && (
          <span className="sub-event-card__closed-badge">Closed</span>
        )}

        {/* Title overlaid on image bottom */}
        <div className="sub-event-card__title-overlay">
          <h3 className="sub-event-card__title-img">{event.title}</h3>
          <span className="sub-event-card__arrow">
            <i className="bi bi-arrow-right" />
          </span>
        </div>
      </div>

      {/* Minimal body — just tagline */}
      <div className="sub-event-card__simple-body">
        <p className="sub-event-card__simple-tagline">{event.tagline}</p>
        <div className="sub-event-card__simple-meta">
          <span><i className="bi bi-trophy" /> {event.prize}</span>
          <span><i className="bi bi-calendar3" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>
    </div>
  );
}

import { useEvents } from './useEvents';

/* ─── Main EventDetail page ─── */
export default function EventDetail({ schoolId, onBack }) {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const heroRef = useRef(null);

  const { events } = useEvents();
  const school = events.find(e => e.id === schoolId) || EVENTS_DATA.find(e => e.id === schoolId);
  const { subEvents, loading, error } = useSubEvents(schoolId, school?._id);

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

  if (!school) return null;

  return (
    <section ref={sectionRef} className="event-detail-section">
      {/* Hero */}
      <div ref={heroRef} className="event-detail-hero" style={{ '--school-accent': school.accentColor }}>
        <img src={school.image} alt={school.title} className="event-detail-hero__bg" />
        <div className="event-detail-hero__overlay" />
        <div className="event-detail-hero__content">
          <button className="event-detail-back" onClick={onBack}>
            <i className="bi bi-arrow-left" /> All Events
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container-premium">
        
        {/* School Page Header Block */}
        <div className="event-detail-page-header">
          <div className="event-detail-header-left">
            <span className="event-detail-page-tag" style={{ '--school-accent': school.accentColor }}>
              {school.category}
            </span>
            <h1 className="event-detail-page-title">
              {school.title}
            </h1>
            <p className="event-detail-page-tagline">
              {school.tagline}
            </p>
          </div>
        </div>

        <div className="event-detail-content-header">
          <h2 className="event-detail-content-title"><span className="text-gradient">EVENTS</span></h2>
          <div className="event-detail-page-stats">
            <div className="event-detail-page-stat">
              <i className="bi bi-calendar-event" style={{ color: school.accentColor }} />
              <span><strong>{school.eventCount}</strong> Events</span>
            </div>
            <div className="event-detail-page-stat">
              <i className="bi bi-heart-fill" style={{ color: school.accentColor }} />
              <span><strong>{school.likes.toLocaleString()}</strong> Likes</span>
            </div>
          </div>
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
                  schoolId={schoolId}
                  cardRef={(el) => (cardsRef.current[index] = el)}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
