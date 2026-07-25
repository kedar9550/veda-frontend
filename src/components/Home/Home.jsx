import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useMouseSpotlight from '../hooks/useMouseSpotlight';
import bgHero from '../../assets/bg-hero.png';
import GoldLogo from '../SDGs/GoldLogo';
import LightLogo from '../SDGs/LightLogo';

gsap.registerPlugin(ScrollTrigger);

// 1. Research (Road Map) Data
const RESEARCH_DATA = [
  {
    id: 1,
    side: 'left',
    year: 'September 15, 2025',
    title: '',
    icon: 'bi-calendar3',
    desc: 'Veda 2025 is the annual National Technological and Entrepreneurial Festival organized by the Aditya University, Surampalem. Celebrating innovation, creativity, and technical excellence, Veda serves as a confluence of ideas, where young engineers, tech enthusiasts, and entrepreneurs come together to showcase their skills, exchange knowledge, and collaborate on groundbreaking projects.',
  },
  {
    id: 2,
    side: 'right',
    year: 'September 15, 2025',
    title: '',
    icon: 'bi-cpu',
    desc: 'Veda 2025 brings together a diverse range of department-specific events, each designed to challenge, inspire, and foster innovation among students from various engineering and technology disciplines. These events provide a platform for students to apply their theoretical knowledge, collaborate on projects, and gain hands-on experience in their respective fields.',
  },
  {
    id: 3,
    side: 'left',
    year: 'September 15, 2025',
    title: '',
    icon: 'bi-trophy',
    desc: 'Participants can choose from a wide variety of events based on their interests and expertise. Whether you are looking to test your technical knowledge or showcase your artistic talents, Veda Fest has something for you. Browse through the event list, read the rules, and pick the events that excite you the most. Some events are team-based, so gather your friends and colleagues to compete for glory. Donot forget to check the prerequisites and materials needed for each event before making your selection.',
  },
  {
    id: 4,
    side: 'right',
    year: 'September 16, 2025',
    title: '',
    icon: 'bi-pencil-square',
    desc: 'To participate in any of the events at Veda Fest, you\'ll need to complete the online registration form. The form is simple and user-friendly, requiring basic details like your name, department, and the events you wish to join. Make sure to provide accurate information, as it will be used for all communications and certificates. Early registration is recommended, as some events have limited slots. Keep an eye on the deadlines to ensure your spot in the fest.',
  },
  {
    id: 5,
    side: 'left',
    year: 'September 16, 2025',
    title: '',
    icon: 'bi-credit-card-2-front',
    desc: 'Once you have selected your events, the final step is to complete the payment through our secure online gateway. The fee covers participation in multiple events, access to workshops, and other fest amenities. We accept all major credit/debit cards, UPI, and net banking options. Our payment gateway is designed to provide a safe and seamless transaction experience. All transactions are protected with SSL encryption, ensuring that your payment information remains confidential and secure.',
  },
];

export default function Home() {
  // A. Hero refs & logic
  const heroRef = useMouseSpotlight(true);
  const headingRef = useRef(null);

  // B. Research refs
  const researchContainerRef = useRef(null);
  const pathRef = useRef(null);
  const nodesRef = useRef([]);

  // C. SDGs refs & logic
  const sdgsSectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const logoContainerRef = useRef(null);

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.body.classList.contains('dark-theme');
  });

  // Track dark theme changes reactively
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.body.classList.contains('dark-theme'));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
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

          const tl = gsap.timeline();
          letters.forEach((char, index) => {
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

            const scaleStartPos = index === 0 ? 0 : '-=0.35';
            tl.to(char, {
              scale: 1.3,
              opacity: 1,
              duration: 0.22,
              ease: 'back.out(1.1)',
            }, scaleStartPos)
            .to(char, {
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.35,
              ease: 'power4.out',
            }, '+=0.02');
          });
        }

        // 2. Research timeline scroll path animation
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: researchContainerRef.current,
            start: 'top 30%',
            end: 'bottom 60%',
            scrub: 1,
          },
        });

        // 3. Research timeline nodes reveal
        nodesRef.current.forEach((node) => {
          if (!node) return;
          gsap.fromTo(
            node,
            { opacity: 0, y: 55 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: node,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // 4. SDGs Section left detail reveal
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

        // 5. SDGs Section right logo reveal
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
      }, heroRef);
    }, 180);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <>
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="hero-section">
        <img src={bgHero} className="hero-bg-img" alt="Engineering Day Background" />
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
              <span className="veda-char veda-year-block">2K26</span>
            </h1>
          </div>
        </div>
      </section>

      {/* 2. RESEARCH TIMELINE SECTION */}
      <section ref={researchContainerRef} id="research" className="research-section">
        <div className="container-premium">
          <span className="research-header-tag text-center">Road Map</span>
          <h2 className="research-title text-center text-gradient">
            The Journey of VEDA_2K26
          </h2>

          <div className="research-timeline-wrap">
            <div className="research-svg-container">
              <svg width="100%" height="100%" viewBox="0 0 900 800" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="researchGlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
                <path
                  ref={pathRef}
                  className="research-svg-path"
                  d="M 450,0 C 450,150 200,200 200,350 C 200,500 700,500 700,650 C 700,750 450,750 450,800"
                />
              </svg>
            </div>

            {RESEARCH_DATA.map((node, index) => (
              <div
                key={node.id}
                ref={(el) => (nodesRef.current[index] = el)}
                className={`research-node ${node.side === 'left' ? 'research-node-left' : 'research-node-right'}`}
              >
                <div className="research-glass-card">
                  <div className="research-card-header">
                    <span className="research-card-meta">{node.year}</span>
                    <div className="research-card-icon-small">
                      <i className="bi bi-calendar3"></i>
                    </div>
                  </div>
                  {node.title && <h4 className="research-card-title">{node.title}</h4>}
                  <p className="research-card-desc">{node.desc}</p>
                </div>
              </div>
            ))}
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
                Experience Engineering Across Every Discipline
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
                      Intra-department hackathons, coding face-offs, and tech quizzes testing core knowledge.
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

            <div
              ref={rightColRef}
              className="col-lg-6 sdg-interactive-wrap"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="sdg-center-glow"></div>
              <div ref={logoContainerRef} className="sdg-svg-ring">
                {isDarkTheme ? (
                  <GoldLogo className="sdg-gold-logo" />
                ) : (
                  <LightLogo className="sdg-gold-logo" />
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
