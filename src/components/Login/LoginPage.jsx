import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const colleges = ['Choose...', 'Aditya University', 'ACET', 'Other College'];
const genders = ['Select', 'Male', 'Female', 'Other'];

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    college: 'Choose...',
    otherCollege: '',
    roll: '',
    branch: '',
    gender: 'Select',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [studentLookupStatus, setStudentLookupStatus] = useState(''); // 'found', 'not_found', 'error', ''
  const [disabledFields, setDisabledFields] = useState({
    name: false,
    email: false,
    mobile: false,
    gender: false,
    college: false,
    branch: false
  });

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const studentStr = localStorage.getItem('eventStudent');
    if (studentStr) {
      navigate('/dashboard');
    }
  }, []);

  const fetchStudentData = async (rollNo) => {
    const cleanRoll = (rollNo || '').trim().toUpperCase();
    if (!cleanRoll || cleanRoll.length < 5) {
      setStudentLookupStatus('');
      setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false, branch: false });
      return;
    }

    setFetchingStudent(true);
    try {
      const candidates = [cleanRoll];
      if (cleanRoll.length === 10) {
        if (cleanRoll.slice(2, 4) === '39') {
          candidates.push(cleanRoll.slice(0, 2) + 'A9' + cleanRoll.slice(4));
        } else if (cleanRoll.slice(2, 4) === 'A9') {
          candidates.push(cleanRoll.slice(0, 2) + '39' + cleanRoll.slice(4));
        }
      }

      let data = null;

      for (const targetRoll of candidates) {
        // Tier 1: Try Backend Proxy (/api/event-students/studentdata/:roll)
        try {
          const proxyUrl = import.meta.env.VITE_API_BASE_URL
            ? `${import.meta.env.VITE_API_BASE_URL}/api/event-students/studentdata/${encodeURIComponent(targetRoll)}`
            : `/api/event-students/studentdata/${encodeURIComponent(targetRoll)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
              data = json;
              break;
            }
          }
        } catch (err) {
          console.warn('Backend proxy fetch failed:', err);
        }

        // Tier 2: Try Vite Dev Proxy (/adityaapi/api/studentdata/:roll)
        if (!Array.isArray(data) || data.length === 0 || data[0]?.error) {
          try {
            const res = await fetch(`/adityaapi/api/studentdata/${encodeURIComponent(targetRoll)}`);
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
                data = json;
                break;
              }
            }
          } catch (err) {
            console.warn('Vite proxy fetch failed:', err);
          }
        }

        // Tier 3: Direct API URL from env
        if (!Array.isArray(data) || data.length === 0 || data[0]?.error) {
          try {
            const envUrl = import.meta.env.VITE_STUDENT_DATA_URL || 'https://info.aec.edu.in/adityaapi/api/studentdata';
            const cleanEnvUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
            const res = await fetch(`${cleanEnvUrl}/${encodeURIComponent(targetRoll)}`);
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
                data = json;
                break;
              }
            }
          } catch (err) {
            console.warn('Direct env URL fetch failed:', err);
          }
        }
      }

      if (Array.isArray(data) && data.length > 0 && !data[0].error && data[0].studentname) {
        const info = data[0];
        const updatedFields = {};
        const newDisabled = { name: false, email: false, mobile: false, gender: false, college: false, branch: false };

        if (info.studentname) {
          updatedFields.name = info.studentname;
          newDisabled.name = true;
        }

        if (info.emailid) {
          updatedFields.email = info.emailid.toLowerCase();
          newDisabled.email = true;
        }

        const mob = info.mobilenumber || info.fathermobilenumber || info.mothermobilenumber;
        if (mob) {
          updatedFields.mobile = mob;
          newDisabled.mobile = true;
        }

        if (info.gender) {
          const rawGender = info.gender.trim().toLowerCase();
          let matchedGender = 'Male';
          if (rawGender.startsWith('f')) matchedGender = 'Female';
          else if (rawGender.startsWith('m')) matchedGender = 'Male';
          else matchedGender = 'Other';
          updatedFields.gender = matchedGender;
          newDisabled.gender = true;
        }

        updatedFields.college = 'Aditya University';
        newDisabled.college = true;

        if (info.branch) {
          updatedFields.branch = info.branch;
          newDisabled.branch = true;
        }

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
        setDisabledFields(newDisabled);
        setStudentLookupStatus('found');
      } else {
        setStudentLookupStatus('not_found');
        setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false, branch: false });
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setStudentLookupStatus('error');
      setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false, branch: false });
    } finally {
      setFetchingStudent(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.roll && form.roll.trim().length >= 6) {
        fetchStudentData(form.roll);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.roll]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const validateRegister = () => {
    const err = {};
    if (!form.name) err.name = 'Please provide a valid name.';
    if (!form.college || form.college === 'Choose...') err.college = 'Please select a valid College.';
    if (!form.roll) err.roll = 'Please provide Roll Number.';
    if (!form.branch) err.branch = 'Please provide a valid Branch.';
    if (!form.gender || form.gender === 'Select') err.gender = 'Please select a Gender.';
    if (!form.mobile) err.mobile = 'Please provide a valid Number.';
    if (!form.email) err.email = 'Please provide a valid Email.';
    if (!form.password) err.password = 'Please provide a Password.';
    if (!form.confirmPassword) {
      err.confirmPassword = 'Please confirm your Password.';
    } else if (form.password !== form.confirmPassword) {
      err.confirmPassword = 'Passwords do not match.';
    }
    if (form.college === 'Other College' && !form.otherCollege) err.otherCollege = 'Please provide the other college name.';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/event-students/register` : '/api/event-students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Auto switch to login with email filled
      setIsLogin(true);
      setLoginForm({ email: form.email, password: '' });
      setErrors({ login: 'Registration successful! Please login with your password.' });
      toast.success('Registration successful! Please login with your password.');
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setErrors({ login: 'Please enter email and password' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/event-students/login` : '/api/event-students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      // Save student
      localStorage.setItem('eventStudent', JSON.stringify(data.student));
      window.dispatchEvent(new Event('studentLoggedIn'));
      toast.success('Logged in successfully!');

      // Handle redirect back if there was one
      const redirect = sessionStorage.getItem('authRedirect');
      if (redirect) {
        sessionStorage.removeItem('authRedirect');
        // Clean hash prefix if present, e.g. #dashboard to /dashboard
        const cleanedPath = redirect.startsWith('#') ? redirect.substring(1) : redirect;
        navigate(cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-premium" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <style>{`
        .login-switch-btn {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: none;
          padding: 0;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        .login-switch-btn:hover {
          opacity: 0.8;
          text-decoration: none;
        }
      `}</style>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: isLogin ? '520px' : '850px',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(20px)',
        transition: 'max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px', textAlign: 'center', fontWeight: '700', fontSize: '2rem', color: 'var(--text-light)' }}>
          {isLogin ? 'Student Login' : 'Student Registration'}
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '32px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {isLogin ? 'Please log in to manage registrations and view receipts' : 'Create your profile seamlessly using the Sign Up/Login link at the top right, and get ready to participate in an array of technical and non-technical events.'}
        </p>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.login && (
              <div style={{
                color: errors.login.includes('successful') ? '#10b981' : '#dc3545',
                fontSize: '0.85rem',
                textAlign: 'center',
                background: errors.login.includes('successful') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                padding: '10px',
                borderRadius: '8px'
              }}>
                {errors.login}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                className="login-switch-btn"
              >
                Need to Sign Up?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-admissions"
                style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600' }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} noValidate className="row g-4">

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Roll Number</label>
                {fetchingStudent && <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}><i className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }}></i> Checking DB...</span>}
              </div>
              <input
                name="roll"
                value={form.roll}
                onChange={handleChange}
                placeholder="Enter Roll Number (e.g. 22A91A0501)"
                style={{ padding: '12px 16px', border: studentLookupStatus === 'found' ? '1px solid #28a745' : '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {studentLookupStatus === 'found' && (
                <div style={{ color: '#28a745', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="bi bi-patch-check-fill"></i> Student record verified & auto-filled
                </div>
              )}
              {errors.roll && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.roll}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Full Name</label>
                {disabledFields.name && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                readOnly={disabledFields.name}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.name ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.name ? 'not-allowed' : 'text',
                  opacity: disabledFields.name ? 0.85 : 1
                }}
                required
              />
              {errors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.name}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Branch</label>
                {disabledFields.branch && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="branch"
                value={form.branch}
                onChange={handleChange}
                readOnly={disabledFields.branch}
                placeholder="e.g. CSE, ECE, MECH"
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.branch ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.branch ? 'not-allowed' : 'text',
                  opacity: disabledFields.branch ? 0.85 : 1
                }}
                required
              />
              {errors.branch && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.branch}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Email Address</label>
                {disabledFields.email && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={disabledFields.email}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.email ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.email ? 'not-allowed' : 'text',
                  opacity: disabledFields.email ? 0.85 : 1
                }}
                required
              />
              {errors.email && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.email}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>College</label>
                {disabledFields.college && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <select
                name="college"
                value={form.college}
                onChange={handleChange}
                disabled={disabledFields.college}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.college ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.college ? 'not-allowed' : 'pointer',
                  opacity: disabledFields.college ? 0.85 : 1
                }}
                required
              >
                {colleges.map(c => <option key={c} value={c} style={{ background: 'var(--bg-dark)' }}>{c}</option>)}
              </select>
              {errors.college && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.college}</div>}
            </div>

            {form.college === 'Other College' && (
              <div className="col-md-6 col-12 d-flex flex-column gap-2">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Other College Name</label>
                <input
                  name="otherCollege"
                  value={form.otherCollege}
                  onChange={handleChange}
                  style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                  required
                />
                {errors.otherCollege && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.otherCollege}</div>}
              </div>
            )}

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Gender</label>
                {disabledFields.gender && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={disabledFields.gender}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.gender ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.gender ? 'not-allowed' : 'pointer',
                  opacity: disabledFields.gender ? 0.85 : 1
                }}
                required
              >
                {genders.map(g => <option key={g} value={g} style={{ background: 'var(--bg-dark)' }}>{g}</option>)}
              </select>
              {errors.gender && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.gender}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Mobile Number</label>
                {disabledFields.mobile && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                readOnly={disabledFields.mobile}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: disabledFields.mobile ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-dark)',
                  color: 'var(--text-light)',
                  fontSize: '0.95rem',
                  width: '100%',
                  cursor: disabledFields.mobile ? 'not-allowed' : 'text',
                  opacity: disabledFields.mobile ? 0.85 : 1
                }}
                required
              />
              {errors.mobile && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.mobile}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {errors.password && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.password}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {errors.confirmPassword && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.confirmPassword}</div>}
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                className="login-switch-btn"
              >
                Already Signed Up? Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-admissions"
                style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600' }}
              >
                {loading ? 'Submitting...' : 'Sign Up'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
