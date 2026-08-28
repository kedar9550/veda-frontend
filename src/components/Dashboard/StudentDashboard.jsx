import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import StudentRegistrationPopup from '../Events/StudentRegistrationPopup';
import Barcode from 'react-barcode';
import GoldLogo from '../SDGs/GoldLogo';
import adityaLogo from '../../assets/Aditya University Gold Logo.png';
import adityaCircleLogo from '../../assets/Circle_Gold.svg';
import './StudentDashboard.css';

export default function StudentDashboard({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);

  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 'overview';
  });

  const [isEditingProfile, setIsEditingProfile] = useState(() => {
    return !!location.state?.isEditingProfile;
  });

  const [editForm, setEditForm] = useState({
    name: '',
    college: '',
    otherCollege: '',
    roll: '',
    gender: '',
    mobile: '',
    email: ''
  });

  const scrollToProfile = () => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.getElementById('student-profile-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        clearInterval(interval);
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 50);
  };

  // Handle openProfileTab custom event listener
  useEffect(() => {
    const handleOpenProfile = () => {
      setActiveTab('profile');
      setIsEditingProfile(true);
      scrollToProfile();
    };

    window.addEventListener('openProfileTab', handleOpenProfile);
    return () => {
      window.removeEventListener('openProfileTab', handleOpenProfile);
    };
  }, []);

  // Sync state when location.state changes
  useEffect(() => {
    if (location.state?.activeTab === 'profile' || location.state?.isEditingProfile) {
      setActiveTab('profile');
      setIsEditingProfile(true);
      scrollToProfile();
    } else if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.key, location.state]);

  // Sync edit form when student data loads/changes
  useEffect(() => {
    if (student) {
      setEditForm({
        name: student.name || '',
        college: student.college || '',
        otherCollege: student.otherCollege || '',
        roll: student.roll || '',
        gender: student.gender || '',
        mobile: student.mobile || '',
        email: student.email || ''
      });
    }
  }, [student]);

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);
  const [zoomedPhoto, setZoomedPhoto] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState({});
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);
  const [eventsCardExpanded, setEventsCardExpanded] = useState(false);

  const toggleEventExpand = (index) => {
    setExpandedEvents(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const [eventVenues, setEventVenues] = useState({});

  // Fetch all event venues to map registration names to venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/events`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.events || data.data || []);
          if (Array.isArray(items)) {
            const venueMap = {};
            items.forEach(item => {
              const name = item.eventName || item.title || item.name || '';
              let venueStr = item.venue || item.location || item.venueLocation || '';
              if (!venueStr && item.building && item.roomNo) {
                const floorName = item.floor && item.floor.name ? item.floor.name : '';
                venueStr = `Room No: ${item.roomNo}, ${item.building.name || ''}${floorName ? ' - ' + floorName : ''}`;
              }
              if (name && venueStr) {
                venueMap[name.toLowerCase().trim()] = venueStr;
              }
              if (item._id && venueStr) {
                venueMap[item._id.toString()] = venueStr;
              }
            });
            setEventVenues(prev => ({ ...prev, ...venueMap }));
          }
        }
      } catch (err) {
        console.error('Error fetching event venues:', err);
      }
    };
    fetchVenues();
  }, []);

  // Load logged-in student info
  useEffect(() => {
    const checkLoggedStudent = () => {
      const studentStr = localStorage.getItem('eventStudent');
      if (studentStr) {
        try {
          const parsed = JSON.parse(studentStr);
          setStudent(parsed);
        } catch (e) {
          setStudent(null);
          navigate('/login');
        }
      } else {
        setStudent(null);
        navigate('/login');
      }
    };

    checkLoggedStudent();

    const handleStorageChange = () => checkLoggedStudent();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentLoggedIn', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentLoggedIn', handleStorageChange);
    };
  }, []);

  // Fetch registrations & payment data for the student
  useEffect(() => {
    if (!student) {
      setLoading(false);
      return;
    }

    const fetchRegistrations = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        if (student.email) queryParams.append('email', student.email);
        if (student.roll) queryParams.append('roll', student.roll);

        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${baseUrl}/api/razorpay/registrations?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to load registrations');
        }
        const data = await res.json();
        setRegistrations(data.payments || []);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Could not fetch payment and event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [student]);

  // Polling for pass verification when a pass is open
  useEffect(() => {
    let intervalId;

    if (selectedPass && selectedPass.barcode && student) {
      intervalId = setInterval(async () => {
        try {
          const queryParams = new URLSearchParams();
          if (student.email) queryParams.append('email', student.email);
          if (student.roll) queryParams.append('roll', student.roll);
          queryParams.append('_t', Date.now()); // Prevent caching

          const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
          const res = await fetch(`${baseUrl}/api/razorpay/registrations?${queryParams.toString()}`);
          if (res.ok) {
            const data = await res.json();
            const currentRegistrations = data.payments || [];

            // Check if the current selected pass is still valid and if it's verified
            let isVerified = false;
            let isValid = false;
            let dbParticipant = null;
            for (const reg of currentRegistrations) {
              if (reg.participants) {
                const p = reg.participants.find(p => p.barcode === selectedPass.barcode);
                if (p) {
                  isValid = true;
                  dbParticipant = p;
                  if (p.attended === true) {
                    isVerified = true;
                  }
                  break;
                }
              }
            }

            if (!isValid) {
              toast.error('invalid pass', {
                style: { background: '#ef4444', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }
              });
              setSelectedPass(null);
              setRegistrations(currentRegistrations);
            } else if (isVerified) {
              const prevScanAttempt = selectedPass.lastScanAttempt || 0;
              const currScanAttempt = dbParticipant.lastScanAttempt || 0;

              if (currScanAttempt > prevScanAttempt) {
                if (selectedPass.attended) {
                  toast.error('already verified', {
                    style: { background: '#f59e0b', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }
                  });
                } else {
                  toast.success('pass verfied', {
                    style: { background: '#22c55e', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }
                  });
                }
                setSelectedPass(null);
                setRegistrations(currentRegistrations);
              } else if (!selectedPass.attended) {
                // Fallback for old data where lastScanAttempt isn't updating
                toast.success('pass verfied', {
                  style: { background: '#22c55e', color: '#fff', border: 'none', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold' }
                });
                setSelectedPass(null);
                setRegistrations(currentRegistrations);
              } else {
                setRegistrations(currentRegistrations);
              }
            } else {
              setRegistrations(currentRegistrations);
            }
          }
        } catch (err) {
          console.error('Error polling pass status:', err);
        }
      }, 1000); // Poll every 1 second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedPass, student]);

  // Helper calculation for total amount paid
  const totalAmountPaid = registrations.reduce((sum, reg) => {
    return sum + (reg.amountRupees || reg.amount || 0);
  }, 0);

  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.college || !editForm.roll || !editForm.gender || !editForm.mobile || !editForm.email) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setSavingProfile(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/event-students/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: student._id || student.id,
          ...editForm
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update student local state & localStorage
      const updatedStudent = data.student;
      localStorage.setItem('eventStudent', JSON.stringify(updatedStudent));
      window.dispatchEvent(new Event('studentLoggedIn'));
      setStudent(updatedStudent);
      setIsEditingProfile(false);
      setActiveTab('overview');
      navigate('/dashboard', { state: { activeTab: 'overview', isEditingProfile: false }, replace: true });
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (!student) {
    return (
      <div className="container-premium dashboard-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to login...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container-premium dashboard-container">
      {/* Student Profile Header Content (Flat Layout) */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="user-profile-summary">
          <div className="user-info-meta">
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Welcome back,
              </span>
              <h2 style={{ margin: 0, fontWeight: '800', fontSize: '2.25rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>
                {student.name}
              </h2>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Here is a quick snapshot of your event registrations, participant details, and payment histories for VEDA 2026.
            </p>

            <div className="user-badges">
              <span className="badge-custom badge-roll">
                <i className="bi bi-card-text"></i> {student.roll}
              </span>
              <span className="badge-custom badge-college">
                <i className="bi bi-building"></i> {student.college === 'Other College' ? student.otherCollege : student.college}
              </span>
              <span className="badge-custom badge-email">
                <i className="bi bi-envelope"></i> {student.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-icon events">
            <i className="bi bi-calendar-check-fill"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">{registrations.length}</div>
            <div className="stat-label">Events Registered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon payments">
            <i className="bi bi-currency-rupee"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value">₹{totalAmountPaid.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Amount Paid</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon status">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="stat-details">
            <div className="stat-value" style={{ color: '#28a745', fontSize: '1.25rem' }}>
              Active Student
            </div>
            <div className="stat-label">Verification Status</div>
          </div>
        </div>
      </div>



      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <div className="spinner-border text-primary" role="status" style={{ marginBottom: '1rem' }}></div>
          <p>Loading your event & payment records...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.3)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
          {error}
        </div>
      )}

      {/* Student Profile Tab is now rendered below the grid cards */}

      {/* Overview Content showing both Event and Payment Cards Side by Side (Always visible below the main content) */}
      {!loading && (
        <div className="dashboard-grid-two-col" style={{ marginTop: '2rem' }}>
          {/* Card 1: Registered Events */}
          <div
            className="profile-card"
            style={{
              height: 'fit-content',
              padding: eventsCardExpanded ? '1.5rem 2rem' : '1rem 1.5rem',
              transition: 'padding 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={() => setEventsCardExpanded(!eventsCardExpanded)}
            >
              <h3 style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: eventsCardExpanded ? '1.35rem' : '1.05rem',
                fontWeight: eventsCardExpanded ? '700' : '600',
                transition: 'font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1), font-weight 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <i
                  className={`bi ${eventsCardExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}
                  style={{
                    color: 'var(--primary)',
                    fontSize: eventsCardExpanded ? '1.1rem' : '0.95rem',
                    transition: 'font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></i>
                Registered Events
              </h3>
            </div>

            {eventsCardExpanded && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--glass-border)', paddingTop: '1rem' }}>
                {registrations.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-journal-x"></i>
                    <h4>No Event Registrations Found</h4>
                    <p>When you register for events, participant details will be listed here.</p>
                  </div>
                ) : (
                  registrations.map((reg, index) => {
                    const isExpanded = !!expandedEvents[index];
                    return (
                      <div key={reg._id || index} className="event-reg-card" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
                        <div
                          className="event-reg-header"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                          onClick={() => toggleEventExpand(index)}
                        >
                          <div className="event-title-meta">
                            <h4 style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`} style={{ color: 'var(--primary)', fontSize: '0.9rem' }}></i>
                              {reg.eventName || 'Event Registration'}
                            </h4>
                            <div className="event-sub-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                              {reg.category && <span className="tag-category" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)' }}>{reg.category}</span>}
                              {/* {reg.schoolId && <span className="tag-school" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)' }}>School: {reg.schoolId}</span>} */}
                              <span><i className="bi bi-people"></i> Team: {reg.teamSize}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="tag-paid" style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' }}>
                              <i className="bi bi-check-circle-fill"></i> PAID
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ₹{reg.amountRupees || reg.amount}
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--glass-border)', paddingTop: '1rem' }}>
                            <div className="participants-section-title" style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                              <i className="bi bi-people-fill"></i> Team Participant Details ({reg.participants?.length || 0})
                            </div>

                            <div className="table-custom-wrapper">
                              <table className="table-custom" style={{ fontSize: '0.8rem' }}>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Photo</th>
                                    <th>Name</th>
                                    <th>Roll No</th>
                                    <th>College</th>
                                    <th>Pass</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reg.participants && reg.participants.length > 0 ? (
                                    reg.participants.map((p, pIdx) => (
                                      <tr key={pIdx}>
                                        <td>{pIdx + 1}</td>
                                        <td>
                                          {(() => {
                                            let computedUrl = p.photoUrl;
                                            if (computedUrl && computedUrl.includes('localhost:9022')) {
                                              computedUrl = computedUrl.replace('localhost:9022', 'localhost:4000');
                                            } else if (!computedUrl && p.college === 'Other College' && p.roll) {
                                              computedUrl = `http://localhost:4000/othercollegephotos/${p.roll}.jpg`;
                                            } else if (!computedUrl && p.roll) {
                                              computedUrl = `https://info.aec.edu.in/aec/employeephotos/${p.roll}.jpg`;
                                            }
                                            return (
                                              <div
                                                style={{ position: 'relative', width: '36px', height: '36px', cursor: computedUrl ? 'pointer' : 'default' }}
                                                onClick={() => {
                                                  if (computedUrl) setZoomedPhoto(computedUrl);
                                                }}
                                              >
                                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: p.gender?.toLowerCase() === 'female' ? 'rgba(219, 39, 119, 0.1)' : 'rgba(37, 99, 235, 0.1)', color: p.gender?.toLowerCase() === 'female' ? '#db2777' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                  <i className="bi bi-person-fill" style={{ fontSize: '18px' }}></i>
                                                </div>
                                                {computedUrl && (
                                                  <img
                                                    src={computedUrl}
                                                    alt={p.name || 'Participant'}
                                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                  />
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{p.name || 'N/A'}</td>
                                        <td>{p.roll || 'N/A'}</td>
                                        <td>{p.college === 'Other College' ? p.otherCollege : (p.college || 'N/A')}</td>
                                        <td>
                                          {p.barcode ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <button className="btn-receipt" style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setSelectedPass({ ...p, eventId: reg.eventId, eventName: reg.eventName, teamId: reg.teamId, venue: reg.venue || reg.eventVenue || (reg.rawEventData && reg.rawEventData.venue) }); }}>
                                                <i className="bi bi-upc-scan"></i> Pass
                                              </button>
                                              {p.attended && (
                                                <span style={{ color: '#22c55e', fontSize: '1rem' }} title="Verified">
                                                  <i className="bi bi-check-circle-fill"></i>
                                                </span>
                                              )}
                                            </div>
                                          ) : (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Pass</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No specific participant list attached.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Card 2: Payment Details */}
          <div
            className="profile-card"
            style={{
              height: 'fit-content',
              padding: paymentsExpanded ? '1.5rem 2rem' : '1rem 1.5rem',
              transition: 'padding 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={() => setPaymentsExpanded(!paymentsExpanded)}
            >
              <h3 style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: paymentsExpanded ? '1.35rem' : '1.05rem',
                fontWeight: paymentsExpanded ? '700' : '600',
                transition: 'font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1), font-weight 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <i
                  className={`bi ${paymentsExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}
                  style={{
                    color: 'var(--primary)',
                    fontSize: paymentsExpanded ? '1.1rem' : '0.95rem',
                    transition: 'font-size 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                ></i>
                Payment Details
              </h3>
            </div>

            {paymentsExpanded && (
              <div style={{ marginTop: '1.25rem', borderTop: '1px dashed var(--glass-border)', paddingTop: '1rem' }}>
                {registrations.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-cash-stack"></i>
                    <h4>No Payment History Available</h4>
                    <p>Completed Razorpay transaction records will appear here.</p>
                  </div>
                ) : (
                  <div className="table-custom-wrapper">
                    <table className="table-custom" style={{ fontSize: '0.8rem' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Event Name</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, idx) => (
                          <tr key={reg._id || idx}>
                            <td>{reg.paidAt ? new Date(reg.paidAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                            <td style={{ fontWeight: '600' }}>{reg.eventName || 'Event Registration'}</td>
                            <td style={{ fontWeight: '700', color: '#28a745' }}>₹{reg.amountRupees || reg.amount}</td>
                            <td>
                              <button className="btn-receipt" style={{ padding: '0.15rem 0.4rem', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setSelectedReceipt(reg); }}>
                                <i className="bi bi-file-earmark-text"></i> Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Profile Card (Rendered below Registered Events & Payment Details cards) */}
      {(activeTab === 'profile' || isEditingProfile) && (
        <div id="student-profile-section" className="profile-card" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: '700' }}>Student Profile Details</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
                Your personal and academic account details
              </p>
            </div>
            {!isEditingProfile ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-admissions"
                  style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    setEditForm({
                      name: student.name || '',
                      college: student.college || '',
                      otherCollege: student.otherCollege || '',
                      roll: student.roll || '',
                      gender: student.gender || '',
                      mobile: student.mobile || '',
                      email: student.email || ''
                    });
                    setIsEditingProfile(true);
                  }}
                >
                  <i className="bi bi-pencil-square"></i> Edit Profile
                </button>
                <button
                  className="btn-logout"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)', background: 'var(--glass)', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    setActiveTab('overview');
                    setIsEditingProfile(false);
                    navigate('/dashboard', { state: { activeTab: 'overview', isEditingProfile: false }, replace: true });
                  }}
                >
                  <i className="bi bi-x-lg"></i> Close
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-admissions"
                  style={{ background: '#28a745', color: '#fff', border: 'none' }}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn-logout"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)', background: 'var(--glass)', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    setIsEditingProfile(false);
                    setActiveTab('overview');
                    navigate('/dashboard', { state: { activeTab: 'overview', isEditingProfile: false }, replace: true });
                  }}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} noValidate className="profile-grid" style={{ marginTop: '1.5rem' }}>
              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  disabled
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Roll Number</label>
                <input
                  type="text"
                  value={editForm.roll}
                  disabled
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>College</label>
                <select
                  value={editForm.college}
                  disabled
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  <option value="Aditya University">Aditya University</option>
                  <option value="ACET">ACET</option>
                  <option value="Other College">Other College</option>
                </select>
              </div>

              {editForm.college === 'Other College' && (
                <div className="profile-field-group">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>College Name</label>
                  <input
                    type="text"
                    value={editForm.otherCollege}
                    disabled
                    style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>
              )}

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Gender</label>
                <select
                  value={editForm.gender}
                  disabled
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem', opacity: 0.6, cursor: 'not-allowed' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Mobile</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </form>
          ) : (
            <div className="profile-info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Full Name</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.name || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Roll Number</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.roll || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Mobile</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.mobile || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Email</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.email || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>College</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.college === 'Other College' ? student.otherCollege : student.college || 'N/A'}</strong>
              </div>
              <div className="info-item">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Gender</span>
                <strong style={{ color: 'var(--text-light)', fontSize: '1rem' }}>{student.gender || 'N/A'}</strong>
              </div>
            </div>
          )}
        </div>
      )}







      {/* Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-header">
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#007bff' }}>
                VEDA 2026 OFFICIAL RECEIPT
              </div>
              <h2>Payment Summary</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                Transaction Verified & Recorded
              </p>
            </div>

            <div className="receipt-row">
              <span className="label">Event Name</span>
              <span className="val">{selectedReceipt.eventName || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Group / Category</span>
              <span className="val">{selectedReceipt.schoolId} ({selectedReceipt.category})</span>
            </div>
            <div className="receipt-row">
              <span className="label">Razorpay Payment ID</span>
              <span className="val" style={{ fontFamily: 'monospace' }}>{selectedReceipt.razorpayPaymentId}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Razorpay Order ID</span>
              <span className="val" style={{ fontFamily: 'monospace' }}>{selectedReceipt.razorpayOrderId}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Primary Student</span>
              <span className="val">{student.name} ({student.roll})</span>
            </div>
            <div className="receipt-row">
              <span className="label">Team Size</span>
              <span className="val">{selectedReceipt.teamSize} Participant(s)</span>
            </div>
            <div className="receipt-row">
              <span className="label">Date & Time</span>
              <span className="val">{selectedReceipt.paidAt ? new Date(selectedReceipt.paidAt).toLocaleString('en-IN') : 'N/A'}</span>
            </div>
            <div className="receipt-row" style={{ fontSize: '1.1rem', borderBottom: 'none', paddingTop: '1rem' }}>
              <span className="label" style={{ fontWeight: '700' }}>Total Amount Paid</span>
              <span className="val" style={{ color: '#28a745', fontWeight: '800' }}>₹{selectedReceipt.amountRupees || selectedReceipt.amount}</span>
            </div>

            <div className="receipt-actions">
              <button
                className="btn-receipt"
                style={{ background: 'var(--glass-hover)', color: 'var(--text-light)', border: '1px solid var(--glass-border)' }}
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button
                className="btn-receipt"
                style={{ background: '#007bff', color: '#ffffff', border: 'none' }}
                onClick={() => window.print()}
              >
                <i className="bi bi-printer-fill"></i> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Pass Modal */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', width: '100%', position: 'relative', padding: '0', background: '#f8fafc', border: 'none', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="bi bi-person-vcard-fill" style={{ color: '#38bdf8', fontSize: '24px' }}></i>
                <h2 style={{ fontSize: '1.25rem', margin: '0', fontWeight: '800', color: '#fff' }}>Event Pass</h2>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={async () => {
                    const passElement = document.getElementById('event-pass-card');
                    if (passElement) {
                      try {
                        const html2canvas = (await import('html2canvas')).default;
                        const html2pdf = (await import('html2pdf.js')).default;
                        const opt = {
                          margin: 0,
                          filename: `${selectedPass.eventName}_Pass_${selectedPass.roll}.pdf`,
                          image: { type: 'jpeg', quality: 0.98 },
                          html2canvas: { scale: 2, useCORS: true, logging: false },
                          jsPDF: { unit: 'px', format: [750, 480], orientation: 'landscape' }
                        };

                        // Clone the pass element to prevent visual shaking in the UI
                        const clone = passElement.cloneNode(true);
                        const wrapper = document.createElement('div');
                        wrapper.style.position = 'absolute';
                        wrapper.style.left = '-9999px';
                        wrapper.style.top = '-9999px';
                        // Ensure clone does not inherit any scale transformations
                        clone.style.transform = 'none';
                        wrapper.appendChild(clone);
                        document.body.appendChild(wrapper);

                        await html2pdf().set(opt).from(clone).save();

                        // Cleanup
                        document.body.removeChild(wrapper);
                      } catch (err) {
                        console.error('Failed to download pass:', err);
                      }
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s', padding: '4px' }}
                  title="Download Pass"
                >
                  <i className="bi bi-download" style={{ fontSize: '1.2rem' }}></i>
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#cbd5e1', transition: 'all 0.2s', padding: '4px' }}
                  title="Close Pass"
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '1.2rem' }}></i>
                </button>
              </div>
            </div>

            {/* Modal Body with Pass */}
            <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflowX: 'auto' }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-70px' }}>
                <div
                  id="event-pass-card"
                  style={{
                    boxSizing: 'border-box',
                    width: '750px',
                    height: '480px',
                    minWidth: '750px',
                    minHeight: '480px',
                    flexShrink: 0,
                    margin: '0 auto',
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1.5px solid #061638',
                    position: 'relative',
                    overflow: 'hidden',
                    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* SVG Base L-Shape Background */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <svg width="100%" height="100%" preserveAspectRatio="none">
                      {/* Top right subtle dot pattern in white area */}
                      <pattern id="dots" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                        <circle fill="rgba(6, 22, 56, 0.1)" cx="2" cy="2" r="2"></circle>
                      </pattern>
                      <rect x="0" y="0" width="750" height="480" fill="url(#dots)" />

                      {/* Main Dark Blue L-Shape */}
                      <path d="M 0 0 L 250 0 C 180 30, 160 80, 160 160 L 160 380 L 750 380 L 750 480 L 0 480 Z" fill="#061638" />

                      {/* Thick Gold Accent Curve on the outside */}
                      <path d="M 250 0 C 180 30, 160 80, 160 160 L 172 160 C 172 85, 190 35, 262 0 Z" fill="#c69a37" />

                      {/* Subtle background waves in the blue area */}
                      <path d="M -50 50 Q 50 100, 100 200 T 50 400" stroke="rgba(255,255,255,0.05)" strokeWidth="40" fill="none" />
                      <path d="M -20 20 Q 80 70, 130 170 T 80 370" stroke="rgba(255,255,255,0.05)" strokeWidth="30" fill="none" />

                      {/* Bottom left sweeping gold line */}
                      <path d="M -20 400 Q 80 430, 155 365" stroke="#c69a37" strokeWidth="2.5" fill="none" />
                    </svg>
                  </div>

                  {/* Center Watermark inside Left Sidebar */}
                  <div style={{ position: 'absolute', top: 120, left: -20, width: '200px', opacity: 0.15, pointerEvents: 'none', filter: 'grayscale(100%)', zIndex: 1 }}>
                    <img src={adityaCircleLogo} alt="Watermark" style={{ width: '200px', height: '200px' }} />
                  </div>

                  {/* Right Side Watermark */}
                  <div style={{ position: 'absolute', top: 100, right: -40, width: '350px', opacity: 0.05, pointerEvents: 'none', filter: 'grayscale(100%)', zIndex: 1 }}>
                    <img src={adityaCircleLogo} alt="Watermark Right" style={{ width: '350px', height: '350px' }} />
                  </div>

                  {/* --- FOREGROUND CONTENT --- */}

                  {/* Top Right Logo */}
                  <div style={{ position: 'absolute', top: 30, right: 30, zIndex: 2, backgroundColor: '#fff', padding: '4px', borderRadius: '8px' }}>
                    <img src={adityaLogo} alt="Aditya Logo" style={{ width: '150px' }} />
                  </div>

                  {/* Top Left Team ID */}
                  <div style={{ position: 'absolute', top: 25, left: 30, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#fff', fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.2 }}>TEAM ID</div>
                    <div style={{ color: '#c69a37', fontSize: '15px', fontWeight: 700, lineHeight: 1.2, marginTop: '2px' }}>{selectedPass.teamId || 'VD26-1785574579911'}</div>
                  </div>

                  {/* Left Sidebar Bottom Details */}
                  <div style={{ position: 'absolute', top: 190, left: 15, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <i className="bi bi-calendar-month-fill" style={{ color: '#fff', fontSize: 28, marginRight: '8px' }}></i>
                      <div>
                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px', lineHeight: 1.2 }}>EVENT DATE</div>
                        <div style={{ color: '#c69a37', fontSize: '15px', fontWeight: 800, lineHeight: 1.2, marginTop: '2.4px' }}>SEP. 2026</div>
                      </div>
                    </div>
                  </div>

                  {/* Center Header (VEDA, EVENT PASS, Code Reto) */}
                  <div style={{ position: 'absolute', top: 20, left: 180, right: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <div style={{ color: '#061638', fontSize: '48px', fontWeight: 900, lineHeight: 1 }}>VEDA</div>
                      <div style={{ color: '#c69a37', fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>2K26</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', marginBottom: '8px' }}>
                      <div style={{ width: '40px', height: '1.5px', backgroundColor: '#000' }} />
                      <div style={{ color: '#000', fontSize: '14px', fontWeight: 700, letterSpacing: '4px' }}>EVENT PASS</div>
                      <div style={{ width: '40px', height: '1.5px', backgroundColor: '#000' }} />
                    </div>
                    <div style={{ backgroundColor: '#061638', borderRadius: '20px', padding: '3px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minWidth: '160px', width: 'max-content' }}>
                      <div style={{ position: 'absolute', left: -5, width: '8px', height: '8px', backgroundColor: '#c69a37', transform: 'rotate(45deg)' }} />
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, whiteSpace: 'nowrap' }}>{selectedPass.eventName || 'Code Reto'}</div>
                      <div style={{ position: 'absolute', right: -5, width: '8px', height: '8px', backgroundColor: '#c69a37', transform: 'rotate(45deg)' }} />
                    </div>
                  </div>

                  {/* Central Details & Photo area */}
                  <div style={{ position: 'absolute', top: 140, left: 190, right: 35, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>

                    {/* Details List */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '16px' }}>
                      {[
                        { icon: 'person-fill', label: 'Name', value: selectedPass.name ? selectedPass.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : selectedPass.name },
                        { icon: 'person-vcard-fill', label: 'Roll', value: selectedPass.roll },
                        { icon: 'mortarboard-fill', label: 'College', value: selectedPass.college === 'Other College' ? selectedPass.otherCollege : selectedPass.college },
                        { icon: 'telephone-fill', label: 'Phone', value: selectedPass.mobile },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', position: 'relative', paddingBottom: '8px' }}>
                          <div style={{
                            backgroundColor: '#061638',
                            color: '#fff',
                            borderRadius: '50%',
                            padding: '4.8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px',
                            width: '32px',
                            height: '32px'
                          }}>
                            <i className={`bi bi-${item.icon}`} style={{ fontSize: '18px' }}></i>
                          </div>
                          <div style={{ color: '#061638', fontWeight: 800, fontSize: '18px', width: '95px', flexShrink: 0 }}>
                            {item.label}
                          </div>
                          <div style={{ color: '#061638', fontWeight: 800, fontSize: '18px', marginRight: '12px' }}>:</div>
                          <div style={{
                            color: '#000',
                            fontWeight: 800,
                            fontSize: '18px',
                            flex: 1,
                            lineHeight: 1.3,
                            paddingTop: '1.6px',
                            whiteSpace: 'pre-line'
                          }}>
                            {item.value || '-'}
                          </div>
                          {/* Divider */}
                          {idx < 3 && (
                            <div style={{ position: 'absolute', bottom: -4, left: 45, right: 0, borderBottom: '1px solid rgba(0,0,0,0.15)' }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Photo Container */}
                    <div style={{
                      width: 140,
                      height: 175,
                      borderRadius: '12px',
                      border: `2px solid #061638`,
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      marginTop: '16px',
                      position: 'relative'
                    }}>
                      {(() => {
                        let computedUrl = selectedPass.photoUrl;
                        if (computedUrl && computedUrl.includes('localhost:9022')) {
                          computedUrl = computedUrl.replace('localhost:9022', 'localhost:4000');
                        } else if (!computedUrl && selectedPass.college === 'Other College' && selectedPass.roll) {
                          computedUrl = `http://localhost:4000/othercollegephotos/${selectedPass.roll}.jpg`;
                        } else if (!computedUrl && selectedPass.roll) {
                          computedUrl = `https://info.aec.edu.in/aec/employeephotos/${selectedPass.roll}.jpg`;
                        }
                        return (
                          <>
                            <div style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: selectedPass.gender?.toLowerCase() === 'female' ? '#fdf2f8' : '#eff6ff',
                              color: selectedPass.gender?.toLowerCase() === 'female' ? '#db2777' : '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="bi bi-person-fill" style={{ fontSize: '70px' }}></i>
                            </div>
                            {computedUrl && (
                              <img
                                src={computedUrl}
                                alt={selectedPass.name}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Full Width Barcode Section */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    backgroundColor: '#fff',
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 -4px 15px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    borderTop: `2px solid #061638`
                  }}>
                    {selectedPass.barcode ? (
                      <>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                          <style>{`
                            .barcode-wrapper svg {
                              width: 60% !important;
                              height: 60px !important;
                              display: block !important;
                            }
                          `}</style>
                          <div className="barcode-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Barcode
                              value={selectedPass.barcode}
                              width={4}
                              height={60}
                              displayValue={false}
                              background="transparent"
                              lineColor="#000"
                              margin={0}
                            />
                          </div>
                        </div>
                        <div style={{ color: '#000', fontWeight: 800, fontSize: '16px', marginTop: '4px', letterSpacing: '8px' }}>
                          {selectedPass.barcode}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '6.4px', textAlign: 'center' }}>
                          <span style={{ color: '#000' }}>VENUE: </span>
                          <span style={{ color: '#c69a37' }}>
                            {(() => {
                              const lookupKey = (selectedPass.eventName || '').toLowerCase().trim();
                              const eventIdKey = (selectedPass.eventId || '').toString();
                              const SUB_EVENT_VENUES_FALLBACK = {
                                'agro innovate': 'Room 202, R&C LAB, Second Floor, Bill Gates Bhavan',
                                'smart farm hackathon': 'Innovation Hub, Ground Floor, Main Block',
                                'soil analysis challenge': 'Soil Science Lab, Block B, Agriculture Building',
                                'agri exhibit': 'Online + Exhibition Hall, Admin Block',
                                'drone sprint': 'University Grounds, Open Area near Sports Complex',
                                'agri design': 'Open Air Theatre (OAT), Central Ground',
                                'cultivators': 'AC Seminar Hall, Cotton Bhavan',
                                'pharma quest': 'Advanced Research Lab, Pharmacy Block',
                                'scitech model': 'Ramanujan Hall, Science Block',
                                'biz pitch': 'MBA Seminar Hall, Newton Bhavan'
                              };
                              return selectedPass.venue || eventVenues[eventIdKey] || eventVenues[lookupKey] || SUB_EVENT_VENUES_FALLBACK[lookupKey] || 'Room No: 021, Bill Gates Bhavan - GROUND FLOOR';
                            })()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>No Barcode</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Zoomed Photo Modal */}
      {zoomedPhoto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setZoomedPhoto(null)}>
          <div style={{ position: 'relative', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '95vw', maxHeight: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomedPhoto(null)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <img
              src={zoomedPhoto}
              alt="Zoomed Participant"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
