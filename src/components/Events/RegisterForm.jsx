import React, { useState, useEffect, useMemo } from 'react';
import { useEvents } from './useEvents';
import { useDepartments } from './useDepartments';

function parseTeamSize(value) {
  if (value === undefined || value === null || value === '') {
    return { min: 1, max: 1 };
  }

  if (typeof value === 'number') {
    return { min: 1, max: Math.max(1, value) };
  }

  const str = String(value).trim();
  const rangeMatch = str.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    return {
      min: Math.max(1, Math.min(min, max)),
      max: Math.max(1, Math.max(min, max)),
    };
  }

  const exactNumber = Number(str.replace(/[^0-9]/g, ''));
  if (!Number.isNaN(exactNumber) && exactNumber > 0) {
    return { min: 1, max: exactNumber };
  }

  return { min: 1, max: 1 };
}

function buildTeamSizeOptions(teamSizeValue) {
  const { min, max } = parseTeamSize(teamSizeValue);
  return Array.from({ length: max - min + 1 }, (_, idx) => {
    const value = String(min + idx);
    return { value, label: value };
  });
}

const defaultParticipant = () => ({
  name: '',
  college: '',
  otherCollege: '',
  roll: '',
  gender: '',
  mobile: '',
  email: '',
  year: '',
  accommodation: '',
  department: '',
  location: ''
});

function createParticipants(count, existing = []) {
  const participants = [];
  for (let i = 0; i < count; i += 1) {
    participants[i] = existing[i]
      ? { ...existing[i] }
      : defaultParticipant();
  }
  return participants;
}

export default function RegisterForm({ schoolId, eventId, onCancel }) {
  const { events } = useEvents();
  const { departments, error: departmentsError } = useDepartments();
  const event = events.find(e => e.groupSlug === schoolId && e.id === eventId) || null;

  const [form, setForm] = useState({
    category: '',
    amount: '',
    eventName: '',
    teamSize: '',
    participants: createParticipants(1),
  });

  const teamSizeOptions = useMemo(
    () => buildTeamSizeOptions(event?.teamSize || event?.registrationTeamSize || '1'),
    [event?.teamSize, event?.registrationTeamSize]
  );

  useEffect(() => {
    if (!event) return;

    const defaultTeamSize = teamSizeOptions.find(opt => opt.value === event.teamSize)?.value
      || teamSizeOptions[0]?.value
      || '';

    setForm((prev) => ({
      ...prev,
      category: event.groupCategory || event.category || schoolId || '',
      amount: event.feeAmount || event.registrationFee || '',
      eventName: event.title || eventId || '',
      teamSize: prev.teamSize || defaultTeamSize,
    }));
  }, [event, schoolId, eventId, teamSizeOptions]);

  const [errors, setErrors] = useState({});
  const colleges = ['Choose...', 'Aditya University', 'ACET', 'Other College'];
  const years = ['Select', '1', '2', '3', '4'];
  const genders = ['Select', 'Male', 'Female', 'Other'];
  const accommodations = ['Select', 'Yes', 'No'];

  const departmentOptions = [
    { title: 'Select', value: '' },
    ...(departments && departments.length > 0
      ? departments.map((dept) => ({ title: dept.name, value: dept.name }))
      : []
    )
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const participants = [...prev.participants];
      participants[index] = { ...participants[index], [name]: value };
      return { ...prev, participants };
    });
  };

  const removeParticipant = (index) => {
    setForm((prev) => {
      const participants = prev.participants.filter((_, i) => i !== index);
      const newCount = Math.max(1, participants.length);
      return {
        ...prev,
        participants,
        teamSize: String(newCount),
      };
    });
  };

  useEffect(() => {
    if (!form.teamSize) return;
    const count = Number(form.teamSize) || 1;
    if (form.participants.length !== count) {
      setForm(prev => ({
        ...prev,
        participants: createParticipants(count, prev.participants),
      }));
    }
  }, [form.teamSize]);

  const validate = () => {
    const err = { participants: [] };
    form.participants.forEach((participant, idx) => {
      const pErr = {};
      if (!participant.name) pErr.name = 'Please provide a valid name.';
      if (!participant.college || participant.college === 'Choose...') pErr.college = 'Please select a valid College.';
      if (!participant.roll) pErr.roll = 'Please provide RollNumber.';
      if (!participant.gender || participant.gender === 'Select') pErr.gender = 'Please select a Gender.';
      if (!participant.mobile) pErr.mobile = 'Please provide a valid Number.';
      if (!participant.email) pErr.email = 'Please provide a valid Email.';
      if (participant.college === 'Other College' && !participant.otherCollege) pErr.otherCollege = 'Please provide the other college name.';
      if (!participant.year || participant.year === 'Select') pErr.year = 'Please select a valid Year.';
      if (!participant.accommodation || participant.accommodation === 'Select') pErr.accommodation = 'Please select a valid Accomodation.';
      if (!participant.department || participant.department === 'Select') pErr.department = 'Please select a valid Department.';
      if (!participant.location) pErr.location = 'Please provide a valid Location.';
      err.participants[idx] = pErr;
    });
    const hasErrors = err.participants.some(p => Object.keys(p).length > 0);
    setErrors(hasErrors ? err : {});
    return !hasErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // For now, just log and navigate back to event
    console.log('Registration submitted', { form, event });
    window.location.hash = `events/${schoolId}/${eventId}`;
  };

  return (
    <div className="container-premium register-page" style={{ padding: '2.5rem 0' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: '1.2rem', borderRadius: '12px', textAlign: 'center', color: '#fff', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Drop Your Details</h2>
        {departmentsError && (
          <p style={{ marginTop: '1rem', color: '#ffd700', fontSize: '0.95rem' }}>
            {departmentsError}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="register-grid">
          <label>
            Event Category
            <input name="category" value={form.category} readOnly />
          </label>
          <label>
            AMOUNT
            <input name="amount" value={form.amount} readOnly />
          </label>
          <label>
            Event Name
            <input name="eventName" value={form.eventName} readOnly />
          </label>
          <label>
            Choose Team Size
            <select name="teamSize" value={form.teamSize} onChange={handleChange}>
              {teamSizeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Enter Participant-1 Details</h3>

        <div className="participants-grid">
          {form.participants.map((participant, index) => (
            <div key={index} className="participant-block">
              <h4 style={{ width: '100%', marginBottom: '0.75rem' }}>
                Participant {index + 1}
              </h4>
              {index > 0 && (
                <button
                  type="button"
                  className="remove-participant"
                  onClick={() => removeParticipant(index)}
                  aria-label={`Remove participant ${index + 1}`}
                >
                  ×
                </button>
              )}

              <div>
                <label>Name</label>
                <input name="name" value={participant.name} onChange={(e) => handleParticipantChange(index, e)} />
                {errors.participants?.[index]?.name && <div className="field-error">{errors.participants[index].name}</div>}
              </div>

              <div>
                <label>College</label>
                <select name="college" value={participant.college} onChange={(e) => handleParticipantChange(index, e)}>
                  {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.participants?.[index]?.college && <div className="field-error">{errors.participants[index].college}</div>}
              </div>

              {participant.college === 'Other College' && (
                <div>
                  <label>Other College Name</label>
                  <input name="otherCollege" value={participant.otherCollege} onChange={(e) => handleParticipantChange(index, e)} />
                  {errors.participants?.[index]?.otherCollege && <div className="field-error">{errors.participants[index].otherCollege}</div>}
                </div>
              )}

              <div>
                <label>Roll Number</label>
                <input name="roll" value={participant.roll} onChange={(e) => handleParticipantChange(index, e)} />
                {errors.participants?.[index]?.roll && <div className="field-error">{errors.participants[index].roll}</div>}
              </div>

              <div>
                <label>Gender</label>
                <select name="gender" value={participant.gender} onChange={(e) => handleParticipantChange(index, e)}>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.participants?.[index]?.gender && <div className="field-error">{errors.participants[index].gender}</div>}
              </div>

              <div>
                <label>Mobile</label>
                <input name="mobile" value={participant.mobile} onChange={(e) => handleParticipantChange(index, e)} />
                {errors.participants?.[index]?.mobile && <div className="field-error">{errors.participants[index].mobile}</div>}
              </div>

              <div>
                <label>Email</label>
                <input name="email" value={participant.email} onChange={(e) => handleParticipantChange(index, e)} />
                {errors.participants?.[index]?.email && <div className="field-error">{errors.participants[index].email}</div>}
              </div>

              <div>
                <label>Year of study</label>
                <select name="year" value={participant.year} onChange={(e) => handleParticipantChange(index, e)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.participants?.[index]?.year && <div className="field-error">{errors.participants[index].year}</div>}
              </div>

              <div>
                <label>Accomodation</label>
                <select name="accommodation" value={participant.accommodation} onChange={(e) => handleParticipantChange(index, e)}>
                  {accommodations.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.participants?.[index]?.accommodation && <div className="field-error">{errors.participants[index].accommodation}</div>}
              </div>

              <div>
                <label>Departments</label>
                <select name="department" value={participant.department} onChange={(e) => handleParticipantChange(index, e)}>
                  {departmentOptions.map((dept) => (
                    <option key={dept.value || dept.title} value={dept.value}>{dept.title}</option>
                  ))}
                </select>
                {errors.participants?.[index]?.department && <div className="field-error">{errors.participants[index].department}</div>}
              </div>

              <div>
                <label>Location</label>
                <input name="location" value={participant.location} onChange={(e) => handleParticipantChange(index, e)} />
                {errors.participants?.[index]?.location && <div className="field-error">{errors.participants[index].location}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="esingle-back-link" onClick={onCancel}>Cancel</button>
          <button type="submit" className="esingle-cta">Register</button>
        </div>
      </form>
    </div>
  );
}
