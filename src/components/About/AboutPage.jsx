import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const TIMELINE_DATA = [
  {
    id: 1,
    stage: 'Stage 01',
    title: 'Admissions & Enrollment',
    desc: 'Step into an inspiring environment. Explore detailed counselor guidance, program alignments, merit scholarships, and customized career-path consulting.',
  },
  {
    id: 2,
    stage: 'Stage 02',
    title: 'Academic Foundation',
    desc: 'Build fundamental strength with industry-vetted core topics. Engage in team challenges, design-thinking seminars, and peer-to-peer programming clubs.',
  },
  {
    id: 3,
    stage: 'Stage 03',
    title: 'Specialization & Electives',
    desc: 'Deep-dive into advanced modules. Participate in national hackathons, publish in collaboration with professors, and pursue semesters abroad.',
  },
  {
    id: 4,
    stage: 'Stage 04',
    title: 'Corporate Incubation & Practice',
    desc: 'Undertake real capstone projects and 6-month industry internships with our elite partners, gaining essential production-grade expertise.',
  },
  {
    id: 5,
    stage: 'Stage 05',
    title: 'Elite Placements & Beyond',
    desc: 'Prepare with rigorous mock assessment boards. Enter final placements with major multi-national brands or incubator funding for startups.',
  },
];

export default function AboutPage() {
  const sectionRef = useRef(null);
  const maskRef = useRef(null);
  const imageRef = useRef(null);
  const overlapCardRef = useRef(null);
  const textContentRef = useRef(null);

  const containerRef = useRef(null);
  const progressLineRef = useRef(null);
  const itemsRef = useRef([]);
  const dotsRef = useRef([]);

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

      // 5. Timeline Section: Animate progress line scaleY along scroll
      gsap.to(progressLineRef.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 30%',
          end: 'bottom 70%',
          scrub: true,
        },
      });

      // 6. Timeline Section: Sequential animation per item (dot -> connector -> card)
      itemsRef.current.forEach((item, index) => {
        if (!item) return;

        const isEven = index % 2 === 0;
        const card = item.querySelector('.timeline-card');
        const connector = item.querySelector('.timeline-connector');
        const dot = dotsRef.current[index];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          }
        });

        // Step 1: Activate dot & parent container
        tl.to([dot, item], {
          onStart: () => {
            dot.classList.add('active');
            item.classList.add('active');
          },
          onReverseComplete: () => {
            dot.classList.remove('active');
            item.classList.remove('active');
          },
          duration: 0.1,
        })
        // Step 2: Animate horizontal connector line scaleX (extends sideways)
        .to(connector, {
          scaleX: 1,
          duration: 0.35,
          ease: 'power2.out',
        })
        // Step 3: Animate card appearance (fade-in & slide-in)
        .fromTo(card,
          {
            opacity: 0,
            x: isEven ? -40 : 40,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.55,
            ease: 'power3.out',
          },
          '-=0.15' // Overlap slightly for a smoother flow
        );
      });
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
                    src="/about_campus_building.png"
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

      {/* 2. Timeline Component Content */}
      <section ref={containerRef} id="programs" className="programs-section">
        <div className="container-premium">

          {/* Section Header */}
          <span className="programs-header-tag text-center">Journey</span>
          <h2 className="programs-title text-center text-gradient">
            Timeline of Veda Event
          </h2>

          {/* Timeline */}
          <div className="timeline-container">
            {/* Central Lines */}
            <div className="timeline-line"></div>
            <div ref={progressLineRef} className="timeline-progress-line"></div>

            {/* Timeline Nodes */}
            {TIMELINE_DATA.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={item.id}
                  ref={(el) => (itemsRef.current[index] = el)}
                  className={`timeline-item ${isEven ? 'timeline-item-left' : 'timeline-item-right'
                    }`}
                >
                  {/* Info Card */}
                  <div className="timeline-card-wrap">
                    <div className="timeline-connector"></div>
                    <div className="timeline-card">
                      <span className="timeline-badge">{item.stage}</span>
                      <h4 className="timeline-card-title">{item.title}</h4>
                      <p className="timeline-card-desc">{item.desc}</p>
                    </div>
                  </div>

                  {/* Node Center Dot */}
                  <div
                    ref={(el) => (dotsRef.current[index] = el)}
                    className="timeline-dot"
                  ></div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
