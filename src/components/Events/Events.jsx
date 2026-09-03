import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from './useEvents';
import './EventsPage.css';

function SchoolCard({ group }) {
  const navigate = useNavigate();

  // Use a default accent color, or one from the group if available
  const accentColor = group.accentColor || '#6c63ff';

  return (
    <div
      className="event-card event-card--modern"
      style={{ '--event-accent': accentColor, cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '320px' }}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/events/${group.slug}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${group.slug}`)}
    >
      {/* Decorative Dots Pattern */}
      <div className="event-card__dots" />

      {/* Banner Image */}
      {group.image && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <img 
            src={group.image} 
            alt={group.title || group.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="event-card__header-modern" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: group.image ? '1.5rem' : '3rem 1.5rem 1.5rem 1.5rem' }}>
        
        <h3 className="event-card__title-modern" style={{ fontSize: '1.15rem', marginBottom: '1rem', textAlign: 'center', lineHeight: '1.4', fontWeight: '700', letterSpacing: '0.5px' }}>
          {group.title || group.name}
        </h3>
        
        <div className="event-card__divider-modern" style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`, margin: '0 auto 0 auto', width: '60%' }} />
      </div>

      {/* Footer */}
      <div className="event-card__footer-modern" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', gap: '0.5rem' }}>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
          <i className="bi bi-calendar-event" style={{ fontSize: '1.1rem', color: accentColor }} />
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
            {group.eventCount || 0} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Events</span>
          </span>
        </div>

        <button
          className="event-card__cta"
          style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/events/${group.slug}`);
          }}
          aria-label={`View ${group.title || group.name} events`}
        >
          View Events
          <i className="bi bi-arrow-right" style={{ marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
}

function FeaturedEventCard({ event }) {
  const navigate = useNavigate();

  const accentColor = event.categoryColor || '#7c3aed';

  const rawDepts = event.raw?.department || [];
  const isAllDepartments = rawDepts.length > 1;

  const badgeName = isAllDepartments
    ? 'ALL DEPTS'
    : (event.groupShortName || event.category || 'FEATURED');

  const displayOrganizer = isAllDepartments
    ? 'All Departments'
    : (event.organizer || event.category || event.groupName || 'Event');

  const dateStr = event.raw?.startDate ? new Date(event.raw.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(' ', ' - ') : (import.meta.env.VITE_EVENT_DATE || '11 - 12 SEP, 2k26');

  return (
    <div
      className="event-card event-card--modern"
      style={{ '--card-accent': accentColor, overflow: 'visible' }}
      onClick={() => navigate(`/events/${event.groupSlug}/${event.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${event.groupSlug}/${event.slug}`)}
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
        {/* <div className="event-card__stat-col stat-participants">
          <div className="event-card__stat-icon-wrap" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
            <i className="bi bi-person-check-fill" />
          </div>
          <span className="event-card__stat-label">Participants</span>
          <span className="event-card__stat-val" style={{ color: '#3b82f6' }}>
            {event.realParticipantsCount || event.participants || 0}
          </span>
        </div> */}
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
            navigate(`/events/${event.groupSlug}/${event.slug}`);
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

export default function Events() {
  const { groups, events, loading, error } = useEvents();

  // Find the FEATURED EVENTS group
  const universityGroup = groups.find(
    g => (g.name || g.title || '').toUpperCase().includes('FEATURED EVENTS') ||
      (g.shortName || '').toUpperCase() === 'FEATURED EVENTS'
  );

  // Events for FEATURED EVENTS
  const featuredEvents = universityGroup
    ? events.filter(e => e.groupId === universityGroup.id || e.groupSlug === universityGroup.slug)
    : [];

  // Other schools
  const schoolGroups = groups.filter(g => g.id !== universityGroup?.id);

  return (
    <div className="events-page-container">
      {/* EXPLORE EVENTS Section */}
      <h2 className="events-section-title">EXPLORE EVENTS</h2>

      {error && (
        <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '2rem' }}>
          <i className="bi bi-exclamation-triangle" /> {error}
        </div>
      )}

      {loading ? (
        <div className="schools-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="event-card event-card--skeleton" style={{ minHeight: '340px' }}>
              <div className="event-card__header-modern">
                <div className="skeleton-line" style={{ height: '2.2rem', width: '50%', borderRadius: '8px', marginBottom: '0.5rem' }} />
                <div className="skeleton-line" style={{ height: '3px', width: '70px', borderRadius: '99px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1.5rem' }}>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          ))}
        </div>
      ) : (
        <div className="schools-grid">
          {schoolGroups.map(group => (
            <SchoolCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* FEATURED EVENTS Section */}
      {featuredEvents.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div className="featured-events-header">
            <h2 className="featured-events-title">FEATURED EVENTS</h2>
            <a
              href={`/events/${universityGroup?.slug}`}
              className="view-all-events"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/events/${universityGroup?.slug}`;
              }}
            >
              View All Events <i className="bi bi-arrow-right" />
            </a>
          </div>
          <div className="featured-grid">
            {featuredEvents.map(event => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







