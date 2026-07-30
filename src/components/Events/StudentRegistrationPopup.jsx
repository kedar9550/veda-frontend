import React, { useState } from 'react';
import { useDepartments } from './useDepartments';

const colleges = ['Choose...', 'Aditya University', 'ACET', 'Other College'];
const years = ['Select', '1', '2', '3', '4'];
const genders = ['Select', 'Male', 'Female', 'Other'];
const accommodations = ['Select', 'Yes', 'No'];

export default function StudentRegistrationPopup({ onClose, onSuccess }) {
  const { departments } = useDepartments();
  const [form, setForm] = useState({
    name: '',
    college: 'Choose...',
    otherCollege: '',
    roll: '',
    gender: 'Select',
    mobile: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const departmentOptions = [
    { title: 'Select', value: 'Select' },
    ...(departments && departments.length > 0
      ? departments.map((dept) => ({ title: dept.name, value: dept.name }))
      : []
    )
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (!form.name) err.name = 'Please provide a valid name.';
    if (!form.college || form.college === 'Choose...') err.college = 'Please select a valid College.';
    if (!form.roll) err.roll = 'Please provide RollNumber.';
    if (!form.gender || form.gender === 'Select') err.gender = 'Please select a Gender.';
    if (!form.mobile) err.mobile = 'Please provide a valid Number.';
    if (!form.email) err.email = 'Please provide a valid Email.';
    if (form.college === 'Other College' && !form.otherCollege) err.otherCollege = 'Please provide the other college name.';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
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
      
      // Instead of logging in automatically, switch to Login
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

  const [isLogin, setIsLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
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
      onSuccess(data.student);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflow: 'auto'
    }}>
      <div style={{
        background: '#fff', padding: '1.5rem', borderRadius: '8px', 
        width: '100%', maxWidth: '500px', maxHeight: '95vh', overflowY: 'auto',
        color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', textAlign: 'center', fontWeight: '600', fontSize: '1.5rem', color: '#333' }}>
          {isLogin ? 'Student Login' : 'Student Registration'}
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
          {isLogin ? 'Please login to continue to the event registration form.' : 'Please register to continue to the event registration form.'}
        </p>

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {errors.login && <div style={{ color: 'red', fontSize: '0.8rem', textAlign: 'center' }}>{errors.login}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Email</label>
              <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Password</label>
              <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setIsLogin(false); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Need to register?
              </button>
              <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
              {errors.name && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>College</label>
              <select name="college" value={form.college} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: '#fff' }}>
                {colleges.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.college && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.college}</div>}
            </div>

            {form.college === 'Other College' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Other College Name</label>
                <input name="otherCollege" value={form.otherCollege} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
                {errors.otherCollege && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.otherCollege}</div>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Roll Number</label>
              <input name="roll" value={form.roll} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
              {errors.roll && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.roll}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: '#fff' }}>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.gender}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Mobile</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
              {errors.mobile && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.mobile}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#444' }}>Email</label>
              <input name="email" value={form.email} onChange={handleChange} style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }} />
              {errors.email && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</div>}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setIsLogin(true); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Already registered? Login
              </button>
              <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
