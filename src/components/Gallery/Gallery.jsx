import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Gallery() {
  const sectionRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const images = [
    'DSC_2229.JPG', 'DSC_2231.JPG', 'DSC_2253.JPG', 'DSC_2254.JPG',
    'DSC_2262.JPG', 'DSC_2312.JPG', 'DSC_2318.JPG', 'DSC_2327.JPG',
    'DSC_2346.JPG', 'DSC_2353.JPG', 'DSC_2395.JPG', 'DSC_2401.JPG',
    'DSC_2510.JPG', 'DSC_2514.JPG', 'DSC_2519.JPG', 'DSC_2544.JPG',
    'DSC_2559.JPG', 'DSC_2567.JPG', 'DSC_2576.JPG', 'DSC_2614.JPG',
    'DSC_2641.JPG', 'DSC_2663.JPG', 'DSC_2698.JPG', 'DSC_2778.JPG',
    'DSC_2804.JPG'
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gallery-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 85%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Disable body scroll when lightbox is open
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedImageIndex]);

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section ref={sectionRef} id="gallery" className="campus-section gallery-page-section">
      <div className="container-premium text-center">
        <span className="campus-header-tag">Memories & Highlights</span>
        <h2 className="campus-title text-gradient" style={{ marginTop: '0.5rem' }}>
          Veda Event Gallery
        </h2>
        <p className="gallery-subtitle">
          Relive the best moments of ideas, talent, and excellence.
        </p>
      </div>

      <div className="container-premium mt-4">
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-item" onClick={() => setSelectedImageIndex(idx)}>
              <img src={`/Gallery/${img}`} alt={`Veda Gallery ${idx + 1}`} loading="lazy" />
              <div className="gallery-overlay">
                <i className="bi bi-arrows-fullscreen"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setSelectedImageIndex(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImageIndex(null)}>
            <i className="bi bi-x-lg"></i>
          </button>

          <button className="lightbox-nav lightbox-prev" onClick={prevImage}>
            <i className="bi bi-chevron-left"></i>
          </button>

          <img
            src={`/Gallery/${images[selectedImageIndex]}`}
            alt={`Enlarged Gallery ${selectedImageIndex + 1}`}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          <button className="lightbox-nav lightbox-next" onClick={nextImage}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </section>
  );
}
