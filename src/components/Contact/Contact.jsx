import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    }, sectionRef);

    // Apply magnetic effect on submit button
    const cleanupSubmit = applyMagneticEffect(submitBtnRef.current, null, 0.25);

    return () => {
      ctx.revert();
      if (cleanupSubmit) cleanupSubmit();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.subject === 'Select') {
      alert("Please fill in all required fields and select a query subject.");
      return;
    }

    // Simulate API request
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', subject: 'Select', message: '' });
      setFormSubmitted(false);
      alert("Inquiry successfully submitted! Our team will contact you shortly.");
    }, 1200);
  };

  return (
    <section ref={sectionRef} id="admissions" className="admissions-section">
      {/* Morphing Fluid blob background */}
      <div className="admissions-blob-container">
        <div className="admissions-blob"></div>
      </div>

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
                <span>+91 9876543210</span>
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
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Your name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input-custom"
                      required
                    />
                  </div>

                  <div className="col-md-6 col-12 form-group-custom">
                    <label className="contact-label">Your email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input-custom"
                      required
                    />
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
                      required
                    >
                      <option value="Select">Select</option>
                      <option value="Payment">Payment</option>
                      <option value="Event">Event</option>
                      <option value="Others">Others</option>
                    </select>
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
                      required
                    />
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
