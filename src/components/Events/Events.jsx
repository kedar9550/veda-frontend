import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEvents } from './useEvents';
gsap.registerPlugin(ScrollTrigger);


/* ─── Loading skeleton card ─── */
function EventCardSkeleton() {
  return (
    <div className="event-card event-card--modern event-card--skeleton" style={{ minHeight: '340px' }}>
      <div className="event-card__header-modern">
        <div className="skeleton-line" style={{ height: '2.2rem', width: '50%', borderRadius: '8px', marginBottom: '0.5rem' }} />
        <div className="skeleton-line" style={{ height: '3px', width: '70px', borderRadius: '99px' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1.5rem' }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="skeleton-circle" style={{ width: '42px', height: '42px', marginBottom: '0.6rem' }} />
            <div className="skeleton-line" style={{ height: '0.68rem', width: '80px', borderRadius: '4px', marginBottom: '0.35rem' }} />
            <div className="skeleton-line" style={{ height: '0.88rem', width: '50px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div className="skeleton-btn" style={{ width: '120px', height: '36px', borderRadius: '99px' }} />
      </div>
    </div>
  );
}

/* ─── Single Event Card ─── */
function EventCard({ event, index, cardRef }) {
  const navigate = useNavigate();

  return (
    <div
      ref={cardRef}
      className="event-card event-card--modern"
      style={{ '--event-accent': event.accentColor }}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/events/${event.slug}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${event.slug}`)}
    >
      {/* Decorative Dots Pattern */}
      <div className="event-card__dots" />

      {/* Top Header Section */}
      <div className="event-card__header-modern">
        {/* Category badge */}
        <span className="event-card__badge-modern">{event.shortName || event.title}</span>

        <h3 className="event-card__title-modern">{event.title}</h3>
        <div className="event-card__divider-modern" style={{ background: `linear-gradient(90deg, ${event.accentColor} 0%, transparent 100%)` }} />
      </div>

      <div className="event-card__stats-row">
        {/* Stat Item: Events */}
        <div className="event-card__stat-col stat-events">
          <div className="event-card__stat-icon-wrap">
            <i className="bi bi-calendar-event" />
          </div>
          <span className="event-card__stat-label">Events</span>
          <span className="event-card__stat-val">{event.eventCount}</span>
        </div>

        {/* Stat Item: Status */}
        <div className="event-card__stat-col stat-participants">
          <div className="event-card__stat-icon-wrap">
            <i className="bi bi-activity" />
          </div>
          <span className="event-card__stat-label">Status</span>
          <span className="event-card__stat-val" style={{ color: event.isActive ? '#10b981' : '#ef4444' }}>
            {event.isActive ? 'Active' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Organizer Row */}
      <div className="event-card__organizer-row-modern">
        <div className="event-card__organizer-info-modern">
          <div className="event-card__organizer-icon-modern" style={{ color: event.accentColor }}>
            {event.groupLogo || event.image ? (
              <img
                src={event.groupLogo || event.image}
                alt={event.organizer || event.title}
                className="event-card__organizer-logo-img"
              />
            ) : (
              <i className={`bi ${event.organizerIcon || 'bi-grid'}`} />
            )}
          </div>
          <div className="event-card__organizer-text-modern">
            <span className="event-card__organizer-label-modern">Organized By</span>
            <span className="event-card__organizer-name-modern">{event.organizer}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="event-card__footer-modern">
        <button
          className="event-card__cta"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/events/${event.slug}`);
          }}
          aria-label={`View ${event.title} events`}
        >
          View Events
          <i className="bi bi-arrow-right" />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Events Section ─── */
export default function Events() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const { groups, loading, error } = useEvents();

  useEffect(() => {
    if (loading || groups.length === 0) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
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
      });
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
  }, [loading, groups]);

  // Mobile GPU-Accelerated Parallax Depth Effect for Event Cards (< 768px)
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile || loading || groups.length === 0) return;

    let ticking = false;
    const activeCards = new Set();

    const updateMobileParallax = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      activeCards.forEach((cardEl) => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const normalizedScroll = (centerY - windowHeight / 2) / (windowHeight / 2);

        // Clamp translation offset strictly between -12px and +12px for 60 FPS performance
        const maxOffsetPx = 12;
        const clampedOffset = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, normalizedScroll * maxOffsetPx));

        cardEl.style.transform = `translate3d(0, ${clampedOffset.toFixed(2)}px, 0)`;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking && activeCards.size > 0) {
        window.requestAnimationFrame(updateMobileParallax);
        ticking = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeCards.add(entry.target);
          } else {
            activeCards.delete(entry.target);
            entry.target.style.transform = 'translate3d(0, 0, 0)';
          }
        });

        if (activeCards.size > 0) {
          updateMobileParallax();
          window.addEventListener('scroll', handleScroll, { passive: true });
        } else {
          window.removeEventListener('scroll', handleScroll);
        }
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, groups]);

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
            : groups.map((group, index) => (
              <EventCard
                key={group.id}
                event={{
                  ...group,
                  category: group.category || group.organizer,
                  organizer: group.organizer || group.category,
                  tagline: group.tagline || 'Explore more events in this group',
                  image: group.image || '/events/techno.png',
                }}
                index={index}
                cardRef={(el) => (cardsRef.current[index] = el)}
              />
            ))}
        </div>

      </div>
    </section>
  );
}
