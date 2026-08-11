import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import StudentRegistrationPopup from '../Events/StudentRegistrationPopup';
import Barcode from 'react-barcode';
import GoldLogo from '../SDGs/GoldLogo';
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
                              {reg.schoolId && <span className="tag-school" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.08)' }}>School: {reg.schoolId}</span>}
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





      {/* Events & Participants Tab */}
      {!loading && activeTab === 'events' && (
        <div>
          <h3 style={{ fontWeight: '700', marginBottom: '1.25rem' }}>All Registered Events & Participant Details</h3>
          {registrations.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-journal-x"></i>
              <h4>No Event Registrations Found</h4>
              <p>When you register for events, participant details will be listed here.</p>
            </div>
          ) : (
            registrations.map((reg, index) => (
              <div key={reg._id || index} className="event-reg-card">
                <div className="event-reg-header">
                  <div className="event-title-meta">
                    <h3>{reg.eventName || 'Event Registration'}</h3>
                    <div className="event-sub-info">
                      {reg.category && <span className="tag-category">{reg.category}</span>}
                      {reg.schoolId && <span className="tag-school">School: {reg.schoolId}</span>}
                      <span><i className="bi bi-people"></i> Team Size: {reg.teamSize}</span>
                      <span><i className="bi bi-calendar3"></i> {reg.paidAt ? new Date(reg.paidAt).toLocaleString('en-IN') : 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <span className="tag-paid">
                      <i className="bi bi-check-circle-fill"></i> {reg.paymentStatus || 'PAID'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Amount: <strong>₹{reg.amountRupees || reg.amount}</strong>
                    </span>
                  </div>
                </div>

                <div className="participants-section-title">
                  <i className="bi bi-people-fill"></i> Team Participant Details ({reg.participants?.length || 0})
                </div>

                <div className="table-custom-wrapper">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>College</th>
                        <th>Gender</th>
                        <th>Department</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Accommodation</th>
                        <th>Pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reg.participants && reg.participants.length > 0 ? (
                        reg.participants.map((p, pIdx) => (
                          <tr key={pIdx}>
                            <td>{pIdx + 1}</td>
                            <td style={{ fontWeight: '600' }}>{p.name || 'N/A'}</td>
                            <td>{p.roll || 'N/A'}</td>
                            <td>{p.college === 'Other College' ? p.otherCollege : (p.college || 'N/A')}</td>
                            <td>{p.gender || 'N/A'}</td>
                            <td>{p.department || 'N/A'}</td>
                            <td>{p.mobile || 'N/A'}</td>
                            <td>{p.email || 'N/A'}</td>
                            <td>{p.accommodation || 'No'}</td>
                            <td>
                              {p.barcode ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button className="btn-receipt" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedPass({ ...p, eventId: reg.eventId, eventName: reg.eventName, teamId: reg.teamId, venue: reg.venue || reg.eventVenue || (reg.rawEventData && reg.rawEventData.venue) })}>
                                    <i className="bi bi-upc-scan"></i> View Pass
                                  </button>
                                  {p.attended && (
                                    <span style={{ color: '#22c55e', fontSize: '1rem' }} title="Verified">
                                      <i className="bi bi-check-circle-fill"></i>
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Pass</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No specific participant list attached.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payments Data & Receipts Tab */}
      {!loading && activeTab === 'payments' && (
        <div className="payment-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: '700' }}>Payment Transactions & Razorpay Data</h3>
          {registrations.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-cash-stack"></i>
              <h4>No Payment History Available</h4>
              <p>Completed Razorpay transaction records will appear here.</p>
            </div>
          ) : (
            <div className="table-custom-wrapper">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Event Name</th>
                    <th>Razorpay Payment ID</th>
                    <th>Razorpay Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr key={reg._id || idx}>
                      <td>{reg.paidAt ? new Date(reg.paidAt).toLocaleString('en-IN') : 'N/A'}</td>
                      <td style={{ fontWeight: '600' }}>{reg.eventName || 'Event Registration'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{reg.razorpayPaymentId || 'N/A'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{reg.razorpayOrderId || 'N/A'}</td>
                      <td style={{ fontWeight: '700', color: '#28a745' }}>₹{reg.amountRupees || reg.amount}</td>
                      <td>
                        <span className="tag-paid">
                          <i className="bi bi-check-circle-fill"></i> {reg.paymentStatus || 'PAID'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-receipt" onClick={() => setSelectedReceipt(reg)}>
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
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="receipt-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', textAlign: 'center', position: 'relative', padding: '1.5rem', background: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '12px' }}>
              <button 
                onClick={async () => {
                  const passElement = document.getElementById('event-pass-card');
                  if (passElement) {
                    try {
                      const html2canvas = (await import('html2canvas')).default;
                      const canvas = await html2canvas(passElement, {
                        scale: 3,
                        useCORS: true,
                        backgroundColor: null,
                        onclone: (clonedDoc) => {
                          const clonedCard = clonedDoc.getElementById('event-pass-card');
                          if (clonedCard) {
                            clonedCard.style.transform = 'none';
                          }
                        }
                      });
                      const dataUrl = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `${selectedPass.eventName}_Pass_${selectedPass.roll}.png`;
                      link.href = dataUrl;
                      link.click();
                    } catch (err) {
                      console.error('Failed to download pass:', err);
                    }
                  }
                }}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#2563eb', transition: 'all 0.2s' }}
                title="Download Pass"
              >
                <i className="bi bi-download"></i>
              </button>
              <button 
                onClick={() => setSelectedPass(null)}
                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}
                title="Close Pass"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="receipt-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: '0', fontWeight: '700', color: '#0f172a' }}>Event Pass Preview</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>This pass is generated for your event entry.</p>
            </div>

            {/* The Pass Card container (5in x 2in) scaled up for display preview */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
              <div
                id="event-pass-card"
                style={{
                  width: '720px',
                  height: '460px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: 'border-box',
                  display: 'flex',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                }}
              >
                {/* Background Details (Right Side) */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 100% 0%, rgba(25, 59, 104, 0.05) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(25, 59, 104, 0.08) 0%, transparent 30%)' }}></div>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: '#0a1931', transform: 'rotate(45deg)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '280px', height: '280px', background: '#0a1931', transform: 'rotate(45deg)', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', border: '2px solid #cfa144', transform: 'rotate(45deg)', zIndex: 1 }}></div>

                {/* Left Side (Dark Blue) */}
                <div style={{
                  position: 'relative',
                  width: '260px',
                  height: '100%',
                  background: '#0a1931',
                  clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px 20px',
                  boxSizing: 'border-box',
                  color: 'white'
                }}>
                  {/* Logo Area */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '8px' }}>
                    <div style={{ width: '50px', height: '50px', background: 'transparent' }}><GoldLogo /></div>
                    <div style={{ lineHeight: '1.2' }}>
                      <div style={{ color: '#cfa144', fontSize: '18px', fontWeight: '800', letterSpacing: '1px' }}>ADITYA</div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}>UNIVERSITY</div>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, paddingRight: '20px' }}>
                    <div style={{ border: '1px solid #cfa144', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#0a1931' }}>
                      <div style={{ color: '#cfa144', fontSize: '20px' }}><i className="bi bi-people-fill"></i></div>
                      <div>
                        <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600', letterSpacing: '1px' }}>TEAM ID</div>
                        <div style={{ fontSize: '12px', color: '#cfa144', fontWeight: '700', marginTop: '2px' }}>{selectedPass.teamId || `VD26-${Math.floor(Math.random()*1000000000)}`}</div>
                      </div>
                    </div>

                    <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ color: '#cfa144', fontSize: '18px', border: '1px solid #cfa144', borderRadius: '6px', padding: '6px' }}><i className="bi bi-calendar-event"></i></div>
                         <div>
                           <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600', letterSpacing: '1px' }}>EVENT DATE</div>
                           <div style={{ fontSize: '14px', color: '#cfa144', fontWeight: '700', marginTop: '2px' }}>SEP 15, 2026</div>
                         </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                       <div style={{ color: '#cfa144', fontSize: '18px', border: '1px solid #cfa144', borderRadius: '6px', padding: '6px', height: 'max-content' }}><i className="bi bi-geo-alt-fill"></i></div>
                       <div>
                         <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: '600', letterSpacing: '1px' }}>VENUE</div>
                         <div style={{ fontSize: '11px', color: '#cfa144', fontWeight: '600', lineHeight: '1.4', marginTop: '4px' }}>
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
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Photo */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', paddingRight: '20px' }}>
                    <div style={{
                      width: '110px',
                      height: '140px',
                      border: '3px solid #cfa144',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}>
                      {selectedPass.photoUrl ? (
                        <img src={selectedPass.photoUrl} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '6px',
                          background: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="bi bi-person-fill" style={{ fontSize: '48px', color: '#94a3b8' }}></i>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gold Separator Line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '264px',
                  background: '#cfa144',
                  clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                  zIndex: 1
                }}></div>

                {/* Right Side (White Content) */}
                <div style={{
                  flex: 1,
                  padding: '30px 40px 30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  zIndex: 2,
                  boxSizing: 'border-box'
                }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ color: '#0a1931', fontSize: '42px', fontWeight: '800', lineHeight: '1', display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
                      VEDA <span style={{ color: '#cfa144' }}>2K26</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
                      <div style={{ height: '1px', background: '#cfa144', width: '80px' }}></div>
                      <div style={{ color: '#0a1931', fontSize: '15px', fontWeight: '700', letterSpacing: '4px' }}>EVENT PASS</div>
                      <div style={{ height: '1px', background: '#cfa144', width: '80px' }}></div>
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', alignItems: 'center' }}>
                    <div style={{ height: '2px', background: '#cfa144', width: '50px' }}></div>
                    <div style={{
                      background: '#0a1931',
                      color: '#ffffff',
                      padding: '10px 36px',
                      fontSize: '20px',
                      fontWeight: '700',
                      clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0 50%)',
                      margin: '0 12px'
                    }}>
                      {selectedPass.eventName}
                    </div>
                    <div style={{ height: '2px', background: '#cfa144', width: '50px' }}></div>
                  </div>

                  {/* Details List */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '10px', paddingRight: '10px' }}>
                    {[
                      { icon: 'person-fill', label: 'Name', value: selectedPass.name },
                      { icon: 'person-vcard-fill', label: 'Roll', value: selectedPass.roll },
                      { icon: 'mortarboard-fill', label: 'College', value: selectedPass.college === 'Other College' ? selectedPass.otherCollege : selectedPass.college },
                      { icon: 'telephone-fill', label: 'Phone', value: selectedPass.mobile || 'N/A' }
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px dashed #cbd5e1'
                      }}>
                        <div style={{ 
                          width: '36px', height: '36px', 
                          background: '#0a1931', color: 'white', 
                          borderRadius: '8px', 
                          display: 'flex', justifyContent: 'center', alignItems: 'center', 
                          marginRight: '20px' 
                        }}>
                          <i className={`bi bi-${item.icon}`} style={{ fontSize: '18px' }}></i>
                        </div>
                        <div style={{ width: '80px', color: '#0a1931', fontWeight: '700', fontSize: '18px' }}>{item.label}</div>
                        <div style={{ color: '#cfa144', fontWeight: '400', marginRight: '20px', fontSize: '20px' }}>|</div>
                        <div style={{ color: '#0f172a', fontWeight: '700', flex: 1, fontSize: '17px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Barcode */}
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '12px 24px', borderRadius: '12px', border: '1px solid #cfa144' }}>
                      <Barcode
                        value={selectedPass.barcode || '128B237E'}
                        width={2.5}
                        height={55}
                        fontSize={16}
                        margin={0}
                        displayValue={true}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}
