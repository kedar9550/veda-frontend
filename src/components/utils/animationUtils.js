import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


/**
 * Apply magnetic hover effect to a button/element
 * @param {HTMLElement} element - The element to pull
 * @param {HTMLElement} parent - Optional parent to increase trigger area
 * @param {number} strength - Magnetic pull strength (default 0.3)
 */
export const applyMagneticEffect = (element, parent = null, strength = 0.35) => {
  if (!element) return;

  if (typeof parent === 'number') {
    strength = parent;
    parent = null;
  }

  const trigger = parent || element;
  if (!trigger || typeof trigger.addEventListener !== 'function') return;

  const onMouseMove = (e) => {
    const rect = trigger.getBoundingClientRect();
    const triggerX = e.clientX - rect.left - rect.width / 2;
    const triggerY = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: triggerX * strength,
      y: triggerY * strength,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    });
  };

  trigger.addEventListener('mousemove', onMouseMove);
  trigger.addEventListener('mouseleave', onMouseLeave);

  return () => {
    trigger.removeEventListener('mousemove', onMouseMove);
    trigger.removeEventListener('mouseleave', onMouseLeave);
  };
};

/**
 * Apply a 3D tilt effect to a card on hover
 * @param {HTMLElement} element - Card element
 * @param {number} maxRotation - Maximum tilt rotation in degrees
 */
export const apply3DTilt = (element, maxRotation = 12) => {
  if (!element) return;

  const onMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = ((yc - y) / yc) * maxRotation; // up-down tilt
    const angleY = ((x - xc) / xc) * maxRotation; // left-right tilt

    gsap.to(element, {
      rotateX: angleX,
      rotateY: angleY,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.4,
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      rotateX: 0,
      rotateY: 0,
      ease: 'power3.out',
      duration: 0.6,
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
};
