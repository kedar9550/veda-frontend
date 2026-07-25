import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEvents } from './useEvents';
gsap.registerPlugin(ScrollTrigger);

/* Navigate to event detail */
function navigateToDetail(schoolId) {
  window.location.hash = `events/${schoolId}`;
}

/* ─── Loading skeleton card ─── */
function EventCardSkeleton() {
  return (
    <div className="event-card event-card--skeleton">
      <div className="event-card__image-wrap skeleton-img" />
      <div className="event-card__body">
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-row">
          <div className="skeleton-circle" />
          <div className="skeleton-line skeleton-org" />
          <div className="skeleton-line skeleton-likes" />
        </div>
        <div className="event-card__footer">
          <div className="skeleton-line skeleton-count" />
          <div className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

/* ─── Single Event Card ─── */
function EventCard({ event, index, cardRef }) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(event.likes);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div
      ref={cardRef}
      className="event-card"
      style={{ '--event-accent': event.accentColor }}
    >
      {/* Image */}
      <div className="event-card__image-wrap">
        <img
          src={event.image}
          alt={event.title}
          className="event-card__image"
          loading="lazy"
        />
        <div className="event-card__image-overlay" />

        {/* Category badge */}
        <span className="event-card__badge">{event.category}</span>
      </div>

      {/* Body */}
      <div className="event-card__body">
        {/* Title + tagline */}
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__tagline">{event.tagline}</p>

        {/* Organizer row */}
        <div className="event-card__organizer-row">
          <div className="event-card__organizer-info">
            <div className="event-card__organizer-icon">
              <i className={`bi ${event.organizerIcon}`} />
            </div>
            <div className="event-card__organizer-text">
              <span className="event-card__organizer-label">Organized By</span>
              <span className="event-card__organizer-name">{event.organizer}</span>
            </div>
          </div>

          {/* Like button */}
          <button
            className={`event-card__like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={`Like ${event.title}`}
          >
            <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`} />
            <span>{likeCount.toLocaleString()}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="event-card__footer">
          <div className="event-card__event-count">
            <i className="bi bi-calendar-event" />
            <span>
              <strong>{event.eventCount}</strong> Events
            </span>
          </div>
          <button
            className="event-card__cta"
            onClick={() => navigateToDetail(event.id)}
            aria-label={`View ${event.title} events`}
          >
            Events
            <i className="bi bi-arrow-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Events Section ─── */
export default function Events() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const { events, loading, error } = useEvents();

  useEffect(() => {
    if (loading || events.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    // Mouse glow tracking
    const cleanups = cardsRef.current.map((card) => {
      if (!card) return null;
      const handleMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      };
      card.addEventListener('mousemove', handleMouseMove);
      return () => card.removeEventListener('mousemove', handleMouseMove);
    });

    return () => {
      ctx.revert();
      cleanups.forEach((c) => c && c());
    };
  }, [loading, events]);

  return (
    <section ref={sectionRef} id="events" className="events-section">
      <div className="container-premium">

        {/* Header */}
        <div className="events-header">
          <span className="events-header-tag">Campus Life</span>
          <h2 className="events-title text-gradient">
            Events &amp; Competitions
          </h2>
          <p className="events-subtitle">
            Discover inter-school events, workshops, and competitions.
            Register and showcase your talent.
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="events-error">
            <i className="bi bi-exclamation-triangle" />
            <p>Could not load events. Please try again.</p>
          </div>
        )}

        {/* Cards grid */}
        <div className="events-grid">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))
            : events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  cardRef={(el) => (cardsRef.current[index] = el)}
                />
              ))}
        </div>

      </div>
    </section>
  );
}
