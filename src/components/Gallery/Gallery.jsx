import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function Gallery() {
  const sectionRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const images = [
    'DSC_2254_result.webp',
    'DSC_2312_result.webp',
    'DSC_2327_result.webp',
    'DSC_2514_result.webp',
    'DSC_2544_result.webp',
    'DSC_2559_result.webp',
    'DSC_2567_result.webp',
    'DSC_2576_result.webp',
    'DSC_2614_result.webp',
    'DSC_2663_result.webp',
    'DSC_2698_result.webp',
    'DSC_2778_result.webp'
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

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    if (!currentSrc.includes('_result.webp')) {
      e.target.src = currentSrc.replace(/\.(JPG|jpg|jpeg|png)$/i, '_result.webp');
    }
  };

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
      <div className="container-premium text-center" style={{ textAlign: 'center' }}>
        <span className="campus-header-tag" style={{ textAlign: 'center' }}>Memories & Highlights</span>
        <h2 className="campus-title text-gradient" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          Veda Event Gallery
        </h2>
        <p className="gallery-subtitle" style={{ textAlign: 'center' }}>
          Relive the best moments of ideas, talent, and excellence.
        </p>
      </div>

      <div className="container-premium mt-4">
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <div key={idx} className="gallery-item" onClick={() => setSelectedImageIndex(idx)}>
              <img
                src={`/Gallery/${img}`}
                alt={`Veda Gallery ${idx + 1}`}
                loading="lazy"
                onError={handleImageError}
              />
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
            onError={handleImageError}
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
