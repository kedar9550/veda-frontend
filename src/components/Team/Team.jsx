import React, { useState, useEffect } from 'react';
import './Team.css';

// Reusable Photo component mirroring the fallback logic
const CAMPUS_PHOTO_BASES = [
  'https://info.aec.edu.in/aus/employeephotos',
  'https://info.aec.edu.in/aec/employeephotos',
  'https://info.aec.edu.in/acet/employeephotos',
  'https://info.aec.edu.in/acoe/employeephotos',
];

function CoordinatorPhoto({ employeeCode, name }) {
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'FC';
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%231e40af'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-size='46' fill='%23ffffff'>${initials}</text></svg>`;
  const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  const [attemptIndex, setAttemptIndex] = useState(-1);
  const [imgSrc, setImgSrc] = useState(
    employeeCode ? `/${employeeCode}.jpeg` : placeholderDataUrl
  );

  useEffect(() => {
    setAttemptIndex(-1);
    setImgSrc(employeeCode ? `/${employeeCode}.jpeg` : placeholderDataUrl);
  }, [employeeCode]);

  const handleError = () => {
    const nextIndex = attemptIndex + 1;
    if (nextIndex < CAMPUS_PHOTO_BASES.length) {
      setAttemptIndex(nextIndex);
      setImgSrc(`${CAMPUS_PHOTO_BASES[nextIndex]}/${employeeCode}.jpg`);
    } else {
      setImgSrc(placeholderDataUrl);
    }
  };

  return <img src={imgSrc} alt={name || 'Photo'} onError={handleError} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}

function StudentPhoto({ rollNo, name }) {
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'SC';
  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='%231e40af'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' font-family='Inter, Arial, Helvetica, sans-serif' font-size='46' fill='%23ffffff'>${initials}</text></svg>`;
  const placeholderDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  return (
    <img
      src={rollNo ? `/api/proxy/student-photo/${rollNo}` : placeholderDataUrl}
      alt={name || 'Photo'}
      onError={(e) => { e.target.onerror = null; e.target.src = placeholderDataUrl; }}
      loading="lazy"
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

export default function Team() {
  const [conveners, setConveners] = useState([]);
  const [members, setMembers] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [studentCoordinators, setStudentCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardsRef = React.useRef([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        // Fetch Conveners & Members
        const convRes = await fetch('/api/organisation-committee?role=Convener');
        const convData = await convRes.json();
        const coconvRes = await fetch('/api/organisation-committee?role=Member');
        const coconvData = await coconvRes.json();

        const activeConveners = (convData?.data || []).filter(item => item.status === 'Active');
        const activeMembers = (coconvData?.data || []).filter(item => item.status === 'Active');

        setConveners(activeConveners);
        setMembers(activeMembers);

        // Fetch Groups for Event Coordinators
        const groupsRes = await fetch('/api/event-schools');
        const groupsData = await groupsRes.json();
        const rawSchoolGroups = Array.isArray(groupsData)
          ? groupsData
          : (groupsData?.data || groupsData?.schools || groupsData?.eventSchools || groupsData?.groups || []);

        const coordsMap = new Map();

        rawSchoolGroups.filter(g => !g.status || g.status.toLowerCase() === 'active').forEach(group => {
          const c = group.coordinator || group.eventCoordinator;
          if (c) {
            const id = c.institutionId || c.employeeId || c.employeeCode;
            if (id) {
              if (!coordsMap.has(id)) {
                coordsMap.set(id, {
                  id,
                  name: c.employeeName || c.name || 'N/A',
                  phone: c.phone || c.mobile || 'N/A',
                  roles: []
                });
              }
              if (!coordsMap.get(id).roles.includes(group.name)) {
                coordsMap.get(id).roles.push(group.name);
              }
            }
          }
        });

        setCoordinators(Array.from(coordsMap.values()));

        // Fetch Student Coordinators
        const studentCoordsRes = await fetch('/api/organisation-committee?role=Student Coordinator');
        const studentCoordsData = await studentCoordsRes.json();
        setStudentCoordinators(
          (studentCoordsData?.data || []).filter(item => item.status === 'Active')
        );
      } catch (error) {
        console.error("Failed to fetch team data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Mobile GPU-Accelerated Parallax Depth Effect (< 768px)
  useEffect(() => {
    if (loading) return;
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    let ticking = false;
    const activeCards = new Set();

    const updateMobileParallax = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      activeCards.forEach((cardEl) => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const normalizedScroll = (centerY - windowHeight / 2) / (windowHeight / 2);

        const maxOffsetPx = 10;
        const clampedOffset = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, normalizedScroll * maxOffsetPx));

        const avatarInner = cardEl.querySelector('.avatar-ring-container');
        if (avatarInner) {
          avatarInner.style.transform = `translate3d(0, ${clampedOffset.toFixed(2)}px, 0)`;
        }
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
            const avatarInner = entry.target.querySelector('.avatar-ring-container');
            if (avatarInner) {
              avatarInner.style.transform = 'translate3d(0, 0, 0)';
            }
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
  }, [loading, conveners, members, coordinators]);

  return (
    <section className="testimonials-section team-page-container">
      <div className="container-premium text-center" style={{ marginBottom: '4rem' }}>
        <span className="testimonials-header-tag">Team</span>
        {/* <h2 className="testimonials-title text-gradient">
          VEDA Conveners 2026
        </h2> */}

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading...</div>
        ) : conveners.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No active conveners found.</div>
        ) : (
          <div className="premium-team-grid">
            {conveners.map((member, idx) => (
              <div
                key={member._id}
                ref={(el) => (cardsRef.current[idx] = el)}
                className="premium-team-card"
              >
                <div className="avatar-ring-container" style={{ transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)', willChange: 'transform' }}>
                  <div className="avatar-inner">
                    <CoordinatorPhoto
                      employeeCode={member.employee?.institutionId || member.employee?.employeeCode || member.employee?.employeeId || member.institutionId || member.employeeCode || member.employeeId}
                      name={member.employee?.name || member.employee?.employeeName || member.name || member.employeeName}
                    />
                  </div>
                </div>
                <h4 className="member-name">
                  {member.employee?.name || member.employee?.employeeName || 'Unknown'}
                </h4>
                <p className="member-role">
                  {member.role}
                </p>
                <div className="member-phone">
                  <i className="bi bi-telephone-fill" style={{ fontSize: '0.8rem', color: '#8b5cf6' }}></i>
                  {member.employee?.phone || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container-premium text-center" style={{ marginBottom: '4rem' }}>
        <span className="testimonials-header-tag">Members</span>
        {/* <h2 className="testimonials-title text-gradient">
          VEDA Members 2026
        </h2> */}

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading...</div>
        ) : members.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No active members found.</div>
        ) : (
          <div className="premium-team-grid">
            {members.map((member, idx) => (
              <div
                key={member._id}
                ref={(el) => (cardsRef.current[conveners.length + idx] = el)}
                className="premium-team-card"
              >
                <div className="avatar-ring-container" style={{ transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)', willChange: 'transform' }}>
                  <div className="avatar-inner">
                    <CoordinatorPhoto
                      employeeCode={member.employee?.institutionId || member.employee?.employeeCode || member.employee?.employeeId || member.institutionId || member.employeeCode || member.employeeId}
                      name={member.employee?.name || member.employee?.employeeName || member.name || member.employeeName}
                    />
                  </div>
                </div>
                <h4 className="member-name">
                  {member.employee?.name || member.employee?.employeeName || 'Unknown'}
                </h4>
                <p className="member-role">
                  {member.role}
                </p>
                <div className="member-phone">
                  <i className="bi bi-telephone-fill" style={{ fontSize: '0.8rem', color: '#8b5cf6' }}></i>
                  {member.employee?.phone || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      <div className="container-premium text-center" style={{ marginTop: '8rem', marginBottom: '4rem' }}>
        <span className="testimonials-header-tag">Student Leads</span>
        {/* <h2 className="testimonials-title text-gradient">
          VEDA Student Co-Ordinators 2026
        </h2> */}

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading...</div>
        ) : studentCoordinators.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No student coordinators found.</div>
        ) : (
          <div className="premium-team-grid">
            {studentCoordinators.map((coord) => (
              <div key={coord._id} className="premium-team-card">
                <div className="avatar-ring-container">
                  <div className="avatar-inner">
                    <StudentPhoto
                      rollNo={coord.rollNo}
                      name={coord.studentName}
                    />
                  </div>
                </div>
                <h4 className="member-name">
                  {coord.studentName || 'N/A'}
                </h4>
                <div className="member-phone">
                  <i className="bi bi-telephone-fill" style={{ fontSize: '0.8rem', color: '#8b5cf6' }}></i>
                  {coord.mobileNumber || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
