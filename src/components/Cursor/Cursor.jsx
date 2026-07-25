import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorDotRef = useRef(null);
  const cursorFollowerRef = useRef(null);

  useEffect(() => {
    const dot = cursorDotRef.current;
    const follower = cursorFollowerRef.current;
    if (!dot || !follower) return;

    // Track mouse coords
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Use left/top so we don't conflict with CSS transform: translate(-50%,-50%)
    const setDotLeft   = gsap.quickSetter(dot,      'left', 'px');
    const setDotTop    = gsap.quickSetter(dot,      'top',  'px');
    const setRingLeft  = gsap.quickSetter(follower, 'left', 'px');
    const setRingTop   = gsap.quickSetter(follower, 'top',  'px');

    // Position both at current mouse location immediately
    const init = () => {
      setDotLeft(mouse.x);
      setDotTop(mouse.y);
      setRingLeft(mouse.x);
      setRingTop(mouse.y);
    };
    init();

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Reveal on first move
      gsap.to([dot, follower], { opacity: 1, duration: 0.3, overwrite: 'auto' });
    };

    const onMouseLeave = () => {
      gsap.to([dot, follower], { opacity: 0, duration: 0.3, overwrite: 'auto' });
    };

    // Smooth lag for follower ring
    const tick = () => {
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;

      setDotLeft(mouse.x);
      setDotTop(mouse.y);
      setRingLeft(pos.x);
      setRingTop(pos.y);
    };

    gsap.ticker.add(tick);

    // Hover expand on interactive elements
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .btn, [role="button"], input, select, textarea')) {
        dot.classList.add('hovered');
        follower.classList.add('hovered');
      }
    };
    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, .btn, [role="button"], input, select, textarea')) {
        dot.classList.remove('hovered');
        follower.classList.remove('hovered');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={cursorDotRef} className="custom-cursor" />
      <div ref={cursorFollowerRef} className="custom-cursor-follower" />
    </>
  );
}
