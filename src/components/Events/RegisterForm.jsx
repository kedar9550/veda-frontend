import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
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

function parseAmountToPaisa(value) {
  if (!value) return 0;

  const numericValue = Number(String(value).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(numericValue)) {
    const matches = String(value).match(/(\d+)/g);
    if (!matches) return 0;
    return Number(matches[0]) * 100;
  }

  return Math.round(numericValue * 100);
}

function getRazorpayKeyId() {
  return import.meta.env.VITE_RAZORPAY_KEY_ID || '';
}

function getRazorpayOrderUrl() {
  return import.meta.env.VITE_RAZORPAY_ORDER_URL || '/api/razorpay/create-order';
}

function getRazorpayVerifyUrl() {
  return import.meta.env.VITE_RAZORPAY_VERIFY_URL || '/api/razorpay/verify-payment';
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
  branch: '',
  location: '',
  photo: null,
  photoUrl: null
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
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useEvents();
  const { departments, error: departmentsError } = useDepartments();
  const event = events.find(e => e.groupSlug === schoolId && e.slug === eventId) || null;
  const [form, setForm] = useState({
    category: '',
    amount: '',
    eventName: '',
    teamSize: '',
    extraTeamSize: '0',
    participants: createParticipants(1),
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Computation for amount based on extra team and priceType
  const computedTotalAmountInPaisa = useMemo(() => {
    const baseAmountInPaisa = parseAmountToPaisa(event?.feeText || event?.feeAmount || event?.raw?.price || 0);
    const extraTeamSizeNum = Number(form.extraTeamSize) || 0;
    const extraAmountPerHeadInPaisa = parseAmountToPaisa(event?.raw?.extraAmountPerHead || 0);

    let totalBase = baseAmountInPaisa;
    if (event?.raw?.priceType?.toLowerCase() === 'per head') {
      const selectedTeamSize = Number(form.teamSize) || 1;
      totalBase = baseAmountInPaisa * selectedTeamSize;
    }

    return totalBase + (extraTeamSizeNum * extraAmountPerHeadInPaisa);
  }, [event, form.teamSize, form.extraTeamSize]);

  const eligibleDepartments = Array.isArray(event?.raw?.department) && event.raw.department.length > 0
    ? event.raw.department
    : departments || [];

  const departmentOptions = [
    { title: 'Select', value: '' },
    ...eligibleDepartments.map((dept) => ({ title: dept.name, value: dept.name }))
  ];

  useEffect(() => {
    const savedStudentStr = localStorage.getItem('eventStudent');
    if (savedStudentStr) {
      try {
        const student = JSON.parse(savedStudentStr);
        setForm(prev => {
          const newParticipants = [...prev.participants];
          if (newParticipants.length > 0) {
            newParticipants[0] = {
              ...newParticipants[0],
              name: student.name || '',
              college: student.college || '',
              otherCollege: student.otherCollege || '',
              roll: student.roll || '',
              gender: student.gender || '',
              mobile: student.mobile || '',
              email: student.email || '',
              branch: student.branch || ''
            };
            if (student.branch) {
              const match = eligibleDepartments.find(d => d.name.trim().toLowerCase() === student.branch.trim().toLowerCase());
              if (match) newParticipants[0].department = match.name;
            }
          }
          return { ...prev, participants: newParticipants };
        });
      } catch (err) {
        console.error('Failed to parse eventStudent from localStorage', err);
        sessionStorage.setItem('authRedirect', location.pathname);
        navigate('/login');
      }
    } else {
      sessionStorage.setItem('authRedirect', location.pathname);
      navigate('/login');
    }
  }, [location.pathname, eligibleDepartments]);

  const teamSizeOptions = useMemo(
    () => buildTeamSizeOptions(event?.teamSize || event?.maxTeamSize || event?.raw?.maxTeamSize || event?.registrationTeamSize || '1'),
    [event?.teamSize, event?.maxTeamSize, event?.raw?.maxTeamSize, event?.registrationTeamSize]
  );

  const extraTeamSizeOptions = useMemo(() => {
    const maxExtra = Number(event?.raw?.extraTeamSize) || 0;
    if (maxExtra <= 0) return [];
    return Array.from({ length: maxExtra + 1 }, (_, idx) => ({ value: String(idx), label: String(idx) }));
  }, [event?.raw?.extraTeamSize]);

  useEffect(() => {
    if (!event) return;

    const defaultTeamSize = teamSizeOptions.find(opt => opt.value === event.teamSize)?.value
      || teamSizeOptions[0]?.value
      || '';

    setForm((prev) => ({
      ...prev,
      category: event.category || event.groupCategory || schoolId || '',
      amount: `₹${computedTotalAmountInPaisa / 100}`,
      eventName: event.title || eventId || '',
      teamSize: prev.teamSize || defaultTeamSize,
    }));
  }, [event, schoolId, eventId, teamSizeOptions, computedTotalAmountInPaisa]);

  const [errors, setErrors] = useState({});
  const [participantValidation, setParticipantValidation] = useState({});
  const colleges = ['Choose...', 'Aditya University', 'ACET', 'Other College'];
  const years = ['Select', '1', '2', '3', '4'];
  const genders = ['Select', 'Male', 'Female', 'Other'];


  const validateParticipantRegistration = async (index, type, value) => {
    if (!value || !form.eventName) return;

    const isDuplicate = form.participants.some((p, i) => i !== index && p[type] && p[type].toLowerCase() === value.toLowerCase());
    if (isDuplicate) {
      setParticipantValidation(prev => ({
        ...prev,
        [index]: { ...prev[index], [`${type}Loading`]: false, [`${type}Error`]: `This ${type} is already used by another participant in this form.` }
      }));
      return;
    }

    setParticipantValidation(prev => ({
      ...prev,
      [index]: { ...prev[index], [`${type}Loading`]: true, [`${type}Error`]: '' }
    }));

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9022';
      const formCategory = (form.category || '').toLowerCase();
      const queryParams = new URLSearchParams();
      queryParams.append(type, value);

      const res = await fetch(`${baseUrl}/api/razorpay/registrations?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const payments = data.payments || [];
        const hasRegistered = payments.some(payment =>
          payment.eventId === event.id &&
          payment.schoolId === event.groupId &&
          (payment.category || '').toLowerCase() === formCategory
        );

        setParticipantValidation(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            [`${type}Loading`]: false,
            [`${type}Error`]: hasRegistered ? 'Already registered for this event.' : ''
          }
        }));
      }
    } catch (err) {
      console.error(err);
      setParticipantValidation(prev => ({
        ...prev,
        [index]: { ...prev[index], [`${type}Loading`]: false }
      }));
    }

    if (type === 'roll' && value && form.participants[index].college === 'Other College') {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${baseUrl}/api/razorpay/registrations/photo/${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setForm(prev => {
              const newParticipants = [...prev.participants];
              if (newParticipants[index]) {
                newParticipants[index] = { ...newParticipants[index], photoUrl: baseUrl + data.url };
              }
              return { ...prev, participants: newParticipants };
            });
          } else {
            setForm(prev => {
              const newParticipants = [...prev.participants];
              if (newParticipants[index]) {
                newParticipants[index] = { ...newParticipants[index], photoUrl: null };
              }
              return { ...prev, participants: newParticipants };
            });
          }
        }
      } catch (err) {
        console.error('Error checking photo existence:', err);
      }
    }

    if (type === 'roll' && value.length >= 5) {
      try {
        const cleanRoll = value.trim().toUpperCase();
        const candidates = [cleanRoll];
        if (cleanRoll.length === 10) {
          if (cleanRoll.slice(2, 4) === '39') {
            candidates.push(cleanRoll.slice(0, 2) + 'A9' + cleanRoll.slice(4));
          } else if (cleanRoll.slice(2, 4) === 'A9') {
            candidates.push(cleanRoll.slice(0, 2) + '39' + cleanRoll.slice(4));
          }
        }

        let studentData = null;
        for (const targetRoll of candidates) {
          try {
            const proxyUrl = import.meta.env.VITE_API_BASE_URL
              ? `${import.meta.env.VITE_API_BASE_URL}/api/event-students/studentdata/${encodeURIComponent(targetRoll)}`
              : `/api/event-students/studentdata/${encodeURIComponent(targetRoll)}`;
            const res = await fetch(proxyUrl);
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
                studentData = json;
                break;
              }
            }
          } catch (err) { }

          if (!studentData) {
            try {
              const res = await fetch(`/adityaapi/api/studentdata/${encodeURIComponent(targetRoll)}`);
              if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
                  studentData = json;
                  break;
                }
              }
            } catch (err) { }
          }

          if (!studentData) {
            try {
              const envUrl = import.meta.env.VITE_STUDENT_DATA_URL || 'https://info.aec.edu.in/adityaapi/api/studentdata';
              const cleanEnvUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
              const res = await fetch(`${cleanEnvUrl}/${encodeURIComponent(targetRoll)}`);
              if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0 && !json[0].error && json[0].studentname) {
                  studentData = json;
                  break;
                }
              }
            } catch (err) { }
          }
        }

        if (studentData && Array.isArray(studentData) && studentData.length > 0 && !studentData[0].error && studentData[0].studentname) {
          const info = studentData[0];
          setForm(prev => {
            const newParticipants = [...prev.participants];
            const updatedParticipant = { ...newParticipants[index] };

            if (info.studentname) updatedParticipant.name = info.studentname;
            if (info.emailid) updatedParticipant.email = info.emailid.toLowerCase();

            const mob = info.mobilenumber || info.fathermobilenumber || info.mothermobilenumber;
            if (mob) updatedParticipant.mobile = mob;

            if (info.gender) {
              const rawGender = info.gender.trim().toLowerCase();
              if (rawGender.startsWith('f')) updatedParticipant.gender = 'Female';
              else if (rawGender.startsWith('m')) updatedParticipant.gender = 'Male';
              else updatedParticipant.gender = 'Other';
            }
            if (info.branch) {
              updatedParticipant.branch = info.branch;
              const matchedDept = eligibleDepartments.find(dept => dept.name.trim().toLowerCase() === info.branch.trim().toLowerCase());
              if (matchedDept) {
                updatedParticipant.department = matchedDept.name;
              }
            }

            updatedParticipant.college = 'Aditya University';

            newParticipants[index] = updatedParticipant;
            return { ...prev, participants: newParticipants };
          });

          // Verify branch eligibility
          if (info && info.branch) {
            const isEligible = eligibleDepartments.some(dept => dept.name.trim().toLowerCase() === info.branch.trim().toLowerCase());
            if (!isEligible) {
              setParticipantValidation(prev => ({
                ...prev,
                [index]: { ...prev[index], rollError: `Branch '${info.branch}' is not eligible for this event.` }
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching student data in RegisterForm:', err);
      }
    }
  };



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

  const handlePhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => {
        const participants = [...prev.participants];
        participants[index] = {
          ...participants[index],
          photo: file,
          photoUrl: URL.createObjectURL(file)
        };
        return { ...prev, participants };
      });
    }
  };

  const removeParticipant = (index) => {
    setForm((prev) => {
      const participants = prev.participants.filter((_, i) => i !== index);
      const newCount = Math.max(1, participants.length);

      // We also need to adjust extraTeamSize if we remove an extra participant manually
      const maxBaseTeamSize = Number(teamSizeOptions[teamSizeOptions.length - 1]?.value) || 1;
      const baseTeamSize = Math.min(newCount, maxBaseTeamSize);
      const extraTeamSize = newCount > baseTeamSize ? newCount - baseTeamSize : 0;

      return {
        ...prev,
        participants,
        teamSize: String(baseTeamSize),
        extraTeamSize: String(extraTeamSize)
      };
    });
  };

  useEffect(() => {
    if (!form.teamSize) return;
    const count = (Number(form.teamSize) || 1) + (Number(form.extraTeamSize) || 0);
    if (form.participants.length !== count) {
      setForm(prev => ({
        ...prev,
        participants: createParticipants(count, prev.participants),
      }));
    }
  }, [form.teamSize, form.extraTeamSize]);

  // Auto-validate Participant 1 (logged-in user) since their fields are disabled and can't trigger onBlur
  useEffect(() => {
    if (form.eventName && (form.participants[0]?.roll || form.participants[0]?.email)) {
      if (form.participants[0].roll) {
        validateParticipantRegistration(0, 'roll', form.participants[0].roll);
      } else if (form.participants[0].email) {
        validateParticipantRegistration(0, 'email', form.participants[0].email);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.eventName]);

  const validate = () => {
    const participantCount = Number(form.teamSize) || 1;
    const err = { participants: [] };

    if (!form.teamSize || participantCount < 1) {
      err.teamSize = 'Please select a valid team size.';
    }

    if (form.participants.length < 1) {
      err.teamSize = 'At least one participant is required for this event.';
    }

    if (form.participants.length !== participantCount) {
      err.teamSize = `Selected team size is ${participantCount}, but ${form.participants.length} participant form${form.participants.length === 1 ? '' : 's'} is present.`;
    }

    form.participants.forEach((participant, idx) => {
      const pErr = {};
      if (!participant.name) pErr.name = 'Please provide a valid name.';
      if (!participant.college || participant.college === 'Choose...') pErr.college = 'Please select a valid College.';

      if (!participant.roll) {
        pErr.roll = 'Please provide RollNumber.';
      } else {
        const isDuplicateRoll = form.participants.some((p, i) => i !== idx && p.roll && p.roll.toLowerCase() === participant.roll.toLowerCase());
        if (isDuplicateRoll) pErr.roll = 'This roll number is already used by another participant in this form.';
      }

      if (!participant.gender || participant.gender === 'Select') pErr.gender = 'Please select a Gender.';
      if (!participant.mobile) pErr.mobile = 'Please provide a valid Number.';

      if (!participant.email) {
        pErr.email = 'Please provide a valid Email.';
      } else {
        const isDuplicateEmail = form.participants.some((p, i) => i !== idx && p.email && p.email.toLowerCase() === participant.email.toLowerCase());
        if (isDuplicateEmail) pErr.email = 'This email is already used by another participant in this form.';
      }

      if (participant.college === 'Other College' && !participant.otherCollege) pErr.otherCollege = 'Please provide the other college name.';
      if (participant.college === 'Other College' && !participant.photo && !participant.photoUrl) pErr.photo = 'Please upload a photo.';
      if (!participant.year || participant.year === 'Select') pErr.year = 'Please select a valid Year.';
      if (!participant.department || participant.department === 'Select') pErr.department = 'Please select a valid Department.';
      if (!participant.location) pErr.location = 'Please provide a valid Location.';
      err.participants[idx] = pErr;
    });

    const hasErrors = Object.keys(err).some((key) => {
      if (key === 'participants') {
        return err.participants.some((p) => Object.keys(p).length > 0);
      }
      return Boolean(err[key]);
    });

    setErrors(hasErrors ? err : {});
    return !hasErrors;
  };

  const completeRegistration = (paymentDetails = {}) => {
    setPaymentMessage('');
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay SDK.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load Razorpay SDK.'));
    document.body.appendChild(script);
  });

  const createRazorpayOrder = async (amountInPaisa) => {
    const orderUrl = getRazorpayOrderUrl();
    const response = await fetch(orderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaisa,
        eventId: event?.id,
        teamSize: Number(form.teamSize) || 1,
        extraTeamSize: Number(form.extraTeamSize) || 0,
        currency: 'INR',
        receipt: `event-${event?.id || schoolId || 'registration'}-${Date.now()}`,
      }),
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = null;
    }

    if (!response.ok) {
      const serverMsg = data?.error || data?.message || text || response.statusText || 'Unable to create payment order.';
      throw new Error(serverMsg);
    }

    return data?.orderId || data?.id || data?.order_id;
  };

  const submitRegistration = async (paymentDetails, teamId) => {
    const verifyUrl = getRazorpayVerifyUrl();
    const amountInPaisa = Number(paymentDetails.amountInPaisa ?? parseAmountToPaisa(form.amount));
    const amountInRupees = Number(paymentDetails.amountInRupees ?? (amountInPaisa / 100));

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: event.id,
        schoolId: event.groupId,
        category: form.category,
        eventName: form.eventName,
        amount: amountInRupees,
        amountInPaisa,
        amountInRupees,
        currency: 'INR',
        teamSize: (Number(form.teamSize) || 1) + (Number(form.extraTeamSize) || 0),
        participants: form.participants,
        receipt: `event-${event?.id || schoolId || 'registration'}-${Date.now()}`,
        order_id: paymentDetails.orderId,
        payment_id: paymentDetails.paymentId,
        signature: paymentDetails.signature,
        teamId: teamId,
        rawPaymentData: {
          ...paymentDetails,
          razorpayResponse: paymentDetails.razorpayResponse,
          amountInPaisa,
          amountInRupees,
        },
      }),
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = null;
    }

    if (!response.ok) {
      const serverMsg = data?.error || data?.message || text || response.statusText || 'Unable to verify payment and save registration.';
      throw new Error(serverMsg);
    }

    return data;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const processRegistration = async () => {
    setShowConfirmModal(false);
    const amountInPaisa = parseAmountToPaisa(form.amount);

    if (amountInPaisa <= 0) {
      setIsProcessingPayment(false);
      completeRegistration();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentMessage('');

    try {
      // 1. Check for duplicates within the form itself
      const emails = form.participants.map(p => p.email).filter(Boolean);
      const rolls = form.participants.map(p => p.roll).filter(Boolean);
      if (new Set(emails).size !== emails.length) {
        setPaymentMessage('Duplicate email addresses found within the participant list.');
        setIsProcessingPayment(false);
        return;
      }
      if (new Set(rolls).size !== rolls.length) {
        setPaymentMessage('Duplicate roll numbers found within the participant list.');
        setIsProcessingPayment(false);
        return;
      }

      // 2. Check backend if any participant is already registered for this event
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9022';
      const formCategory = (form.category || '').toLowerCase();

      for (let i = 0; i < form.participants.length; i++) {
        const p = form.participants[i];
        const queryParams = new URLSearchParams();
        if (p.email) queryParams.append('email', p.email);
        if (p.roll) queryParams.append('roll', p.roll);

        try {
          const res = await fetch(`${baseUrl}/api/razorpay/registrations?${queryParams.toString()}`);
          if (res.ok) {
            const data = await res.json();
            const payments = data.payments || [];
            const hasRegistered = payments.some(payment =>
              payment.eventId === event.id &&
              payment.schoolId === event.groupId &&
              (payment.category || '').toLowerCase() === formCategory
            );

            if (hasRegistered) {
              setPaymentMessage(`Participant ${i + 1} (${p.name} - ${p.roll || p.email}) is already registered for this event.`);
              setIsProcessingPayment(false);
              return;
            }
          }
        } catch (err) {
          console.error('Error verifying participant registration status:', err);
        }
      }

      // 3. Upload pending photos for Other College participants
      const photoUploadBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9022';
      for (let i = 0; i < form.participants.length; i++) {
        const p = form.participants[i];
        if (p.college === 'Other College' && p.photo) {
          const formData = new FormData();
          formData.append('rollnumber', p.roll); // Appended before photo so multer can read it first
          formData.append('photo', p.photo);
          try {
            const uploadRes = await fetch(`${photoUploadBaseUrl}/api/razorpay/registrations/photo`, {
              method: 'POST',
              body: formData
            });
            if (!uploadRes.ok) {
              throw new Error('Failed to upload photo for ' + p.name);
            }
            const uploadData = await uploadRes.json();
            setForm(prev => {
              const newParticipants = [...prev.participants];
              if (newParticipants[i]) {
                newParticipants[i] = { ...newParticipants[i], photoUrl: photoUploadBaseUrl + '/uploads/othercollegephotos/' + uploadData.filename, photo: null };
              }
              return { ...prev, participants: newParticipants };
            });
          } catch (err) {
            console.error('Error uploading photo:', err);
            setPaymentMessage(`Error uploading photo for participant ${i + 1}. Please try again.`);
            setIsProcessingPayment(false);
            return;
          }
        }
      }

      const razorpayKeyId = getRazorpayKeyId();
      if (!razorpayKeyId) {
        throw new Error('Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in your environment.');
      }

      await loadRazorpayScript();
      const orderId = await createRazorpayOrder(amountInPaisa);

      const teamId = `VD26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const options = {
        key: razorpayKeyId,
        amount: amountInPaisa,
        currency: 'INR',
        order_id: orderId,
        name: 'Aditya Premium',
        description: form.eventName || 'Event Registration',
        prefill: {
          name: form.participants[0]?.name || '',
          email: form.participants[0]?.email || '',
          contact: form.participants[0]?.mobile || '',
        },
        theme: {
          color: '#7c3aed',
        },
        handler: async (response) => {
          try {
            await submitRegistration({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amountInPaisa,
              amountInRupees: amountInPaisa / 100,
              razorpayResponse: response,
            }, teamId);
            completeRegistration({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              amountInPaisa,
              amountInRupees: amountInPaisa / 100,
              razorpayResponse: response,
              teamId,
            });
          } catch (error) {
            console.error('Payment verification failed', error);
            const message = error?.message || 'Unable to verify payment and save registration. Please try again.';
            setPaymentMessage(message);
            toast.error(message);
          } finally {
            setIsProcessingPayment(false);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay payment failed', error);
      const message = error?.message || 'Unable to initialize Razorpay payment. Please try again.';
      setPaymentMessage(message);
      toast.error(message);
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
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
              School
              <input name="category" value={form.category} readOnly />
            </label>
            <label>
              AMOUNT
              {event?.raw?.priceType?.toLowerCase() === 'per head' && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px', textTransform: 'none', fontWeight: 'normal' }}>
                  (₹{parseAmountToPaisa(event?.feeText || event?.feeAmount || event?.raw?.price || 0) / 100} Per Head)
                </span>
              )}
              <input name="amount" value={form.amount} readOnly />
              {Number(form.extraTeamSize) > 0 && (
                <span style={{ fontSize: '0.8rem', color: '#ffd700', marginTop: '0.25rem', display: 'block' }}>
                  *₹{parseAmountToPaisa(event?.raw?.extraAmountPerHead || 0) / 100} Extra amount per head
                </span>
              )}
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
              {errors.teamSize && <div className="field-error">{errors.teamSize}</div>}
            </label>
            {extraTeamSizeOptions.length > 0 && (
              <label>
                Extra Team Size
                <select name="extraTeamSize" value={form.extraTeamSize} onChange={handleChange}>
                  {extraTeamSizeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            )}
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
                  <input name="name" value={participant.name} onChange={(e) => handleParticipantChange(index, e)} disabled={index === 0} />
                  {errors.participants?.[index]?.name && <div className="field-error">{errors.participants[index].name}</div>}
                </div>

                <div>
                  <label>College</label>
                  <select name="college" value={participant.college} onChange={(e) => handleParticipantChange(index, e)} disabled={index === 0}>
                    {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.participants?.[index]?.college && <div className="field-error">{errors.participants[index].college}</div>}
                </div>

                {participant.college === 'Other College' && (
                  <>
                    <div>
                      <label>Other College Name</label>
                      <input name="otherCollege" value={participant.otherCollege} onChange={(e) => handleParticipantChange(index, e)} disabled={index === 0} />
                      {errors.participants?.[index]?.otherCollege && <div className="field-error">{errors.participants[index].otherCollege}</div>}
                    </div>
                    <div>
                      <label>Participant Photo</label>
                      {participant.photoUrl ? (
                        <div style={{ marginBottom: '10px' }}>
                          <img src={participant.photoUrl} alt="Participant" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #444' }} />
                          {participant.photoUrl.startsWith('blob:') ? (
                            <button type="button" onClick={() => {
                              setForm(prev => {
                                const newP = [...prev.participants];
                                newP[index].photo = null;
                                newP[index].photoUrl = null;
                                return { ...prev, participants: newP };
                              });
                            }} style={{ display: 'block', marginTop: '5px', fontSize: '0.8rem', color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Remove</button>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '5px' }}>Already uploaded</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(index, e)} />
                        </div>
                      )}
                      {errors.participants?.[index]?.photo && <div className="field-error">{errors.participants[index].photo}</div>}
                    </div>
                  </>
                )}

                <div>
                  <label>Roll Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="roll"
                      value={participant.roll}
                      onChange={(e) => handleParticipantChange(index, e)}
                      onBlur={(e) => validateParticipantRegistration(index, 'roll', e.target.value)}
                      disabled={index === 0}
                    />
                    {participantValidation[index]?.rollLoading && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.75rem', color: 'var(--primary)' }}>Checking...</span>}
                  </div>
                  {participantValidation[index]?.rollError && <div className="field-error">{participantValidation[index].rollError}</div>}
                  {errors.participants?.[index]?.roll && !participantValidation[index]?.rollError && <div className="field-error">{errors.participants[index].roll}</div>}
                </div>

                <div>
                  <label>Gender</label>
                  <select name="gender" value={participant.gender} onChange={(e) => handleParticipantChange(index, e)} disabled={index === 0}>
                    {genders.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {errors.participants?.[index]?.gender && <div className="field-error">{errors.participants[index].gender}</div>}
                </div>

                <div>
                  <label>Mobile</label>
                  <input name="mobile" value={participant.mobile} onChange={(e) => handleParticipantChange(index, e)} disabled={index === 0} />
                  {errors.participants?.[index]?.mobile && <div className="field-error">{errors.participants[index].mobile}</div>}
                </div>

                <div>
                  <label>Email</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="email"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, e)}
                      onBlur={(e) => validateParticipantRegistration(index, 'email', e.target.value)}
                      disabled={index === 0}
                    />
                    {participantValidation[index]?.emailLoading && <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.75rem', color: 'var(--primary)' }}>Checking...</span>}
                  </div>
                  {participantValidation[index]?.emailError && <div className="field-error">{participantValidation[index].emailError}</div>}
                  {errors.participants?.[index]?.email && !participantValidation[index]?.emailError && <div className="field-error">{errors.participants[index].email}</div>}
                </div>

                <div>
                  <label>Year of study</label>
                  <select name="year" value={participant.year} onChange={(e) => handleParticipantChange(index, e)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.participants?.[index]?.year && <div className="field-error">{errors.participants[index].year}</div>}
                </div>

                <div>
                  <label>Departments</label>
                  <select 
                    name="department" 
                    value={participant.department} 
                    onChange={(e) => handleParticipantChange(index, e)}
                    disabled={!!participant.branch && eligibleDepartments.some(d => d.name.trim().toLowerCase() === participant.branch.trim().toLowerCase())}
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept.value || dept.title} value={dept.value}>{dept.title}</option>
                    ))}
                  </select>
                  {errors.participants?.[index]?.department && <div className="field-error">{errors.participants[index].department}</div>}
                </div>

                {participant.branch && participant.college === 'Aditya University' && (
                  <div>
                    <label>Branch</label>
                    <input name="branch" value={participant.branch} disabled />
                  </div>
                )}

                <div>
                  <label>Location</label>
                  <input name="location" value={participant.location} onChange={(e) => handleParticipantChange(index, e)} />
                  {errors.participants?.[index]?.location && <div className="field-error">{errors.participants[index].location}</div>}
                </div>
              </div>
            ))}
          </div>

          {paymentMessage && (
            <div style={{ marginTop: '1rem', color: '#ff6b6b', fontWeight: 600 }}>{paymentMessage}</div>
          )}

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="esingle-back-link" onClick={onCancel}>Cancel</button>
            <button
              type="submit"
              className="esingle-cta"
              disabled={isProcessingPayment || Object.values(participantValidation).some(v => v.rollError || v.emailError)}
              style={{
                opacity: (isProcessingPayment || Object.values(participantValidation).some(v => v.rollError || v.emailError)) ? 0.6 : 1,
                cursor: (isProcessingPayment || Object.values(participantValidation).some(v => v.rollError || v.emailError)) ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessingPayment ? 'Processing...' : 'Register'}
            </button>
          </div>
        </form>
      </div>

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card, #1a1a1a)',
            border: '1px solid var(--glass-border, #333)',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%', maxWidth: '500px',
            boxShadow: 'var(--shadow-md, 0 10px 30px rgba(0,0,0,0.5))',
            color: 'var(--text-light, #fff)'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary, #ffd700)', marginBottom: '1rem', fontSize: '1.5rem' }}>Confirm Registration</h3>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--text-muted, #e0e0e0)' }}>
              Please confirm the registration for {(Number(form.teamSize) || 1) + (Number(form.extraTeamSize) || 0)} participant{((Number(form.teamSize) || 1) + (Number(form.extraTeamSize) || 0)) > 1 ? 's' : ''}.
            </p>
            <div style={{ background: 'var(--glass, rgba(255,255,255,0.05))', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {form.participants.map((p, idx) => (
                <div key={idx} style={{ marginBottom: idx < form.participants.length - 1 ? '0.75rem' : 0 }}>
                  <strong style={{ color: 'var(--primary, #ffd700)' }}>{idx + 1}.</strong> {p.name || 'Unnamed participant'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--glass-border, #555)', color: 'var(--text-light, #ccc)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processRegistration}
                className="esingle-cta"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card, #1a1a1a)',
            border: '1px solid var(--glass-border, #333)',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            width: '90%', maxWidth: '400px',
            boxShadow: 'var(--shadow-md, 0 10px 30px rgba(0,0,0,0.5))',
            color: 'var(--text-light, #fff)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1.5rem'
            }}>
              ✓
            </div>
            <h3 style={{ marginTop: 0, color: 'var(--text-light, #fff)', marginBottom: '1rem', fontSize: '1.5rem' }}>Payment Successful!</h3>
            <p style={{ marginBottom: '2rem', lineHeight: 1.5, color: 'var(--text-muted, #e0e0e0)' }}>
              Your payment has been successfully processed and your registration is complete.
            </p>
            <button
              type="button"
              onClick={handleSuccessClose}
              className="esingle-cta"
              style={{ padding: '0.75rem 2rem', width: '100%' }}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
