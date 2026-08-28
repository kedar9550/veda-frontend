import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);



export default function AboutPage() {
  const sectionRef = useRef(null);
  const maskRef = useRef(null);
  const imageRef = useRef(null);
  const overlapCardRef = useRef(null);
  const textContentRef = useRef(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. About Section: Image mask slide reveal
      gsap.to(maskRef.current, {
        xPercent: 100,
        ease: 'power3.inOut',
        duration: 1.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // 2. About Section: Parallax zoom on the main image
      gsap.to(imageRef.current, {
        scale: 1,
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 3. About Section: Parallax translate on the overlap glass card
      gsap.to(overlapCardRef.current, {
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });

      // 4. About Section: Staggered reveal for text content
      const elements = textContentRef.current.children;
      gsap.fromTo(
        elements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textContentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* 1. About Component Content */}
      <section ref={sectionRef} id="about" className="about-section">
        <div className="container-premium">
          <div className="row align-items-center">

            {/* Left Column: Text & Features */}
            <div className="col-lg-6 pr-lg-5">
              <div ref={textContentRef}>
                <span className="about-header-tag">About VEDA</span>
                <h2 className="about-title text-gradient">
                  Honoring Engineers Inspiring Innovators
                </h2>
                <p className="about-desc">
                  Celebrated annually on Engineers' Day, VEDA is Aditya University's premier National-Level Technical Fest dedicated to recognizing engineering excellence and fostering a culture of innovation. The event provides a vibrant platform for aspiring engineers to showcase their talent through technical competitions, research presentations, workshops, project exhibitions, and collaborative learning experiences. By bringing together academia, industry, and young innovators, VEDA empowers participants to transform ideas into real-world solutions while celebrating the spirit of engineering that drives progress and innovation.
                </p>


              </div>
            </div>

            {/* Right Column: Parallax Images */}
            <div className="col-lg-6">
              <div className="about-image-wrapper">

                {/* Main Image Box */}
                <div className="about-main-image-card">
                  {/* Curtain mask that slides away */}
                  <div ref={maskRef} className="about-image-mask" />
                  <img
                    ref={imageRef}
                    src="/about_campus_building.jpeg"
                    alt="Aditya University Campus Building"
                    loading="lazy"
                  />
                </div>

                {/* Overlapping Glass Card */}
                <div ref={overlapCardRef} className="about-overlap-card">
                  <div className="overlap-icon">
                    <i className="bi bi-shield-fill-check"></i>
                  </div>
                  <h4 className="overlap-title">Veda</h4>
                  <p className="overlap-desc">
                    Inspiring Engineers, Igniting Innovation, Shaping Tomorrow.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
