import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useMouseSpotlight from '../hooks/useMouseSpotlight';
import GoldLogo from '../SDGs/GoldLogo';
import LightLogo from '../SDGs/LightLogo';
const bgHero = '/bg-hero.png';

gsap.registerPlugin(ScrollTrigger);

// 1. Research (Road Map) Data
const TIMELINE_DATA = [
  {
    id: 1,
    stage: 'About Veda',
    title: 'Discover the Grandeur',
    icon: 'bi-info-circle',
    desc: 'Discover the grandeur of VEDA 2k26, a national-level technical symposium. Explore exciting events, workshops, and opportunities to showcase your skills and innovation.The event provides a vibrant platform for aspiring engineers to showcase their talent through technical competitions, research presentations, workshops, project exhibitions, and collaborative learning experiences. By bringing together academia, industry, and young innovators, VEDA empowers participants to transform ideas into real-world solutions while celebrating the spirit of engineering that drives progress and innovation.',
  },
  {
    id: 2,
    stage: 'Student Registration',
    title: 'Create Your Profile',
    icon: 'bi-person-plus',
    desc: 'Create your profile seamlessly. Enter your roll number to auto-fill details, select your department, and get ready to participate in an array of technical and non-technical events.',
  },
  {
    id: 3,
    stage: 'Event Pass',
    title: 'Secure Your Spot',
    icon: 'bi-ticket-perforated',
    desc: 'Secure your spot in the events of your choice. Complete the secure online payment process to receive your official Event Pass and team ID for group activities.',
  },
  {
    id: 4,
    stage: 'Workshops & Exhibitions',
    title: 'Learn and Showcase',
    icon: 'bi-lightbulb',
    desc: 'Enhance your skills by attending hands-on workshops and expert seminars. Showcase your innovative technical and scientific projects to industry experts and peers.',
  },
  {
    id: 5,
    stage: 'Participation Certificate',
    title: 'Boost Your Portfolio',
    icon: 'bi-award',
    desc: 'Attend workshops, present your papers, and compete in hackathons. Every active participant receives a verifiable digital certificate to boost their professional portfolio.',
  },
  {
    id: 6,
    stage: 'Results Announcement',
    title: 'Claim Your Prizes',
    icon: 'bi-trophy',
    desc: 'Stay updated with live leaderboards and result announcements. Check your dashboard to see if you or your team made it to the podium and claim your well-deserved prizes.',
  }
];

export default function Home({ loadingComplete = true }) {
  // A. Hero refs & logic
  const heroRef = useMouseSpotlight(true);
  const headingRef = useRef(null);

  // B. Research refs
  const containerRef = useRef(null);
  const progressLineRef = useRef(null);
  const itemsRef = useRef([]);
  const dotsRef = useRef([]);

  // C. SDGs / Highlights refs
  const sdgsSectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  // Mobile GPU-Accelerated Parallax Depth Effect for Road Map Cards (< 768px)
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    let ticking = false;
    const activeCards = new Set();

    const updateMobileParallax = () => {
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      activeCards.forEach((cardEl) => {
        if (!cardEl) return;
        const rect = cardEl.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const normalizedScroll = (centerY - windowHeight / 2) / (windowHeight / 2);

        // Clamp translation offset strictly between -12px and +12px (GPU accelerated 60 FPS)
        const maxOffsetPx = 12;
        const clampedOffset = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, normalizedScroll * maxOffsetPx));

        const innerCard = cardEl.querySelector('.research-glass-card');
        if (innerCard) {
          innerCard.style.transform = `translate3d(0, ${clampedOffset.toFixed(2)}px, 0)`;
        }
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking && activeCards.size > 0) {
        window.requestAnimationFrame(updateMobileParallax);
        ticking = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeCards.add(entry.target);
          } else {
            activeCards.delete(entry.target);
            const innerCard = entry.target.querySelector('.research-glass-card');
            if (innerCard) {
              innerCard.style.transform = 'translate3d(0, 0, 0)';
            }
          }
        });

        if (activeCards.size > 0) {
          updateMobileParallax();
          window.addEventListener('scroll', handleScroll, { passive: true });
        } else {
          window.removeEventListener('scroll', handleScroll);
        }
      },
      { threshold: 0.1 }
    );

    itemsRef.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Generate Hero dust particles
  const particles = Array.from({ length: 10 }).map((_, i) => {
    const left = Math.random() * 100;
    const size = Math.random() * 4 + 2;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;
    return (
      <div
        key={`dust-${i}`}
        className="particle"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    );
  });

  const handleMouseMove = (e) => {
    if (!logoContainerRef.current) return;
    const rect = logoContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -12;
    const tiltY = (x / (rect.width / 2)) * 12;

    gsap.to(logoContainerRef.current, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1000,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (!logoContainerRef.current) return;
    gsap.to(logoContainerRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  useEffect(() => {
    if (!loadingComplete) return;

    let ctx;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // 1. Hero Section letter assemble
        const container = headingRef.current;
        if (container) {
          const letters = container.querySelectorAll('.veda-char');
          const containerRect = container.getBoundingClientRect();
          const containerCenterX = containerRect.left + containerRect.width / 2;
          const containerCenterY = containerRect.top + containerRect.height / 2;

          // Pre-set all letters centered, hidden and scaled to 0
          letters.forEach((char) => {
            const charRect = char.getBoundingClientRect();
            const charCenterX = charRect.left + charRect.width / 2;
            const charCenterY = charRect.top + charRect.height / 2;
            const toCenterX = containerCenterX - charCenterX;
            const toCenterY = containerCenterY - charCenterY;

            gsap.set(char, {
              x: toCenterX,
              y: toCenterY,
              scale: 0,
              opacity: 0,
            });
          });

          // Animate each character zooming up from center and aligning into position sequentially
          const tl = gsap.timeline({ delay: 0.15 });
          letters.forEach((char, index) => {
            const pos = index === 0 ? 0 : '-=0.28';
            tl.to(char, {
              scale: 1.4,
              opacity: 1,
              duration: 0.3,
              ease: 'back.out(1.4)',
            }, pos)
              .to(char, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.42,
                ease: 'power4.out',
              }, '+=0.02');
          });
        }

        // 2. Timeline Section: Animate progress line scaleY along scroll
        if (progressLineRef.current && containerRef.current) {
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
        }

        // 3. Timeline Section: Sequential animation per item (dot -> connector -> card)
        itemsRef.current.forEach((item, index) => {
          if (!item) return;

          const isEven = index % 2 === 0;
          const card = item.querySelector('.timeline-card');
          const connector = item.querySelector('.timeline-connector');
          const dot = dotsRef.current[index];
          if (!card || !connector || !dot) return;

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
              '-=0.15'
            );
        });

        // 4. SDGs Section left detail reveal
        if (leftColRef.current && leftColRef.current.children && leftColRef.current.children.length > 0) {
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
        }

        // 5. SDGs Section right logo reveal
        if (rightColRef.current) {
          gsap.fromTo(
            rightColRef.current,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration: 1.2,
              ease: 'back.out(1.2)',
              scrollTrigger: {
                trigger: rightColRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      }, heroRef);
    }, 180);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [loadingComplete]);

  return (
    <>
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="hero-section">
        <picture>
          <source media="(max-width: 768px)" srcSet="/bg-hero-moble.png" />
          <img src={bgHero} className="hero-bg-img" alt="Engineering Day Background" />
        </picture>
        <div className="aurora-bg">
          <div className="aurora-blob aurora-blob-1"></div>
          <div className="aurora-blob aurora-blob-2"></div>
          <div className="aurora-blob aurora-blob-3"></div>
        </div>
        <div className="hero-spotlight"></div>
        <div className="particles-container">{particles}</div>

        <div className="container-premium hero-container-layout">
          <div className="hero-left-col">
            <h1 ref={headingRef} className="veda-title-container">
              <span className="veda-char">V</span>
              <span className="veda-char">E</span>
              <span className="veda-char">D</span>
              <span className="veda-char">A</span>
              <span className="veda-char veda-year-block">2k26</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Timeline Component Content */}
      <section ref={containerRef} id="programs" className="programs-section">
        <div className="container-premium">

          {/* Section Header */}
          {/* <span className="programs-header-tag text-center">Journey</span> */}
          <h2 className="programs-title text-center text-gradient">
            Journey of Veda Event
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
                      <div className="d-flex align-items-center mt-2 mb-2">
                        {item.icon && (
                          <div style={{ fontSize: '1.8rem', color: 'var(--primary, #00d2ff)', marginRight: '12px' }}>
                            <i className={`bi ${item.icon}`}></i>
                          </div>
                        )}
                        <h4 className="timeline-card-title mb-0">{item.title}</h4>
                      </div>
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

      {/* 3. SDGs (EVENT HIGHLIGHTS) SECTION */}
      <section ref={sdgsSectionRef} className="sdgs-section">
        <div className="container-premium">
          <div className="row align-items-center">

            <div ref={leftColRef} className="col-lg-6">
              <span className="sdgs-header-tag">Event Highlights</span>
              <h2 className="sdgs-title text-gradient">
                Experience Innovation Across Every Discipline
              </h2>
              <p className="sdgs-desc">
                VEDA brings together students from diverse engineering and science disciplines
                through technical symposiums, project showcases, paper presentations, and
                innovation-driven competitions. Every department hosts its own flagship event,
                providing a platform to demonstrate technical skills, creativity, and research excellence.
              </p>

              <div className="sdg-goals-list">
                <div className="sdg-goal-item">
                  <div>
                    <h4 className="sdg-goal-name">Technical Symposiums</h4>
                    <p className="sdg-goal-details">
                      Intra-department hackathons, technical challenges, and tech quizzes testing core knowledge.
                    </p>
                  </div>
                </div>

                <div className="sdg-goal-item">
                  <div>
                    <h4 className="sdg-goal-name">Project Showcases</h4>
                    <p className="sdg-goal-details">
                      Exhibiting functional prototypes, hardware concepts, and software solutions designed by student groups.
                    </p>
                  </div>
                </div>

                <div className="sdg-goal-item">
                  <div>
                    <h4 className="sdg-goal-name">Paper Presentations</h4>
                    <p className="sdg-goal-details">
                      Presenting original research studies, review papers, and futuristic technical frameworks to expert panels.
                    </p>
                  </div>
                </div>

                <div className="sdg-goal-item">
                  <div>
                    <h4 className="sdg-goal-name">Flagship Contests</h4>
                    <p className="sdg-goal-details">
                      Inter-departmental challenges, design competitions, and innovation marathons.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div ref={rightColRef} className="col-lg-6 d-flex justify-content-center align-items-center">
              <img 
                src="/about_campus_building.jpeg" 
                alt="VEDA Student Symposium" 
                style={{ width: '100%', maxWidth: '600px', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }} 
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
