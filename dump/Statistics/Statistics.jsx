import React, { useEffect, useRef } from 'react';
import { animateCounter } from '../utils/animationUtils';
const STATS_DATA = [
  {
    id: 1,
    icon: 'bi-people-fill',
    target: 15000,
    suffix: '+',
    title: 'Active Students',
    desc: 'Diverse community from over 15 nations and 25 states.',
  },
  {
    id: 2,
    icon: 'bi-briefcase-fill',
    target: 98,
    suffix: '%',
    title: 'Placement Success',
    desc: 'Consistent corporate selections across global tech firms.',
  },
  {
    id: 3,
    icon: 'bi-award-fill',
    target: 450,
    suffix: '+',
    title: 'Expert Faculty',
    desc: 'Distinguished research professors and PhD mentors.',
  },
  {
    id: 4,
    icon: 'bi-globe2',
    target: 35,
    suffix: '+',
    title: 'Global Partners',
    desc: 'Strategic student exchanges with premium universities.',
  },
];

export default function Statistics() {
  const elementsRef = useRef([]);

  useEffect(() => {
    // Fire rolling number animations on scroll
    STATS_DATA.forEach((stat, index) => {
      const el = elementsRef.current[index];
      if (el) {
        animateCounter(el, stat.target, 2, stat.suffix);
      }
    });
  }, []);

  return (
    <section className="stats-section">
      <div className="container-premium">
        
        {/* Statistics Grid */}
        <div className="stats-grid">
          {STATS_DATA.map((stat, index) => (
            <div key={stat.id} className="stat-card">
              {/* Icon */}
              <div className="stat-icon">
                <i className={`bi ${stat.icon}`}></i>
              </div>

              {/* Number (Roll-up target) */}
              <div
                ref={(el) => (elementsRef.current[index] = el)}
                className="stat-number"
              >
                0{stat.suffix}
              </div>

              {/* Text */}
              <h4 className="stat-title">{stat.title}</h4>
              <p className="stat-desc">{stat.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
