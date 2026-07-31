import React, { useState, useEffect } from 'react';
import StudentRegistrationPopup from '../Events/StudentRegistrationPopup';
import Barcode from 'react-barcode';
import './StudentDashboard.css';

export default function StudentDashboard({ onNavigate }) {
  const [student, setStudent] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPass, setSelectedPass] = useState(null);

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
        }
      } else {
        setStudent(null);
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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('eventStudent');
    window.dispatchEvent(new Event('studentLoggedIn'));
    setStudent(null);
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = '';
    }
  };

  // Helper calculation for total amount paid
  const totalAmountPaid = registrations.reduce((sum, reg) => {
    return sum + (reg.amountRupees || reg.amount || 0);
  }, 0);

  if (!student) {
    return (
      <div className="container-premium dashboard-container">
        <div className="empty-state">
          <i className="bi bi-person-lock"></i>
          <h2>Student Portal Login Required</h2>
          <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem auto' }}>
            Please log in or register to access your profile, registered events, team participant details, and payment receipts.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="btn-admissions"
              style={{ background: '#007bff', color: '#fff', border: 'none' }}
              onClick={() => setShowLoginModal(true)}
            >
              Login / Register Now
            </button>
          </div>
        </div>

        {showLoginModal && (
          <StudentRegistrationPopup
            onClose={() => setShowLoginModal(false)}
            onSuccess={(loggedStudent) => {
              localStorage.setItem('eventStudent', JSON.stringify(loggedStudent));
              window.dispatchEvent(new Event('studentLoggedIn'));
              setStudent(loggedStudent);
              setShowLoginModal(false);
            }}
          />
        )}
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
          <div className="dashboard-header-actions">
            <button className="btn-logout" onClick={handleLogout} title="Logout of Student Account">
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
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
            <button className="btn-logout" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Logout Account
            </button>
          </div>

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
                                <button className="btn-receipt" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedPass({ ...p, eventName: reg.eventName })}>
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
          <div id="pass-modal-content" className="receipt-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', position: 'relative' }}>
            <div className="receipt-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#007bff' }}>
                VEDA 2026 EVENT PASS
              </div>
              <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{selectedPass.eventName}</h2>
            </div>
            
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '12px', margin: '1rem 0' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{selectedPass.name}</h3>
              <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#555' }}>Roll: {selectedPass.roll}</p>
              <p style={{ margin: '0', fontSize: '0.9rem', color: '#555' }}>
                {selectedPass.college === 'Other College' ? selectedPass.otherCollege : selectedPass.college}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0' }}>
              <Barcode value={selectedPass.barcode} width={2} height={80} displayValue={true} />
            </div>

            <div className="receipt-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button
                className="btn-receipt"
                style={{ background: '#28a745', color: '#ffffff', border: 'none', flex: 1 }}
                onClick={async () => {
                  const passElement = document.getElementById('pass-modal-content');
                  if (passElement) {
                    const actionsDiv = passElement.querySelector('.receipt-actions');
                    if (actionsDiv) actionsDiv.style.display = 'none';
                    try {
                      const html2canvas = (await import('html2canvas')).default;
                      const canvas = await html2canvas(passElement, { scale: 2 });
                      const dataUrl = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `${selectedPass.eventName}_Pass_${selectedPass.roll}.png`;
                      link.href = dataUrl;
                      link.click();
                    } catch (err) {
                      console.error('Failed to download pass:', err);
                    } finally {
                      if (actionsDiv) actionsDiv.style.display = 'flex';
                    }
                  }
                }}
              >
                <i className="bi bi-download"></i> Download
              </button>
              <button
                className="btn-receipt"
                style={{ background: '#007bff', color: '#ffffff', border: 'none', flex: 1 }}
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
