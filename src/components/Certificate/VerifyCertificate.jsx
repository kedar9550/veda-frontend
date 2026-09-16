import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import watermarkLogo from '../../assets/Circle_Gold.svg';
import './VerifyCertificate.css';

export default function VerifyCertificate() {
  const { receipt, roll } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError('');

        const cleanRoll = decodeURIComponent(roll || '').trim();
        const cleanReceipt = decodeURIComponent(receipt || '').trim();

        if (!cleanRoll) {
          setError('Invalid certificate parameters: Roll number missing.');
          setLoading(false);
          return;
        }

        // Try proxy first (/api/razorpay/registrations), then direct backend URL
        const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:9022';
        const endpoints = [
          `/api/razorpay/registrations?roll=${encodeURIComponent(cleanRoll)}&paymentStatus=PAID`,
          `${backendBase}/api/razorpay/registrations?roll=${encodeURIComponent(cleanRoll)}&paymentStatus=PAID`
        ];

        let resultData = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint);
            if (res.ok) {
              resultData = await res.json();
              if (resultData && Array.isArray(resultData.payments)) {
                break;
              }
            }
          } catch (_err) {
            // try next endpoint
          }
        }

        if (!resultData || !Array.isArray(resultData.payments)) {
          setError('Failed to fetch certificate verification records. Please try again.');
          setLoading(false);
          return;
        }

        const payments = resultData.payments.filter(p => {
          const status = (p.paymentStatus || p.payment || '').toString().trim().toUpperCase();
          return status === 'PAID';
        });

        // 1. Find matching payment by receipt, teamId, or participant's barcode/roll
        let matchedPayment = payments.find(p =>
          (p.receipt && p.receipt.toLowerCase() === cleanReceipt.toLowerCase()) ||
          (p.teamId && p.teamId.toLowerCase() === cleanReceipt.toLowerCase()) ||
          (p.participants && p.participants.some(pt =>
            (pt.barcode && pt.barcode.toLowerCase() === cleanReceipt.toLowerCase()) ||
            (pt.roll && pt.roll.toLowerCase() === cleanRoll.toLowerCase())
          ))
        );

        // Fallback: if single paid payment exists for this roll
        if (!matchedPayment && payments.length > 0) {
          matchedPayment = payments[0];
        }

        if (!matchedPayment) {
          setError('Certificate not found or registration not marked as verified.');
          setLoading(false);
          return;
        }

        // 2. Find participant inside payment
        const participant = matchedPayment.participants?.find(p =>
          p.roll && p.roll.trim().toUpperCase() === cleanRoll.toUpperCase()
        ) || matchedPayment.participants?.[0];

        if (!participant) {
          setError('Participant details not found on this certificate.');
          setLoading(false);
          return;
        }

        setData({ payment: matchedPayment, participant });
      } catch (err) {
        console.error('Certificate verification error:', err);
        setError('Failed to verify certificate. Please check network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [receipt, roll]);

  if (loading) {
    return (
      <div className="verify-cert-container">
        <div className="verify-cert-state-box">
          <div className="verify-cert-spinner"></div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Verifying Certificate...
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Contacting Aditya University verification server...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="verify-cert-container">
        <div className="verify-cert-state-box">
          <div className="verify-cert-error-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginBottom: '0.5rem' }}>
            Verification Failed
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {error || 'Unable to authenticate this participation certificate.'}
          </p>
          <Link to="/" className="verify-cert-back-btn">
            <i className="bi bi-arrow-left"></i> Return to VEDA 2026 Home
          </Link>
        </div>
      </div>
    );
  }

  const { payment, participant } = data;
  const certificateId = payment.receipt || payment.teamId || participant.barcode || 'CERT';
  const photoUrl = participant.photoUrl || `https://info.aec.edu.in/adityacentral/StudentPhotos/${participant.roll}.jpg`;

  // Display otherCollege if college is 'Other College' or otherCollege is provided
  const displayCollege = (participant.college === 'Other College' && participant.otherCollege)
    ? participant.otherCollege
    : (participant.otherCollege || participant.college || 'Aditya University');

  return (
    <div className="verify-cert-container">
      {/* Background Watermark */}
      {watermarkLogo && (
        <img src={watermarkLogo} alt="Aditya University Watermark" className="verify-cert-watermark" />
      )}

      <div className="verify-cert-card">
        {/* Wavy Header Section */}
        <div className="verify-cert-header">
          <div className="verify-cert-waves">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path
                fill="#e0f2fe"
                fillOpacity="0.4"
                d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,133.3C672,139,768,181,864,186.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              />
              <path
                fill="#dcfce7"
                fillOpacity="0.8"
                d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,192C672,213,768,235,864,224C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              />
            </svg>
          </div>

          {/* Success Checkmark Circle Icon */}
          <div className="verify-cert-icon-wrapper">
            <div className="verify-cert-icon-outer">
              <div className="verify-cert-icon-mid">
                <div className="verify-cert-icon-inner">
                  <i className="bi bi-check-lg" style={{ fontSize: '1.75rem', strokeWidth: '2px' }}></i>
                </div>
              </div>
            </div>
          </div>

          <h1 className="verify-cert-title">Certificate Verified</h1>
          <p className="verify-cert-subtitle">
            This certificate is authentic and officially issued by Aditya University.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="verify-cert-body">
          {/* Inner Participant Card */}
          <div className="verify-cert-participant">
            {!imgFailed ? (
              <img
                src={photoUrl}
                alt={participant.name}
                className="verify-cert-avatar"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="verify-cert-avatar-placeholder">
                <i className="bi bi-person-fill" style={{ fontSize: '2rem' }}></i>
              </div>
            )}

            <div className="verify-cert-participant-info">
              <div className="verify-cert-tag">Participant</div>
              <h2 className="verify-cert-name" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {participant.name}
              </h2>
              <div className="verify-cert-meta">
                <div className="verify-cert-meta-item">
                  <i className="bi bi-mortarboard-fill" style={{ color: '#64748b' }}></i>
                  <span className="verify-cert-meta-roll">{participant.roll}</span>
                </div>
                <div className="verify-cert-meta-item">
                  <i className="bi bi-building" style={{ color: '#94a3b8' }}></i>
                  <span className="verify-cert-meta-college">{displayCollege}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Name Card */}
          <div className="verify-cert-detail-card" style={{ marginBottom: '1.25rem' }}>
            <div className="verify-cert-detail-icon event">
              <i className="bi bi-calendar-event"></i>
            </div>
            <div className="verify-cert-detail-content">
              <div className="verify-cert-detail-label">Event Name</div>
              <div className="verify-cert-detail-val" title={payment.eventName || payment.category}>
                {payment.eventName || payment.category || 'Technical Competition'}
              </div>
            </div>
          </div>

          {/* Certificate ID Box At Bottom */}
          <div className="verify-cert-bottom-id">
            <div className="verify-cert-bottom-id-icon">
              <i className="bi bi-qr-code"></i>
            </div>
            <div className="verify-cert-bottom-id-content">
              <div className="verify-cert-detail-label">Certificate ID</div>
              <div className="verify-cert-id-code" title={`VEDA2026-P-${certificateId}`}>
                VEDA2026-P-{certificateId}
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className="verify-cert-footer">
            <div>
              <span className="verify-cert-date-label">Verified on</span>
              <span className="verify-cert-date-val">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="verify-cert-verified-badge">
              <i className="bi bi-shield-fill-check"></i> Authentic Certificate
            </div>
          </div>
        </div>
      </div>

      {/* Return to VEDA link */}
      <Link to="/" className="verify-cert-back-btn">
        <i className="bi bi-arrow-left"></i> Return to VEDA 2026 Home
      </Link>
    </div>
  );
}
