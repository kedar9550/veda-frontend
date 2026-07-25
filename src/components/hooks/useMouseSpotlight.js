import { useEffect, useRef } from 'react';

export default function useMouseSpotlight(active = true) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e) => {
      const el = elementRef.current || document.documentElement;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    };

    const target = elementRef.current || window;
    target.addEventListener('mousemove', handleMouseMove);

    return () => {
      target.removeEventListener('mousemove', handleMouseMove);
    };
  }, [active]);

  return elementRef;
}
