import React, { useState } from 'react';
import { toast } from 'sonner';
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
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [studentLookupStatus, setStudentLookupStatus] = useState(''); // 'found', 'not_found', 'error', ''
  const [disabledFields, setDisabledFields] = useState({
    name: false,
    email: false,
    mobile: false,
    gender: false,
    college: false
  });

  const fetchStudentData = async (rollNo) => {
    const cleanRoll = (rollNo || '').trim().toUpperCase();
    if (!cleanRoll || cleanRoll.length < 5) {
      setStudentLookupStatus('');
      setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false });
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
        const newDisabled = { name: false, email: false, mobile: false, gender: false, college: false };

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

        setForm(prev => ({
          ...prev,
          ...updatedFields
        }));
        setDisabledFields(newDisabled);
        setStudentLookupStatus('found');
      } else {
        setStudentLookupStatus('not_found');
        setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false });
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setStudentLookupStatus('error');
      setDisabledFields({ name: false, email: false, mobile: false, gender: false, college: false });
    } finally {
      setFetchingStudent(false);
    }
  };

  React.useEffect(() => {
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
        body: JSON.stringify({
          ...form,
          roll: form.roll.trim().toUpperCase(),
          email: form.email.trim().toLowerCase()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Instead of logging in automatically, switch to Login
      setIsLogin(true);
      setLoginForm({ email: form.email.trim().toLowerCase(), password: '' });
      setErrors({ login: 'Registration successful! Please login with your password.' });
      toast.success('Registration successful! Please login with your password.');

    } catch (err) {
      console.error(err);
      toast.error(err.message);
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
        body: JSON.stringify({
          email: loginForm.email.trim().toLowerCase(),
          password: loginForm.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      toast.success('Logged in successfully!');
      onSuccess(data.student);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
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
                Need to Sign Up?
              </button>
              <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Roll Number</label>
                {fetchingStudent && <span style={{ fontSize: '0.78rem', color: '#007bff' }}><i className="spinner-border spinner-border-sm me-1" style={{ width: '12px', height: '12px' }}></i> Checking DB...</span>}
              </div>
              <input
                name="roll"
                value={form.roll}
                onChange={handleChange}
                placeholder="Enter Roll Number (e.g. 22A91A0501)"
                style={{ padding: '0.5rem', border: studentLookupStatus === 'found' ? '1px solid #28a745' : '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' }}
              />
              {studentLookupStatus === 'found' && (
                <div style={{ color: '#28a745', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="bi bi-patch-check-fill"></i> Student record verified & auto-filled
                </div>
              )}
              {errors.roll && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.roll}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Name</label>
                {disabledFields.name && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                readOnly={disabledFields.name}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: disabledFields.name ? '#f5f5f5' : '#fff', cursor: disabledFields.name ? 'not-allowed' : 'text' }}
              />
              {errors.name && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>College</label>
                {disabledFields.college && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <select
                name="college"
                value={form.college}
                onChange={handleChange}
                disabled={disabledFields.college}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: disabledFields.college ? '#f5f5f5' : '#fff', cursor: disabledFields.college ? 'not-allowed' : 'pointer' }}
              >
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Gender</label>
                {disabledFields.gender && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                disabled={disabledFields.gender}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: disabledFields.gender ? '#f5f5f5' : '#fff', cursor: disabledFields.gender ? 'not-allowed' : 'pointer' }}
              >
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.gender}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Mobile</label>
                {disabledFields.mobile && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                readOnly={disabledFields.mobile}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: disabledFields.mobile ? '#f5f5f5' : '#fff', cursor: disabledFields.mobile ? 'not-allowed' : 'text' }}
              />
              {errors.mobile && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.mobile}</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: '#444' }}>Email</label>
                {disabledFields.email && <span style={{ fontSize: '0.75rem', color: '#28a745' }}><i className="bi bi-lock-fill"></i> Auto-filled</span>}
              </div>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={disabledFields.email}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', backgroundColor: disabledFields.email ? '#f5f5f5' : '#fff', cursor: disabledFields.email ? 'not-allowed' : 'text' }}
              />
              {errors.email && <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</div>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button type="button" onClick={() => { setIsLogin(true); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Already Signed Up? Login
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
