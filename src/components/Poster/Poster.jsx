import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Poster() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'bottom 40%',
          scrub: 1,
        },
      });

      tl.fromTo(imgRef.current, {
        scale: 0.95,
        opacity: 0.9,
      }, {
        scale: 1,
        opacity: 1,
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

      {/* Full-width scroll zoom container inside container-premium for side alignment */}
      <div className="container-premium">
        <div ref={containerRef} className="campus-zoom-container">
          <img
            ref={imgRef}
            className="campus-zoom-img"
            src="/campus_showcase.jpeg"
            alt="Aditya University Smart Campus"
          />
        </div>
      </div>
    </section>
  );
}
