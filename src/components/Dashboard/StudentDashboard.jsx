import React, { useState, useEffect } from 'react';
import StudentRegistrationPopup from '../Events/StudentRegistrationPopup';
import Barcode from 'react-barcode';
import GoldLogo from '../SDGs/GoldLogo';
import './StudentDashboard.css';

export default function StudentDashboard({ onNavigate }) {
  const [student, setStudent] = useState(null);
  // showLoginModal state removed
  const [activeTab, setActiveTab] = useState('overview');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    college: '',
    otherCollege: '',
    roll: '',
    gender: '',
    mobile: '',
    email: ''
  });

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
              const venue = item.venue || item.location || item.venueLocation || '';
              if (name && venue) {
                venueMap[name.toLowerCase().trim()] = venue;
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
          window.location.hash = 'login';
        }
      } else {
        setStudent(null);
        window.location.hash = 'login';
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


  // Helper calculation for total amount paid
  const totalAmountPaid = registrations.reduce((sum, reg) => {
    return sum + (reg.amountRupees || reg.amount || 0);
  }, 0);

  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.college || !editForm.roll || !editForm.gender || !editForm.mobile || !editForm.email) {
      alert('Please fill in all required fields');
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
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message);
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
      {/* Student Profile Header Card */}
      <div className="dashboard-header-card">
        <div className="user-profile-summary">
          <div className="user-avatar">{getInitials(student.name)}</div>
          <div className="user-info-meta">
            <h2>{student.name}</h2>
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

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="bi bi-grid-fill"></i> Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="bi bi-person-badge-fill"></i> Student Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <i className="bi bi-people-fill"></i> Registered Events & Participants ({registrations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <i className="bi bi-receipt-cutoff"></i> Payment Data & Receipts
        </button>
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

      {/* Overview Tab Content */}
      {!loading && activeTab === 'overview' && (
        <div>
          <div className="profile-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: '700' }}>
              Welcome back, {student.name}!
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Here is a quick snapshot of your event registrations, participant details, and payment histories for VEDA 2026.
            </p>
          </div>

          <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-light)' }}>
            Recent Registered Events
          </h4>
          {registrations.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-calendar-x"></i>
              <h4>No Event Registrations Found</h4>
              <p>You haven't registered for any events yet.</p>
              <button
                className="btn-admissions"
                style={{ background: '#007bff', color: '#fff', border: 'none', marginTop: '1rem' }}
                onClick={() => {
                  if (onNavigate) onNavigate('events');
                  else window.location.hash = '#events';
                }}
              >
                Browse Events
              </button>
            </div>
          ) : (
            registrations.slice(0, 2).map((reg) => (
              <div key={reg._id || reg.razorpayPaymentId} className="event-reg-card">
                <div className="event-reg-header">
                  <div className="event-title-meta">
                    <h3>{reg.eventName || 'Event Registration'}</h3>
                    <div className="event-sub-info">
                      {reg.schoolId && <span className="tag-school">Group : {reg.schoolId}</span>}
                      {reg.category && <span className="tag-category">Category : {reg.category}</span>}
                      <span><i className="bi bi-people"></i> Team Size: {reg.teamSize}</span>
                      <span><i className="bi bi-clock-history"></i> {reg.paidAt ? new Date(reg.paidAt).toLocaleDateString('en-IN') : 'Completed'}</span>
                    </div>
                  </div>
                  <span className="tag-paid">
                    <i className="bi bi-check-circle-fill"></i> {reg.paymentStatus || 'PAID'} (₹{reg.amountRupees || reg.amount})
                  </span>
                </div>

                <div className="participants-section-title">
                  <i className="bi bi-person-lines-fill"></i> Registered Participants ({reg.participants?.length || 0})
                </div>

                <div className="table-custom-wrapper">
                  <table className="table-custom">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>College</th>
                        <th>Department</th>
                        <th>Mobile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reg.participants && reg.participants.map((p, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: '600' }}>{p.name || 'N/A'}</td>
                          <td>{p.roll || 'N/A'}</td>
                          <td>{p.college === 'Other College' ? p.otherCollege : (p.college || 'N/A')}</td>
                          <td>{p.department || 'N/A'}</td>
                          <td>{p.mobile || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Student Profile Tab */}
      {!loading && activeTab === 'profile' && (
        <div className="profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: '700' }}>Student Profile Details</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
                Your personal and academic account details
              </p>
            </div>
            {!isEditingProfile ? (
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
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--glass-border)', background: 'var(--glass)' }}
                  onClick={() => setIsEditingProfile(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="profile-grid" style={{ marginTop: '1.5rem' }}>
              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Roll Number</label>
                <input
                  type="text"
                  value={editForm.roll}
                  onChange={(e) => setEditForm({ ...editForm, roll: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>College</label>
                <select
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                >
                  <option value="Aditya University">Aditya University</option>
                  <option value="ACET">ACET</option>
                  <option value="Other College">Other College</option>
                </select>
              </div>

              {editForm.college === 'Other College' && (
                <div className="profile-field-group">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Other College Name</label>
                  <input
                    type="text"
                    value={editForm.otherCollege}
                    onChange={(e) => setEditForm({ ...editForm, otherCollege: e.target.value })}
                    style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                    required
                  />
                </div>
              )}

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Mobile Number</label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Gender</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'var(--bg-dark)', color: 'var(--text-light)', width: '100%', fontSize: '0.9rem' }}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div className="profile-field-group">
                <label>Full Name</label>
                <div className="value">{student.name}</div>
              </div>

              <div className="profile-field-group">
                <label>Roll Number</label>
                <div className="value">{student.roll}</div>
              </div>

              <div className="profile-field-group">
                <label>College</label>
                <div className="value">{student.college === 'Other College' ? student.otherCollege : student.college}</div>
              </div>

              <div className="profile-field-group">
                <label>Email Address</label>
                <div className="value">{student.email}</div>
              </div>

              <div className="profile-field-group">
                <label>Mobile Number</label>
                <div className="value">{student.mobile}</div>
              </div>

              <div className="profile-field-group">
                <label>Gender</label>
                <div className="value">{student.gender}</div>
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
                                <button className="btn-receipt" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedPass({ ...p, eventName: reg.eventName, venue: reg.venue || reg.eventVenue || (reg.rawEventData && reg.rawEventData.venue) })}>
                                  <i className="bi bi-upc-scan"></i> View Pass
                                </button>
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
            <div className="receipt-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: '0', fontWeight: '700', color: '#0f172a' }}>Event Pass Preview</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>This pass is generated for your event entry.</p>
            </div>

            {/* The Pass Card container (5in x 2in) scaled up for display preview */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0', height: '2.4in' }}>
              <div
                id="event-pass-card"
                style={{
                  width: '5in',
                  height: '2in',
                  transform: 'scale(1.3)',
                  transformOrigin: 'center',
                  color: '#1a202c',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  padding: '0.1in 0.15in 0in 0.15in',
                  boxSizing: 'border-box',
                  fontFamily: "'Stem', sans-serif",
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'left'
                }}
              >
                {/* SVG Ticket Shape Background (White fill, Orange borders, transparent cutouts) */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 480 192"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none'
                  }}
                >
                  <defs>
                    <clipPath id="ticket-clip">
                      <path d="M 10 0 L 480 0 L 473 6 L 480 12 L 473 18 L 480 24 L 473 30 L 480 36 L 473 42 L 480 48 L 473 54 L 480 60 L 473 66 L 480 72 L 473 78 L 480 84 L 473 90 L 480 96 L 473 102 L 480 108 L 473 114 L 480 120 L 473 126 L 480 132 L 473 138 L 480 144 L 473 150 L 480 156 L 473 162 L 480 168 L 473 174 L 480 180 L 473 186 L 480 192 L 10 192 A 10 10 0 0 0 0 182 L 0 104 A 8 8 0 0 0 0 88 L 0 10 A 10 10 0 0 0 10 0 Z" />
                    </clipPath>
                  </defs>

                  {/* White background shape */}
                  <path
                    d="M 10 0 L 480 0 L 473 6 L 480 12 L 473 18 L 480 24 L 473 30 L 480 36 L 473 42 L 480 48 L 473 54 L 480 60 L 473 66 L 480 72 L 473 78 L 480 84 L 473 90 L 480 96 L 473 102 L 480 108 L 473 114 L 480 120 L 473 126 L 480 132 L 473 138 L 480 144 L 473 150 L 480 156 L 473 162 L 480 168 L 473 174 L 480 180 L 473 186 L 480 192 L 10 192 A 10 10 0 0 0 0 182 L 0 104 A 8 8 0 0 0 0 88 L 0 10 A 10 10 0 0 0 10 0 Z"
                    fill="#ffffff"
                  />

                  {/* Footer light-grey background shape, clipped to the ticket bounds */}
                  <rect x="0" y="162" width="480" height="30" fill="#f8fafc" clipPath="url(#ticket-clip)" />
                  <line x1="0" y1="162" x2="480" y2="162" stroke="#e2e8f0" strokeWidth="1" clipPath="url(#ticket-clip)" />

                  {/* Orange border path outline */}
                  <path
                    d="M 10 0 L 480 0 L 473 6 L 480 12 L 473 18 L 480 24 L 473 30 L 480 36 L 473 42 L 480 48 L 473 54 L 480 60 L 473 66 L 480 72 L 473 78 L 480 84 L 473 90 L 480 96 L 473 102 L 480 108 L 473 114 L 480 120 L 473 126 L 480 132 L 473 138 L 480 144 L 473 150 L 480 156 L 473 162 L 480 168 L 473 174 L 480 180 L 473 186 L 480 192 L 10 192 A 10 10 0 0 0 0 182 L 0 104 A 8 8 0 0 0 0 88 L 0 10 A 10 10 0 0 0 10 0 Z"
                    fill="none"
                    stroke="#fd7e14"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Subtle tech grid/gradient overlay background */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(253, 126, 20, 0.07) 0%, rgba(255, 255, 255, 0) 70%)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }} />

                {/* Gold Logo Watermark centered and fitting pass height */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '192px',
                  height: '192px',
                  opacity: 0.12,
                  pointerEvents: 'none',
                  zIndex: 1
                }}>
                  <GoldLogo />
                </div>

                {/* Row 1: Centered Event & Pass Header (Full Width) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  width: '100%',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#fd7e14',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    lineHeight: '1.1'
                  }}>
                    VEDA 2026 EVENT PASS
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#0f172a',
                    marginTop: '1px',
                    lineHeight: '1.1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '4.6in',
                    textTransform: 'uppercase'
                  }}>
                    {selectedPass.eventName}
                  </div>

                  {/* Designer HR Line */}
                  <div style={{
                    width: '58%',
                    height: '1px',
                    background: 'linear-gradient(to right, rgba(253, 126, 20, 0) 0%, rgba(253, 126, 20, 0.4) 15%, rgba(253, 126, 20, 0.4) 85%, rgba(253, 126, 20, 0) 100%)',
                    margin: '4px 0 2px 0',
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'flex-start'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#fd7e14',
                      position: 'absolute'
                    }} />
                  </div>
                </div>

                {/* Row 2: Bottom Details (60/40 Split with Vertical Separator) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  position: 'relative',
                  zIndex: 2,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                  boxSizing: 'border-box'
                }}>
                  {/* Left Side: Photo & Details (60% width) */}
                  <div style={{
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    paddingRight: '4px'
                  }}>
                    {/* Profile Photo */}
                    <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedPass.photoUrl ? (
                        <img
                          src={selectedPass.photoUrl}
                          alt="Student"
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1',
                            background: '#f8f9fa'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#94a3b8" />
                            <path d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#94a3b8" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Student Details Text */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1e293b',
                        lineHeight: '1.1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>
                        {selectedPass.name}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#475569',
                        marginTop: '2px',
                        lineHeight: '1.1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>
                        Roll: {selectedPass.roll} | {selectedPass.college === 'Other College' ? selectedPass.otherCollege : selectedPass.college}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#64748b',
                        marginTop: '2px',
                        lineHeight: '1.1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                      }}>
                        Mobile: {selectedPass.mobile || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Separator Line */}
                  <div style={{
                    width: '0px',
                    height: '52px',
                    borderLeft: '1.5px dashed #cbd5e1',
                    margin: '0 8px',
                    flexShrink: 0,
                    zIndex: 2
                  }} />

                  {/* Right Side: Barcode (40% width, rotated vertically) */}
                  <div style={{
                    width: '40%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    boxSizing: 'border-box',
                    paddingRight: '6px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      boxSizing: 'border-box',
                      marginRight: '-32px'
                    }}>
                      <Barcode
                        value={selectedPass.barcode}
                        width={1.05}
                        height={48}
                        fontSize={8}
                        margin={2}
                        displayValue={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Full Width Venue Details Footer */}
                <div style={{
                  position: 'relative',
                  margin: '0 -0.15in 0 -0.15in',
                  padding: '6px 0.15in',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  marginTop: 'auto',
                  background: 'none',
                  borderTop: 'none'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px', flexShrink: 0, marginTop: '1px', alignSelf: 'flex-start' }}>
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#ef4444" />
                  </svg>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    maxWidth: '4.4in',
                    wordBreak: 'break-word'
                  }}>
                    Venue: {
                      (() => {
                        const lookupKey = (selectedPass.eventName || '').toLowerCase().trim();
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
                        return selectedPass.venue || eventVenues[lookupKey] || SUB_EVENT_VENUES_FALLBACK[lookupKey] || 'Main Campus Blocks';
                      })()
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="receipt-actions" style={{ justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn-receipt"
                style={{ background: '#28a745', color: '#ffffff', border: 'none', flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: '600' }}
                onClick={async () => {
                  const passElement = document.getElementById('event-pass-card');
                  if (passElement) {
                    try {
                      const html2canvas = (await import('html2canvas')).default;
                      const canvas = await html2canvas(passElement, {
                        scale: 3, // High scale for crisp text and scannable barcode
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
              >
                <i className="bi bi-download"></i> Download
              </button>
              <button
                className="btn-receipt"
                style={{ background: '#007bff', color: '#ffffff', border: 'none', flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: '600' }}
                onClick={() => setSelectedPass(null)}
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
