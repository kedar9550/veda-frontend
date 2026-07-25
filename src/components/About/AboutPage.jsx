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

      // 6. Timeline Section: Animate items & dots
      itemsRef.current.forEach((item, index) => {
        if (!item) return;

        const isEven = index % 2 === 0;
        const card = item.querySelector('.timeline-card');
        const dot = dotsRef.current[index];

        // Animate card slide-in
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isEven ? -100 : 100,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Animate dot activation
        gsap.to(dot, {
          borderColor: 'var(--secondary)',
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px var(--secondary)',
          scrollTrigger: {
            trigger: item,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
            onEnter: () => dot.classList.add('active'),
            onLeaveBack: () => dot.classList.remove('active'),
          },
        });
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
                <span className="about-header-tag">About Aditya</span>
                <h2 className="about-title text-gradient">
                  A Legacy of Educational Excellence
                </h2>
                <p className="about-desc">
                  Aditya University is committed to fostering a culture of innovation, research, and global 
                  citizenship. For over two decades, we have mentored pioneers, industry leaders, 
                  and change-makers, providing a rich, multi-disciplinary ecosystem that challenges 
                  students to think beyond boundaries.
                </p>

                {/* Bullet Features */}
                <div className="about-features">
                  <div className="about-feature-item">
                    <div className="about-feature-icon">
                      <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <div>
                      <h3 className="about-feature-title">World-Class Pedagogy</h3>
                      <p className="about-feature-desc">
                        Curriculum integrated with current industry practices, supported by hands-on labs.
                      </p>
                    </div>
                  </div>

                  <div className="about-feature-item">
                    <div className="about-feature-icon">
                      <i className="bi bi-globe-americas"></i>
                    </div>
                    <div>
                      <h3 className="about-feature-title">Global Academic Network</h3>
                      <p className="about-feature-desc">
                        Exchange programs and collaborations with 30+ international universities.
                      </p>
                    </div>
                  </div>

                  <div className="about-feature-item">
                    <div className="about-feature-icon">
                      <i className="bi bi-cpu-fill"></i>
                    </div>
                    <div>
                      <h3 className="about-feature-title">Advanced Research Hub</h3>
                      <p className="about-feature-desc">
                        Dedicated incubation centers, tech hubs, and state-of-the-art innovation labs.
                      </p>
                    </div>
                  </div>
                </div>
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
                  <h4 className="overlap-title">Accreditations</h4>
                  <p className="overlap-desc">
                    Ranked 'A++' Grade by NAAC. Approved by UGC & AICTE for premium quality standards.
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
            Aditya Student Lifecycle
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
                  className={`timeline-item ${
                    isEven ? 'timeline-item-left' : 'timeline-item-right'
                  }`}
                >
                  {/* Info Card */}
                  <div className="timeline-card-wrap">
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
