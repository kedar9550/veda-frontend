/**
 * useSubEvents.js
 *
 * Custom hook to fetch individual events for a school.
 *
 * ✅ CURRENT: Reads from static subEventsData.js
 * 🔄 TO CONNECT ADMIN PANEL: Replace the useEffect body with:
 *
 *   fetch(`https://your-admin-api.com/api/schools/${schoolId}/events`)
 *     .then(res => res.json())
 *     .then(data => { setSubEvents(data); setLoading(false); })
 *     .catch(err => { setError(err.message); setLoading(false); });
 */

import { useState, useEffect } from 'react';
import { SUB_EVENTS_DATA } from './subEventsData';

export function useSubEvents(schoolId, groupId) {
  const [subEvents, setSubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';
    let isMounted = true;

    setLoading(true);
    setError(null);

    // If groupId is provided, try fetching dynamically from backend
    if (groupId) {
      fetch(`${API_URL}/api/public-events/groups/${groupId}/events`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!isMounted) return;
          if (data.success && Array.isArray(data.events)) {
            const mapped = data.events.map(event => {
              const eventKey = event.eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              
              // Find matching static sub-event data to enrich details (rules, images, overview)
              const staticList = SUB_EVENTS_DATA[schoolId] || [];
              const staticEvent = staticList.find(e => e.id === eventKey || e.title.toLowerCase() === event.eventName.toLowerCase());

              // Coordinator formatted info
              const coordinatorInfo = event.coordinator ? {
                name: event.coordinator.employeeName,
                department: event.coordinator.department,
                designation: event.coordinator.designation,
                role: event.coordinator.roleAssigned
              } : null;

              if (staticEvent) {
                return {
                  ...staticEvent,
                  _id: event._id,
                  title: event.eventName,
                  coordinator: coordinatorInfo,
                };
              }

              // Fallback default details for newly added events from the admin panel
              return {
                id: eventKey,
                _id: event._id,
                title: event.eventName,
                tagline: 'Technical Competitions & Challenges',
                description: `Participate in ${event.eventName} organized by the department.`,
                image: `/events/${schoolId}.png`, // Default to school image
                date: '2025-10-15',
                time: '10:00 AM',
                venue: 'Campus Block',
                prize: '₹10,000',
                teamSize: '2–4',
                category: 'Competition',
                categoryColor: '#3b82f6',
                registrationLink: '#',
                isOpen: true,
                overview: `A premier event coordinated by ${coordinatorInfo?.name || 'faculty'}. Test your skills against the best minds in the country.`,
                rules: [
                  'Participants must register in advance.',
                  'Strict adherence to schedule is required.',
                  'Decisions of the judges and coordinators are final.'
                ],
                registrationFee: 'Free registration',
                coordinator: coordinatorInfo
              };
            });
            setSubEvents(mapped);
          } else {
            throw new Error('API request succeeded but returned invalid format');
          }
          setLoading(false);
        })
        .catch(err => {
          console.warn(`Backend API offline for groupId ${groupId}. Falling back to static SUB_EVENTS_DATA.`, err.message);
          if (!isMounted) return;
          setSubEvents(SUB_EVENTS_DATA[schoolId] ?? []);
          setLoading(false);
        });
    } else {
      // Direct static loading
      const timer = setTimeout(() => {
        if (!isMounted) return;
        setSubEvents(SUB_EVENTS_DATA[schoolId] ?? []);
        setLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    }

    return () => {
      isMounted = false;
    };
  }, [schoolId, groupId]);

  return { subEvents, loading, error };
}
