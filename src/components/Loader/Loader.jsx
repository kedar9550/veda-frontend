import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
const WORDS = ["INNOVATE", "EXCEL", "LEAD", "RESEARCH", "ADITYA UNIVERSITY"];

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const circleRef = useRef(null);

  // Animate progress percentage
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate progress state
      const progressObj = { value: 0 };
      gsap.to(progressObj, {
        value: 100,
        duration: 3,
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

  // Scramble and cycle text
  useEffect(() => {
    let wordIndex = 0;
    let frame = 0;
    let timer;

    const scrambleText = (targetWord) => {
      const chars = '!@#$%^&*()_+{}:"<>?|[];\',./~`ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let iteration = 0;
      clearInterval(timer);

      timer = setInterval(() => {
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
          clearInterval(timer);
        }
        iteration += 1 / 3;
      }, 30);
    };

    // Initial word
    scrambleText(WORDS[0]);

    // Word cycling timer matching progress (3 seconds split)
    const cycleInterval = setInterval(() => {
      wordIndex++;
      if (wordIndex < WORDS.length) {
        scrambleText(WORDS[wordIndex]);
      } else {
        clearInterval(cycleInterval);
      }
    }, 600);

    return () => {
      clearInterval(timer);
      clearInterval(cycleInterval);
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
