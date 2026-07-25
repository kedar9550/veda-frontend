import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const GALLERY_DATA = [
  {
    id: 1,
    tag: 'Campus Life',
    title: 'Aditya Convocation Ceremony',
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
    sizeClass: 'item-tall',
  },
  {
    id: 2,
    tag: 'Research',
    title: 'Robotics & Automation Lab',
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
    sizeClass: 'item-wide',
  },
  {
    id: 3,
    tag: 'Academic Events',
    title: 'Global Hackathon Arena',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
    sizeClass: '',
  },
  {
    id: 4,
    tag: 'Digital Learning',
    title: 'Integrated Knowledge Center',
    img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop',
    sizeClass: '',
  },
  {
    id: 5,
    tag: 'Athletics',
    title: 'Annual Sports Championships',
    img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    sizeClass: 'item-wide',
  },
  {
    id: 6,
    tag: 'Campus View',
    title: 'Sunset Garden Walkways',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop',
    sizeClass: 'item-tall',
  },
];

export default function Gallery() {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger reveal the Pinterest items
      gsap.to(itemsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="gallery-section">
      <div className="container-premium">
        
        {/* Section Header */}
        <span className="gallery-header-tag text-center">Moments</span>
        <h2 className="gallery-title text-center text-gradient">
          Life at Aditya University
        </h2>

        {/* Masonry Grid */}
        <div className="gallery-grid">
          {GALLERY_DATA.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (itemsRef.current[index] = el)}
              className={`gallery-item ${item.sizeClass}`}
            >
              {/* Image */}
              <img
                className="gallery-img"
                src={item.img}
                alt={item.title}
                loading="lazy"
              />

              {/* Reveal Hover Overlay */}
              <div className="gallery-item-overlay">
                <span className="gallery-item-tag">{item.tag}</span>
                <h4 className="gallery-item-title">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
