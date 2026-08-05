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

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(
    employeeCode ? `${CAMPUS_PHOTO_BASES[0]}/${employeeCode}.jpg` : placeholderDataUrl
  );

  useEffect(() => {
    setAttemptIndex(0);
    setImgSrc(employeeCode ? `${CAMPUS_PHOTO_BASES[0]}/${employeeCode}.jpg` : placeholderDataUrl);
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

export default function Team() {
  const [conveners, setConveners] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        // Fetch Conveners & Co-conveners
        const convRes = await fetch('/api/organisation-committee?role=Convener');
        const convData = await convRes.json();
        const coconvRes = await fetch('/api/organisation-committee?role=Co-convener');
        const coconvData = await coconvRes.json();

        const orgCommittee = [
          ...(convData?.data || []),
          ...(coconvData?.data || [])
        ].filter(item => item.status === 'Active');

        setConveners(orgCommittee);

        // Fetch Groups for Event Coordinators
        const groupsRes = await fetch('/api/groups');
        const groupsData = await groupsRes.json();
        
        const coordsMap = new Map();
        
        (groupsData?.groups || []).forEach(group => {
          if (group.eventCoordinator) {
            const c = group.eventCoordinator;
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
      } catch (error) {
        console.error("Failed to fetch team data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  return (
    <section className="testimonials-section team-page-container">
      <div className="container-premium text-center" style={{ marginBottom: '4rem' }}>
        <span className="testimonials-header-tag">Leadership</span>
        <h2 className="testimonials-title text-gradient">
          VEDA Organizing Committee 2026
        </h2>
        
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading...</div>
        ) : conveners.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No active conveners found.</div>
        ) : (
          <div className="premium-team-grid">
            {conveners.map((member) => (
              <div key={member._id} className="premium-team-card">
                <div className="avatar-ring-container">
                  <div className="avatar-inner">
                    <CoordinatorPhoto 
                      employeeCode={member.employee?.institutionId || member.employee?.employeeCode} 
                      name={member.employee?.name || member.employee?.employeeName} 
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
        <span className="testimonials-header-tag">Event Leads</span>
        <h2 className="testimonials-title text-gradient">
          VEDA Staff Co-Ordinators 2026
        </h2>
        
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>Loading...</div>
        ) : coordinators.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>No coordinators found.</div>
        ) : (
          <div className="premium-team-grid">
            {coordinators.map((coord) => (
              <div key={coord.id} className="premium-team-card">
                <div className="avatar-ring-container">
                  <div className="avatar-inner">
                    <CoordinatorPhoto 
                      employeeCode={coord.id} 
                      name={coord.name} 
                    />
                  </div>
                </div>
                <h4 className="member-name">
                  {coord.name}
                </h4>
                <p className="member-role">
                  {coord.roles.join(', ')}
                </p>
                <div className="member-phone">
                  <i className="bi bi-telephone-fill" style={{ fontSize: '0.8rem', color: '#8b5cf6' }}></i>
                  {coord.phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
