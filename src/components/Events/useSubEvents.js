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

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  return configuredUrl ? configuredUrl.replace(/\/$/, '') : 'http://localhost:9022';
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = import.meta.env.VITE_API_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function extractEventItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.events)) return payload.data.events;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export function useSubEvents(schoolId, groupId) {
  const [subEvents, setSubEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId) return;

    const API_URL = getApiBaseUrl();
    let isMounted = true;

    setLoading(true);
    setError(null);

    const tryFetch = async () => {
      const endpoints = [];
      if (groupId) {
        endpoints.push(`/api/public-events/groups/${groupId}/events`, `/api/events/${groupId}`, `/api/events`);
      } else {
        endpoints.push('/api/events');
      }

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          const payload = await response.json();
          const events = extractEventItems(payload);

          if (events.length > 0) {
            const mapped = events.map(event => {
              const eventName = event.eventName || event.name || event.title || 'Event';
              const eventKey = String(eventName).toLowerCase().replace(/[^a-z0-9]+/g, '-');

              const staticList = SUB_EVENTS_DATA[schoolId] || [];
              const staticEvent = staticList.find(e => e.id === eventKey || e.title.toLowerCase() === String(eventName).toLowerCase());

              const coordinatorInfo = event.coordinator ? {
                name: event.coordinator.employeeName || event.coordinator.name,
                department: event.coordinator.department,
                designation: event.coordinator.designation,
                role: event.coordinator.roleAssigned || event.coordinator.role
              } : null;

              if (staticEvent) {
                return {
                  ...staticEvent,
                  _id: event._id || event.id,
                  title: eventName,
                  coordinator: coordinatorInfo,
                };
              }

              return {
                id: eventKey,
                _id: event._id || event.id,
                title: eventName,
                tagline: event.tagline || 'Technical Competitions & Challenges',
                description: event.description || `Participate in ${eventName} organized by the department.`,
                image: event.image || `/events/${schoolId}.png`,
                date: event.date || '2025-10-15',
                time: event.time || '10:00 AM',
                venue: event.venue || 'Campus Block',
                prize: event.prize || '₹10,000',
                teamSize: event.teamSize || '2–4',
                category: event.category || 'Competition',
                categoryColor: event.categoryColor || '#3b82f6',
                registrationLink: event.registrationLink || '#',
                isOpen: event.isOpen !== false,
                overview: event.overview || `A premier event coordinated by ${coordinatorInfo?.name || 'faculty'}. Test your skills against the best minds in the country.`,
                rules: event.rules || [
                  'Participants must register in advance.',
                  'Strict adherence to schedule is required.',
                  'Decisions of the judges and coordinators are final.'
                ],
                registrationFee: event.registrationFee || 'Free registration',
                coordinator: coordinatorInfo,
                raw: event
              };
            });

            if (!isMounted) return;
            setSubEvents(mapped);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn(`Failed to load sub-events from ${endpoint}`, err.message);
        }
      }

      if (!isMounted) return;
      setSubEvents(SUB_EVENTS_DATA[schoolId] ?? []);
      setLoading(false);
    };

    tryFetch();

    return () => {
      isMounted = false;
    };
  }, [schoolId, groupId]);

  return { subEvents, loading, error };
}
