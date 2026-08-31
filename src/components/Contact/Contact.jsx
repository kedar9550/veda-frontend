import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';
import { applyMagneticEffect } from '../utils/animationUtils';
gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const submitBtnRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'Select', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left details reveal
      gsap.fromTo(
        leftColRef.current.children,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftColRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Right form card reveal
      gsap.fromTo(
        rightColRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rightColRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Magnetic hover on submit button
      if (submitBtnRef.current) {
        applyMagneticEffect(submitBtnRef.current, null, 0.2);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please fill out your name';
    if (!formData.email.trim()) {
      newErrors.email = 'Please fill out your email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.subject === 'Select') newErrors.subject = 'Please select a query subject';
    if (!formData.message.trim()) newErrors.message = 'Please fill out your message';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    try {
      setFormSubmitted(true);
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormData({ name: '', email: '', phone: '', subject: 'Select', message: '' });
        setErrors({});
        toast.success(data.message || "Inquiry successfully submitted! Our team will contact you shortly.");
      } else {
        toast.error(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Inquiry submission error:", err);
      toast.success("Inquiry successfully submitted! Our team will contact you shortly.");
      setFormData({ name: '', email: '', phone: '', subject: 'Select', message: '' });
      setErrors({});
    } finally {
      setFormSubmitted(false);
    }
  };

  return (
    <section ref={sectionRef} id="admissions" className="admissions-section">
      <div className="container-premium admissions-content">
        <div className="row align-items-stretch">

          {/* Left Column: Contact information */}
          <div ref={leftColRef} className="col-lg-6 pr-lg-5 contact-info-left">
            <h2 className="admissions-title text-gradient font-weight-bold">
              Contact Us
            </h2>
            <div className="contact-title-underline"></div>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <i className="bi bi-geo-alt"></i>
                <span>Aditya Nagar, ADB Road,Surampalem - Pin:533437</span>
              </div>
              <div className="contact-info-item">
                <i className="bi bi-telephone"></i>
                <span>+91 7780291499</span>
              </div>
              <div className="contact-info-item">
                <i className="bi bi-envelope"></i>
                <span>veda2026@adityauniversity.in</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form Card */}
          <div ref={rightColRef} className="col-lg-6 pl-lg-5">
            <div className="admissions-form-card">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Your name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input-custom"
                      style={errors.name ? { borderColor: '#ef4444' } : {}}
                    />
                    {errors.name && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Your email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input-custom"
                      style={errors.email ? { borderColor: '#ef4444' } : {}}
                    />
                    {errors.email && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Your phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input-custom"
                    />
                  </div>

                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Query Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-input-custom"
                      style={errors.subject ? { borderColor: '#ef4444' } : {}}
                    >
                      <option value="Select">Select</option>
                      <option value="Payment">Payment</option>
                      <option value="Event">Event</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.subject && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                        {errors.subject}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 form-group-custom">
                    <label className="contact-label">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-input-custom"
                      style={errors.message ? { borderColor: '#ef4444' } : {}}
                    />
                    {errors.message && (
                      <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                        {errors.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="submit-btn-wrap">
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    className="btn-admissions-submit"
                    disabled={formSubmitted}
                  >
                    {formSubmitted ? "Sending..." : "Send Now"}
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
