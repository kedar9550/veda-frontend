import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Poster() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create ScrollTrigger timeline for the Apple-style mask expand + zoom
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'bottom 40%',
          scrub: 1, // Smooth scrolling scrub
          onUpdate: (self) => {
            // Reveal card when scroll reaches 65% of the zoom animation
            if (self.progress > 0.65) {
              setShowCard(true);
            } else {
              setShowCard(false);
            }
          },
        },
      });

      tl.to(imgRef.current, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        scale: 1,
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="campus" className="campus-section">
      <div className="container-premium text-center">
        <span className="campus-header-tag">Veda Poster</span>
        <h2 className="campus-title text-gradient">
          Explore Aditya's Veda Events
        </h2>
      </div>

      {/* Full-width scroll zoom container */}
      <div ref={containerRef} className="campus-zoom-container">
        <img
          ref={imgRef}
          className="campus-zoom-img"
          src="/campus_showcase.png"
          alt="Aditya University Smart Campus"
          loading="lazy"
        />

        {/* Shadow Overlay */}
        <div className="campus-img-overlay"></div>

        {/* Info card that slides into view */}
        <div className={`campus-overlay-card ${showCard ? 'visible' : ''}`}>
          <h3 className="campus-overlay-title">An Environment Designed for Excellence</h3>
          <p className="campus-overlay-desc">
            Nestled across 180 acres of lush greenery, our carbon-neutral smart campus includes
            sustainable solar grids, ultra-high-speed fiber networks, state-of-the-art sports stadiums,
            and a central digital knowledge library.
          </p>

          {/* Quick specs lists */}
          <div className="campus-specs">
            <div className="campus-spec-item">
              <i className="bi bi-tree-fill"></i>
              <span>180+ Acres Greenery</span>
            </div>
            <div className="campus-spec-item">
              <i className="bi bi-lightning-charge-fill"></i>
              <span>100% Solar Powered</span>
            </div>
            <div className="campus-spec-item">
              <i className="bi bi-book-fill"></i>
              <span>Digital Library (24/7)</span>
            </div>
            <div className="campus-spec-item">
              <i className="bi bi-activity"></i>
              <span>Olympic-Grade Arena</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
