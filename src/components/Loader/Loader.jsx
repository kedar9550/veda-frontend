import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
const WORDS = ["INNOVATE", "EXCEL", "LEAD", "RESEARCH", "INNOVATE",
  "PIONEER",
  "DISCOVER",
  "CREATE",
  "IGNITE",
  "TRANSFORM",
  "CATALYZE",
  "BREAKTHROUGH",
  "FUTURE",
  "IMPACT", "ADITYA UNIVERSITY", "VEDA"];

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const circleRef = useRef(null);

  const activeWordRef = useRef('');
  const scrambleTimerRef = useRef(null);

  // Animate progress percentage
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate progress state
      const progressObj = { value: 0 };
      gsap.to(progressObj, {
        value: 100,
        duration: 4,
        ease: 'power2.out',
        onUpdate: () => {
          const currentVal = Math.floor(progressObj.value);
          setProgress(currentVal);

          // Animate SVG circle dashoffset
          // Circle radius is 45, perimeter is 282.7. Map 0-100 to 283-0
          if (circleRef.current) {
            const offset = 283 - (currentVal / 100) * 283;
            gsap.set(circleRef.current, { strokeDashoffset: offset });
          }
        },
        onComplete: () => {
          // Slide loader up and out
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1,
            ease: 'power4.inOut',
            onComplete: () => {
              if (onComplete) onComplete();
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, [onComplete]);

  // Scramble and cycle text based on progress
  useEffect(() => {
    let targetWord = '';
    if (progress >= 92) {
      targetWord = 'VEDA';
    } else if (progress >= 70) {
      targetWord = 'ADITYA UNIVERSITY';
    } else {
      // For progress 0 to 69, map to index 0 to 13 of the first 14 words
      const subWords = WORDS.slice(0, 14);
      const index = Math.min(
        Math.floor((progress / 70) * subWords.length),
        subWords.length - 1
      );
      targetWord = subWords[index];
    }

    if (targetWord !== activeWordRef.current) {
      activeWordRef.current = targetWord;

      const chars = '!@#$%^&*()_+{}:"<>?|[];\',./~`ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let iteration = 0;

      if (scrambleTimerRef.current) {
        clearInterval(scrambleTimerRef.current);
      }

      scrambleTimerRef.current = setInterval(() => {
        const scrambled = targetWord
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return targetWord[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        setCurrentWord(scrambled);

        if (iteration >= targetWord.length) {
          clearInterval(scrambleTimerRef.current);
        }
        
        // Make longer words resolve faster so they are readable sooner
        const step = targetWord.length > 10 ? 0.8 : 0.4;
        iteration += step;
      }, 30);
    }
  }, [progress]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (scrambleTimerRef.current) {
        clearInterval(scrambleTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="loader-container">
      <div className="loader-glow-bg"></div>

      <div className="loader-svg-wrap">
        <svg viewBox="0 0 100 100">
          <defs>
            <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
          <circle className="loader-circle-bg" cx="50" cy="50" r="45" />
          <circle
            ref={circleRef}
            className="loader-circle-draw"
            cx="50"
            cy="50"
            r="45"
          />
        </svg>
        <div className="loader-logo-initial">A</div>
      </div>

      <div ref={textRef} className="loader-text">
        {currentWord}
      </div>

      <div className="loader-progress-val">{progress}%</div>
    </div>
  );
}
