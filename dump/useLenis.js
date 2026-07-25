import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12, // Linear interpolation (0.1 - 0.15 is standard for premium, fast, responsive scroll)
      smoothWheel: true,
      smoothTouch: false,
    });

    // Provide lenis instance to window for global access
    window.lenis = lenis;

    // Connect Lenis to GSAP ScrollTrigger for real-time updates ONLY on scroll events
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    let rafId;
    function raf(time) {
      // Use absolute requestAnimationFrame timestamp for smooth calculations
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);
}
