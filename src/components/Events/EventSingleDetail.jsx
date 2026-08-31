import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// import { EVENTS_DATA } from './eventsData';
import { useEvents } from './useEvents';

/**
 * Tries each campus photo base URL in order:
 *   1. https://info.aec.edu.in/aus/employeephotos/
 *   2. https://info.aec.edu.in/aec/employeephotos/
 *   3. https://info.aec.edu.in/acet/employeephotos/
 *   4. https://info.aec.edu.in/acoe/employeephotos/
 * Falls back to initials SVG placeholder if all fail.
 */
const CAMPUS_PHOTO_BASES = [
  'https://info.aec.edu.in/aus/employeephotos',
  'https://info.aec.edu.in/aec/employeephotos',
  'https://info.aec.edu.in/acet/employeephotos',
  'https://info.aec.edu.in/acoe/employeephotos',
];

function CoordinatorPhoto({ employeeCode, name, className }) {
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'FC';
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-size='46' fill='%23ffffff'>${initials}</text></svg>`;
  const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(
    employeeCode ? `${CAMPUS_PHOTO_BASES[0]}/${employeeCode}.jpg` : placeholderDataUrl
  );

  useEffect(() => {
    setAttemptIndex(0);
    setImgSrc(employeeCode ? `${CAMPUS_PHOTO_BASES[0]}/${employeeCode}.jpg` : placeholderDataUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeCode]);

  const handleError = () => {
    const nextIndex = attemptIndex + 1;
    if (nextIndex < CAMPUS_PHOTO_BASES.length) {
      setAttemptIndex(nextIndex);
      setImgSrc(`${CAMPUS_PHOTO_BASES[nextIndex]}/${employeeCode}.jpg`);
    } else {
      // All bases exhausted — show initials placeholder
      setImgSrc(placeholderDataUrl);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={`Photo of ${name || 'Coordinator'}`}
      className={className}
      onError={handleError}
    />
  );
}

function StudentCoordinatorPhoto({ rollNo, name, className }) {
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'SC';
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%23222222'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-size='46' fill='%23ffffff'>${initials}</text></svg>`;
  const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  const [hasError, setHasError] = useState(false);
  const imgSrc = !hasError && rollNo ? `https://info.aec.edu.in/adityacentral/StudentPhotos/${rollNo}.jpg` : placeholderDataUrl;

  return (
    <img
      src={imgSrc}
      alt={`Photo of ${name || 'Coordinator'}`}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function StudentCoordinatorCard({ studentCoord }) {
  const [data, setData] = useState(null);

  let initialName = '';
  let initialRoll = '';
  let initialPhone = 'N/A';

  if (typeof studentCoord === 'string') {
    const match = studentCoord.match(/^(.*?)\s*\(([\w]+)\)(?:\s*\((\d+)\))?/);
    if (match) {
      initialName = match[1].trim();
      initialRoll = match[2].trim();
      if (match[3]) initialPhone = match[3].trim();
    } else {
      initialName = studentCoord;
    }
  } else {
    initialName = studentCoord?.name || studentCoord?.fullName || '';
    initialRoll = studentCoord?.rollNumber || studentCoord?.rollNo || studentCoord?.roll || studentCoord?.id || '';
    initialPhone = studentCoord?.mobileNumber || studentCoord?.phoneNumber || studentCoord?.phone || studentCoord?.mobile || 'N/A';
  }

  useEffect(() => {
    if (initialRoll) {
      fetch(`/adityaapi/api/studentdata/${initialRoll}`)
        .then(res => res.json())
        .then(json => {
          const info = Array.isArray(json) ? json[0] : json;
          if (info && !info.error) {
            setData(info);
          }
        })
        .catch(err => console.error("Error fetching student coord data:", err));
    }
  }, [initialRoll]);

  const displayName = data?.studentname || initialName || 'Student Coordinator';
  const displayPhone = data?.mobilenumber || data?.fathermobilenumber || initialPhone;

  return (
    <div className="esingle-coordinator-row" style={{ marginTop: 0, marginBottom: '1rem', flex: '1 1 min-content', minWidth: '300px' }}>
      <StudentCoordinatorPhoto
        rollNo={initialRoll}
        name={displayName}
        className="esingle-coordinator-photo"
      />
      <div className="esingle-coordinator-info">
        <p className="esingle-section-text" style={{ marginBottom: '0.25rem' }}>
          <strong>{displayName}</strong>
          {initialRoll ? ` — ${initialRoll}` : null}
        </p>
        <p className="esingle-section-text">
          <small className="esingle-coordinator-code">
            <i className="bi bi-telephone-fill" style={{ marginRight: '6px' }}></i>
            {displayPhone}
          </small>
        </p>
      </div>
    </div>
  );
}

export default function EventSingleDetail({ schoolId, eventId }) {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const bodyRef = useRef(null);

  const { events, groups, loading } = useEvents();
  const school = groups.find((g) => g.slug === schoolId);
  const event = events.find((e) => e.groupSlug === schoolId && e.slug === eventId);

  const coordinators = event?.coordinators?.length > 0 ? event.coordinators : (event?.coordinator ? [event.coordinator] : []);

  const [student, setStudent] = useState(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  useEffect(() => {
    const studentStr = localStorage.getItem('eventStudent');
    if (studentStr) {
      try {
        setStudent(JSON.parse(studentStr));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!student || !event) {
        return;
      }
      setCheckingRegistration(true);
      try {
        const queryParams = new URLSearchParams();
        if (student.email) queryParams.append('email', student.email);
        if (student.roll) queryParams.append('roll', student.roll);

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9022';
        const res = await fetch(`${baseUrl}/api/razorpay/registrations?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const payments = data.payments || [];
          const eventCategory = (event.category || event.groupCategory || schoolId || '').toLowerCase();
          const hasRegistered = payments.some(p =>
            p.eventId === event.id &&
            p.schoolId === school.id &&
            (p.category || '').toLowerCase() === eventCategory
          );
          setIsAlreadyRegistered(hasRegistered);
        }
      } catch (err) {
        console.error('Error checking registration:', err);
      } finally {
        setCheckingRegistration(false);
      }
    };
    checkRegistration();
  }, [student, event]);

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
        <button className="event-detail-back" onClick={() => navigate(schoolId === 'featured-events' ? '/events' : `/events/${schoolId}`)} style={{ position: 'static', marginTop: '1rem' }}>
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
            <span className="esingle-stat__number">{event.realRegistrationsCount || event.registeredStudents || 0}</span>
            <span className="esingle-stat__label">Teams Registered</span>
          </div>
          <div className="esingle-stat">
            <span className="esingle-stat__number">{event.feeText || String(event.feeAmount)}</span>
            <span className="esingle-stat__label">Rupees</span>
          </div>
          <div className="esingle-stat">
            <span className="esingle-stat__number">{event.realParticipantsCount || event.participants || 0}</span>
            <span className="esingle-stat__label">Participation</span>
          </div>
        </div>
      </div>

      <div ref={bodyRef} className="container-premium esingle-body">

        {/* ── Event Header Block (Moved from Banner Image) ── */}
        <div className="esingle-header-block">
          <div className="esingle-badge-row">
            <button
              type="button"
              className="esingle-back-pill"
              onClick={() => navigate(schoolId === 'featured-events' ? '/events' : `/events/${schoolId}`)}
              aria-label="Go back"
            >
              <i className="bi bi-arrow-left" />
            </button>
            <span className="esingle-category-badge">{event.category || school.title}</span>
          </div>
          <h1 className="esingle-page-title">{event.title}</h1>
          {event.tagline && <p className="esingle-page-subtitle">{event.tagline}</p>}

          {eventId === 'medhamanthan' && (
            <div style={{ marginBottom: '1rem', fontWeight: 600 }}>
              click for <a href="/MM2026.html" style={{ color: 'orange', textDecoration: 'underline' }}>
                MedhaManthan Themes and Problem Statements
              </a>
            </div>
          )}

          <div className="esingle-meta-row">
            <div className="esingle-meta-chip">
              <i className="bi bi-calendar3" />
              <span>{event.date ? formatDate(event.date) : (import.meta.env.VITE_EVENT_DATE || 'Date TBD')}</span>
            </div>
            {/* <div className="esingle-meta-chip">
              <i className="bi bi-geo-alt" />
              <span>{event.venue || 'Venue TBD'}</span>
            </div> */}
          </div>
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
            {eventId != 'medhamanthan' && (
              <ul className="esingle-rules-list">
                {event.rules.map((rule, i) => (
                  <li key={i} className="esingle-rule-item">
                    <span className="esingle-rule-bullet">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
            {eventId === 'medhamanthan' && (

              <div style={{ marginBottom: '1rem', fontWeight: 600 }}>
                click for &nbsp;
                <a href="/MM_Rules.html" style={{ color: 'orange', textDecoration: 'underline' }}>
                  Rules and Regulations
                </a>
              </div>
            )}
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
        {coordinators && coordinators.length > 0 && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>FACULTY COORDINATOR{coordinators.length > 1 ? 'S' : ''}</span><span className="esingle-section-colon"> :</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
              {coordinators.map((coordinator, idx) => {
                const coordinatorName = coordinator?.employeeName || coordinator?.name || coordinator?.fullName || '';
                const coordinatorCode = coordinator?.employeeCode || coordinator?.employeeId || coordinator?.id || coordinator?._id || '';

                return (
                  <div key={idx} className="esingle-coordinator-row" style={{ marginTop: 0, marginBottom: '1rem', flex: '1 1 min-content', minWidth: '300px' }}>
                    <CoordinatorPhoto
                      employeeCode={coordinatorCode}
                      name={coordinatorName}
                      className="esingle-coordinator-photo"
                    />

                    <div className="esingle-coordinator-info">
                      <p className="esingle-section-text" style={{ marginBottom: '0.25rem' }}>
                        <strong>{coordinatorName || coordinator?.designation || 'Faculty Coordinator'}</strong>
                        {coordinator?.designation && coordinatorName ? ` — ${coordinator.designation}` : null}
                      </p>
                      <p className="esingle-section-text">
                        <small className="esingle-coordinator-code"><i className="bi bi-telephone-fill" style={{ marginRight: '6px' }}></i>{coordinator?.mobileNumber || coordinator?.phoneNumber || coordinator?.phone || coordinator?.mobile || 'N/A'}</small>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STUDENT COORDINATOR DETAILS ── */}
        {(event?.raw?.studentCoordinators?.length > 0 || event?.studentCoordinators?.length > 0) && (
          <div className="esingle-section">
            <h2 className="esingle-section-title">
              <span>STUDENT COORDINATOR{(event?.raw?.studentCoordinators?.length > 1 || event?.studentCoordinators?.length > 1) ? 'S' : ''}</span><span className="esingle-section-colon"> :</span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1rem' }}>
              {(event?.raw?.studentCoordinators || event?.studentCoordinators).map((studentCoord, idx) => (
                <StudentCoordinatorCard key={idx} studentCoord={studentCoord} />
              ))}
            </div>
          </div>
        )}

        {/* ── VENUE + REGISTER BUTTON ── */}
        <div className="esingle-venue-row">
          <div className="esingle-section esingle-section--no-mb">
            <h2 className="esingle-section-title">
              <span>VENUE</span><span className="esingle-section-colon"> :</span>
            </h2>
            <p className="esingle-section-text">
              {event.raw?.venueType === 'Indoor' && event.raw?.building && event.raw?.floor
                ? `${event.raw.building.name || event.raw.building} - ${event.raw.floor.name || event.raw.floor}${event.raw?.roomNo ? ` - ${event.raw.roomNo}` : ''}`
                : event.raw?.venueType === 'Outdoor' && event.raw?.ground
                  ? `${event.raw.ground.name || event.raw.ground}${event.raw?.roomNo ? ` - ${event.raw.roomNo}` : ''}`
                  : event.venue || 'N/A'}
            </p>
          </div>

          {checkingRegistration ? (
            <button type="button" className="esingle-register-btn esingle-register-btn--closed" disabled>
              Loading...
            </button>
          ) : isAlreadyRegistered ? (
            <button
              type="button"
              className="esingle-register-btn esingle-register-btn--closed"
              style={{ background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => navigate('/dashboard', { state: { activeTab: 'events' } })}
            >
              <i className="bi bi-check-circle" style={{ marginRight: '8px' }} /> Already Registered
            </button>
          ) : (
            <button
              type="button"
              className={`esingle-register-btn ${!event.isOpen ? 'esingle-register-btn--closed' : ''}`}
              onClick={(e) => {
                if (!event.isOpen) return e.preventDefault();
                navigate(`/register/${schoolId}/${eventId}`);
              }}
            >
              {event.isOpen ? 'Register' : 'Closed'}
              {event.isOpen && <i className="bi bi-arrow-right" />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
