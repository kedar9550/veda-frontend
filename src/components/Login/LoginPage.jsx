import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    gender: 'Select',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const studentStr = localStorage.getItem('eventStudent');
    if (studentStr) {
      navigate('/dashboard');
    }
  }, []);

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
    } catch (err) {
      console.error(err);
      alert(err.message);
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
      alert(err.message);
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
          {isLogin ? 'Please log in to manage registrations and view receipts' : 'Create an account to participate in events'}
        </p>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errors.login && <div style={{ color: '#dc3545', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(220, 53, 69, 0.1)', padding: '10px', borderRadius: '8px' }}>{errors.login}</div>}
            
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
                  Need to register?
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
          <form onSubmit={handleRegisterSubmit} className="row g-4">
            
            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {errors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.name}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {errors.email && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.email}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>College</label>
              <select
                name="college"
                value={form.college}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%', cursor: 'pointer' }}
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
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Roll Number</label>
              <input
                name="roll"
                value={form.roll}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
                required
              />
              {errors.roll && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.roll}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%', cursor: 'pointer' }}
                required
              >
                {genders.map(g => <option key={g} value={g} style={{ background: 'var(--bg-dark)' }}>{g}</option>)}
              </select>
              {errors.gender && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{errors.gender}</div>}
            </div>

            <div className="col-md-6 col-12 d-flex flex-column gap-2">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: 0 }}>Mobile Number</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                style={{ padding: '12px 16px', border: '1px solid var(--glass-border)', borderRadius: '10px', background: 'var(--bg-dark)', color: 'var(--text-light)', fontSize: '0.95rem', width: '100%' }}
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
                Already registered? Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-admissions"
                style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: '600' }}
              >
                {loading ? 'Submitting...' : 'Register'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
