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

  const [formData, setFormData] = useState({ name: '', email: '', school: '', message: '' });
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
    if (!formData.name || !formData.email) return;
    
    // Simulate API request
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', school: '', message: '' });
      setFormSubmitted(false);
      alert("Inquiry successfully submitted! Our admissions counselor will contact you shortly.");
    }, 1200);
  };

  return (
    <section ref={sectionRef} id="admissions" className="admissions-section">
      {/* Morphing Fluid blob background */}
      <div className="admissions-blob-container">
        <div className="admissions-blob"></div>
      </div>

      <div className="container-premium admissions-content">
        <div className="row align-items-center">
          
          {/* Left Column: Admissions Process info */}
          <div ref={leftColRef} className="col-lg-6 pr-lg-5">
            <span className="admissions-header-tag">Admissions 2026</span>
            <h2 className="admissions-title text-gradient">
              Unlock Your Creative Potential
            </h2>
            <p className="admissions-desc">
              Ready to take the next step towards your professional career? Our admission process is 
              designed to recognize merit, creativity, and leadership potential. Fill out the 
              quick inquiry form to schedule a one-on-one consulting counseling session.
            </p>

            <div className="admissions-steps">
              <div className="admissions-step-item">
                <div className="admissions-step-num">01</div>
                <div>
                  <h4 className="admissions-step-title">Online Inquiry</h4>
                  <p className="admissions-step-desc">
                    Submit your basic educational credentials and preferred branch of interest.
                  </p>
                </div>
              </div>

              <div className="admissions-step-item">
                <div className="admissions-step-num">02</div>
                <div>
                  <h4 className="admissions-step-title">Counseling Review</h4>
                  <p className="admissions-step-desc">
                    Connect with an academic counselor to explore scholarship eligibility options.
                  </p>
                </div>
              </div>

              <div className="admissions-step-item">
                <div className="admissions-step-num">03</div>
                <div>
                  <h4 className="admissions-step-title">Offer & Onboarding</h4>
                  <p className="admissions-step-desc">
                    Receive your admission docket and secure your campus hostel slots.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div ref={rightColRef} className="col-lg-6">
            <div className="admissions-form-card">
              <h3 className="text-light mb-4 font-weight-bold">Quick Admissions Inquiry</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group-custom">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input-custom"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input-custom"
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <select
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className="form-input-custom"
                    required
                  >
                    <option value="" disabled>Select Preferred School</option>
                    <option value="engineering">School of Engineering</option>
                    <option value="management">School of Management</option>
                    <option value="pharmacy">School of Pharmacy</option>
                    <option value="science">School of Science</option>
                    <option value="agriculture">School of Agriculture</option>
                  </select>
                </div>

                <div className="form-group-custom">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input-custom"
                    placeholder="Inquiry Details / Message"
                    required
                  />
                </div>

                <div className="submit-btn-wrap">
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    className="btn-admissions-submit"
                    disabled={formSubmitted}
                  >
                    {formSubmitted ? "Submitting..." : "Submit Inquiry"}
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
