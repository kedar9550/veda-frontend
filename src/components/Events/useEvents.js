/**
 * useEvents.js
 * 
 * Custom hook to supply events data to the Events component.
 * 
 * ✅ CURRENT: Returns static data from eventsData.js
 * 🔄 TO CONNECT ADMIN PANEL: Replace the useEffect body with:
 * 
 *   fetch('https://your-admin-api.com/api/events')
 *     .then(res => res.json())
 *     .then(data => { setEvents(data); setLoading(false); })
 *     .catch(err => { setError(err.message); setLoading(false); });
 */

import { useState, useEffect } from 'react';
import { EVENTS_DATA } from './eventsData';

const DEPT_META = {
  krishi: {
    tagline: 'Roots of Innovation',
    image: '/events/krishi.png',
    organizerIcon: 'bi-tree-fill',
    accentColor: '#22c55e',
    category: 'Agriculture',
    likes: 3432
  },
  techno: {
    tagline: 'Engineer the Future',
    image: '/events/techno.png',
    organizerIcon: 'bi-cpu-fill',
    accentColor: '#3b82f6',
    category: 'Technology',
    likes: 5218
  },
  pharma: {
    tagline: 'Molecules of Tomorrow',
    image: '/events/pharma.png',
    organizerIcon: 'bi-capsule',
    accentColor: '#a855f7',
    category: 'Pharmacy',
    likes: 2187
  },
  scientia: {
    tagline: 'Discover the Unknown',
    image: '/events/scientia.png',
    organizerIcon: 'bi-calculator-fill',
    accentColor: '#f59e0b',
    category: 'Science',
    likes: 1893
  },
  entrix: {
    tagline: 'Lead. Innovate. Succeed.',
    image: '/events/entrix.png',
    organizerIcon: 'bi-briefcase-fill',
    accentColor: '#f97316',
    category: 'Management',
    likes: 4102
  }
};

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
    let isMounted = true;

    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/public-events/fests/VEDA 2026/groups`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.groups)) {
          const mapped = data.groups.map(group => {
            const key = group.groupName.toLowerCase();
            const meta = DEPT_META[key] || {
              tagline: 'Department Fest',
              image: '/events/techno.png',
              organizerIcon: 'bi-grid',
              accentColor: '#6366f1',
              category: group.groupName,
              likes: 1000
            };
            return {
              _id: group._id, // MongoDB Object ID
              id: key,       // krishi, techno, etc.
              title: group.groupName,
              tagline: meta.tagline,
              image: meta.image,
              organizer: group.majorEventAdmin?.employeeName || 'Faculty Coordinator',
              organizerIcon: meta.organizerIcon,
              likes: meta.likes,
              eventCount: 0, // Will be filled dynamically by component or sub-events lookup
              category: meta.category,
              accentColor: meta.accentColor,
              isActive: true
            };
          });
          setEvents(mapped);
        } else {
          throw new Error('API request succeeded but returned invalid format');
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend API offline. Falling back to static EVENTS_DATA.', err.message);
        if (!isMounted) return;
        // Fallback to static events
        setEvents(EVENTS_DATA.filter(e => e.isActive));
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { events, loading, error };
}
