import React, { useEffect, useRef, useState } from 'react';
import './MobileParallaxCard.css';

/**
 * MobileParallaxCard Component
 * 
 * Ultra-optimized, lightweight React component for mobile viewports (<768px).
 * Applies a 60 FPS GPU-accelerated Parallax Depth Effect to a single targeted card background.
 *
 * Props:
 * - imageSrc (string): Background / image URL
 * - alt (string): Accessible image label
 * - badge (string): Top badge tag (optional)
 * - title (string|node): Main card heading
 * - subtitle (string|node): Card subtitle or meta
 * - description (string|node): Body text description
 * - children (node): Additional custom overlay markup
 * - className (string): Extra class names
 * - intensity (number): Parallax depth factor (default 0.12, clamped -10% to 10%)
 * - aspectRatio (string): Container aspect ratio CSS value (e.g. '16/9', '4/3', 'auto')
 * - onClick (func): Card click handler
 */
export default function MobileParallaxCard({
  imageSrc,
  alt = 'Card Showcase',
  badge,
  title,
  subtitle,
  description,
  children,
  className = '',
  intensity = 0.12,
  aspectRatio = 'auto',
  onClick,
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if viewport is mobile (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Apply parallax ONLY on mobile viewports (< 768px)
    if (!isMobile || !containerRef.current || !imageRef.current) return;

    let ticking = false;
    let isVisible = false;

    const updateParallax = () => {
      if (!containerRef.current || !imageRef.current || !isVisible) {
        ticking = false;
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Calculate position relative to viewport center (-1 to 1)
      const centerY = rect.top + rect.height / 2;
      const normalizedScroll = (centerY - windowHeight / 2) / (windowHeight / 2);

      // Clamp translation offset strictly between -10% and 10% (-14px to +14px max)
      const maxOffsetPx = 14;
      const rawOffset = normalizedScroll * maxOffsetPx * (intensity / 0.12);
      const clampedOffset = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, rawOffset));

      // Use translate3d for 60 FPS GPU hardware acceleration (4GB RAM safe)
      imageRef.current.style.transform = `translate3d(0, ${clampedOffset.toFixed(2)}px, 0) scale(1.08)`;

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking && isVisible) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Activate scroll listener ONLY when card is in viewport via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            updateParallax();
            window.addEventListener('scroll', handleScroll, { passive: true });
          } else {
            window.removeEventListener('scroll', handleScroll);
            if (imageRef.current) {
              imageRef.current.style.transform = 'translate3d(0, 0, 0) scale(1.05)';
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, intensity]);

  return (
    <div
      ref={containerRef}
      className={`mobile-parallax-card-wrap ${className}`}
      style={{ aspectRatio: aspectRatio !== 'auto' ? aspectRatio : undefined }}
      onClick={onClick}
    >
      {/* Crop container with overflow hidden */}
      <div className="mobile-parallax-img-box">
        {imageSrc && (
          <img
            ref={imageRef}
            src={imageSrc}
            alt={alt}
            className="mobile-parallax-img"
            loading="lazy"
          />
        )}
        <div className="mobile-parallax-overlay" />
      </div>

      {/* Card Content Overlay */}
      {(badge || title || subtitle || description || children) && (
        <div className="mobile-parallax-content">
          {badge && <span className="mobile-parallax-badge">{badge}</span>}
          {subtitle && <span className="mobile-parallax-subtitle">{subtitle}</span>}
          {title && <h3 className="mobile-parallax-title">{title}</h3>}
          {description && <p className="mobile-parallax-desc">{description}</p>}
          {children}
        </div>
      )}
    </div>
  );
}
