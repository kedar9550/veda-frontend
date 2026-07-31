import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';

export default function StudentDashboard({ onNavigate }) {
  const [student, setStudent] = useState(null);
  // showLoginModal state removed
  const [activeTab, setActiveTab] = useState('overview');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
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
    </div>
  );
}
