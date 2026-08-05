/**
 * useEvents.js
 * 
 * Custom hook to supply events data to the Events component.
 * 
 * ✅ CURRENT: Returns static data from eventsData.js
 * 🔄 TO CONNECT ADMIN PANEL: Replace the useEffect body with:
 * 
 *   // If your backend uses /api/events as shown in the route reference:
 *   fetch('https://your-admin-api.com/api/events')
 *     .then(res => res.json())
 *     .then(data => { setEvents(data); setLoading(false); })
 *     .catch(err => { setError(err.message); setLoading(false); });
 *
 *   // If /api/events is protected by auth, configure:
 *   // VITE_API_TOKEN=your_token_here
 */

import { useState, useEffect } from 'react';
import aimlMcaImg from '../../assets/event-thumbnails/AIML & MCA.png';
import civilImg from '../../assets/event-thumbnails/Civil.png';
import digiImg from '../../assets/event-thumbnails/DIGI.png';
import eceImg from '../../assets/event-thumbnails/ECE.png';
import eeeImg from '../../assets/event-thumbnails/EEE.png';
import fsImg from '../../assets/event-thumbnails/FS.png';
import krishiImg from '../../assets/event-thumbnails/Krishi.png';
import kriyaImg from '../../assets/event-thumbnails/Kriya.png';
import mechImg from '../../assets/event-thumbnails/Mech.png';
import minEImg from '../../assets/event-thumbnails/Min.E.png';
import ptImg from '../../assets/event-thumbnails/PT.png';
import schoolOfBusinessImg from '../../assets/event-thumbnails/School of Business.png';

const THUMBNAIL_MAP = {
  'aiml': aimlMcaImg,
  'mca': aimlMcaImg,
  'aiml-mca': aimlMcaImg,
  'aiml-and-mca': aimlMcaImg,
  'aiml-&-mca': aimlMcaImg,
  'civil': civilImg,
  'civil-engineering': civilImg,
  'digi': digiImg,
  'cse': digiImg,
  'computer-science': digiImg,
  'computer-science-and-engineering': digiImg,
  'ece': eceImg,
  'electronics': eceImg,
  'electronics-and-communication-engineering': eceImg,
  'eee': eeeImg,
  'electrical': eeeImg,
  'electrical-and-electronics-engineering': eeeImg,
  'fs': fsImg,
  'food-technology': fsImg,
  'food-science': fsImg,
  'krishi': krishiImg,
  'agriculture': krishiImg,
  'agri': krishiImg,
  'kriya': kriyaImg,
  'it': kriyaImg,
  'iot': kriyaImg,
  'ds': kriyaImg,
  'it-iot-ds': kriyaImg,
  'it-iot-and-ds': kriyaImg,
  'mech': mechImg,
  'mechanical': mechImg,
  'mechanical-engineering': mechImg,
  'min-e': minEImg,
  'min.e': minEImg,
  'mining': minEImg,
  'mining-engineering': minEImg,
  'pt': ptImg,
  'petroleum': ptImg,
  'petroleum-technology': ptImg,
  'school-of-business': schoolOfBusinessImg,
  'business': schoolOfBusinessImg,
  'management': schoolOfBusinessImg,
  'entrix': schoolOfBusinessImg,
  'mba': schoolOfBusinessImg,
  'bba': schoolOfBusinessImg
};

function getThumbnailForName(name) {
  if (!name) return null;
  const slug = String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (THUMBNAIL_MAP[slug]) {
    return THUMBNAIL_MAP[slug];
  }
  for (const [key, val] of Object.entries(THUMBNAIL_MAP)) {
    if (slug.includes(key) || key.includes(slug)) {
      return val;
    }
  }
  return null;
}


function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (import.meta.env.DEV) {
    return configuredUrl ? configuredUrl.replace(/\/$/, '') : 'http://localhost:9022';
  }
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

function getEventId(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeTeamSize(entry) {
  const rawValues = [
    entry.teamSize,
    entry.maxTeamSize,
    entry.max_team_size,
    entry.registrationTeamSize,
    entry.registrationTeamSizeLimit,
    entry.teamSizeLimit,
    entry.teamSizeRange,
    entry.team_size,
    entry.maximumTeamSize,
    entry.maximum_team_size,
    entry.maxTeams,
    entry.max_team,
    entry.team_capacity,
    entry.maxParticipants,
    entry.max_participants,
    entry.participants,
    entry.participantCount,
    entry.participant_count,
    entry.size,
  ];

  for (const value of rawValues) {
    if (value === undefined || value === null || value === '') continue;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    if (typeof value === 'object') {
      if ('min' in value && 'max' in value) {
        return `${value.min}-${value.max}`;
      }
      if ('from' in value && 'to' in value) {
        return `${value.from}-${value.to}`;
      }
    }
  }

  if (entry.teamMin && entry.teamMax) {
    return `${entry.teamMin}-${entry.teamMax}`;
  }

  return '';
}

function formatFeeValue(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') return `₹${value}`;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    // If string already contains a currency symbol or non-numeric characters, return as-is
    if (/[^0-9.,\s-]/.test(trimmed)) return trimmed;
    // Otherwise treat as a plain number and prefix with currency symbol
    return `₹${trimmed}`;
  }
  return String(value);
}

function extractEventItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.groups)) return payload.groups;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.events)) return payload.data.events;
  if (Array.isArray(payload?.data?.groups)) return payload.data.groups;
  if (Array.isArray(payload?.results)) return payload.results;
  if (payload && typeof payload === 'object') {
    const nested = payload.data && typeof payload.data === 'object' ? payload.data : null;
    if (Array.isArray(nested?.events)) return nested.events;
    if (Array.isArray(nested?.groups)) return nested.groups;
  }
  return [];
}

function formatDepartment(entry) {
  if (entry.department) {
    return entry.department.replace(/,\s*/g, ' & ');
  }
  if (entry.group && Array.isArray(entry.group.department)) {
    return entry.group.department.map(d => d?.name).join(' & ');
  }
  if (entry.group && entry.group.department && entry.group.department.name) {
    return entry.group.department.name;
  }
  return '';
}

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

let globalEvents = null;
let globalGroups = null;
let globalError = null;
let globalLoading = true;
let isFetching = false;
const subscribers = new Set();

function updateSubscribers() {
  subscribers.forEach(sub => {
    sub({
      events: globalEvents || [],
      groups: globalGroups || [],
      error: globalError,
      loading: globalLoading
    });
  });
}

export function useEvents() {
  const [state, setState] = useState({
    events: globalEvents || [],
    groups: globalGroups || [],
    error: globalError,
    loading: globalLoading
  });

  useEffect(() => {
    let isMounted = true;
    const sub = (newState) => {
      if (isMounted) setState(newState);
    };
    subscribers.add(sub);

    if (globalLoading && !isFetching) {
      isFetching = true;
      const API_URL = getApiBaseUrl();
      const endpoints = [
        '/api/events',
        import.meta.env.VITE_EVENTS_ENDPOINT?.trim() || '/api/events',
        '/api/public-events/fests/VEDA 2026/groups',
        '/api/public-events/groups',
        '/api/public-events'
      ];

      const tryFetch = async () => {
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
              headers: getAuthHeaders(),
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }

            const payload = await response.json();
            const items = extractEventItems(payload);

            if (items.length > 0) {
              const mappedEvents = items.map((entry) => {
                const groupName = entry.group?.name || entry.groupName || entry.department || 'General';
                const groupSlug = getEventId(groupName);
                const groupId = entry.group?._id || entry.groupId || groupSlug;
                const eventName = entry.eventName || entry.title || entry.name || 'Event';
                const key = getEventId(eventName);

                const meta = DEPT_META[getEventId(groupName)] || {
                  tagline: entry.overview ? entry.overview.slice(0, 120) : 'Department Fest',
                  image: entry.bannerImage || entry.image || '/events/techno.png',
                  organizerIcon: entry.organizerIcon || 'bi-grid',
                  accentColor: entry.accentColor || '#6366f1',
                  category: groupName,
                  likes: entry.likes || 1000
                };

                const organizer = entry.facultyCoordinator?.employeeName
                  || entry.facultyCoordinators?.[0]?.employeeName
                  || entry.department
                  || entry.organizer
                  || 'Faculty Coordinator';

                const eventOverview = entry.overview || entry.description || entry.summary || entry.tagline || '';
                const eventVenue = entry.venue || entry.location || entry.venueLocation || '';
                const eventRules = Array.isArray(entry.rules) ? entry.rules : entry.rules ? [entry.rules] : [];
                const registrationLink = entry.registrationLink || entry.registrationUrl || entry.registration || '';
                const rawFee = entry.registrationFee ?? entry.fee ?? entry.feeAmount ?? entry.fees ?? entry.price ?? '';
                const feeText = formatFeeValue(rawFee) || '';
                const feeAmount = rawFee;
                const participants = entry.participants || entry.participation || entry.attendees || entry.attendeeCount || 0;
                const teamSize = normalizeTeamSize(entry);
                const registeredStudents = entry.registeredStudents || entry.usersRegistered || entry.studentCount || entry.registrations || 0;
                const categoryColor = entry.categoryColor || entry.accentColor || meta.accentColor;
                const formattedDepartment = formatDepartment(entry);
                const rawCoordinator = entry.coordinator || entry.facultyCoordinator || entry.facultyCoordinators?.[0] || null;
                const eventCoordinator = rawCoordinator ? {
                  name: rawCoordinator.employeeName || rawCoordinator.name || rawCoordinator.fullName || null,
                  department: rawCoordinator.department || rawCoordinator.dept || null,
                  designation: rawCoordinator.designation || rawCoordinator.role || null,
                  employeeCode: rawCoordinator.employeeCode || rawCoordinator.employeeId || rawCoordinator.id || rawCoordinator._id || ''
                } : null;
                const eventDate = entry.date || entry.eventDate || '';
                const eventTime = entry.time || entry.eventTime || '';

                return {
                  feeAmount,
                  feeText,
                  participants,
                  registeredStudents,
                  _id: entry._id || entry.id,
                  id: key || getEventId(entry._id || entry.id || eventName),
                  title: eventName,
                  tagline: eventOverview ? eventOverview.slice(0, 120) : meta.tagline,
                  description: entry.description || eventOverview || meta.tagline,
                  image: getThumbnailForName(groupName) || getThumbnailForName(entry.department) || getThumbnailForName(eventName) || entry.bannerImage || entry.image || meta.image,
                  organizer,
                  organizerIcon: meta.organizerIcon,
                  likes: entry.likes || meta.likes,
                  eventCount: 1,
                  category: formattedDepartment || entry.category || meta.category,
                  accentColor: entry.accentColor || meta.accentColor,
                  categoryColor,
                  isOpen: entry.isOpen !== false,
                  isActive: entry.isActive !== false,
                  date: eventDate,
                  time: eventTime,
                  venue: eventVenue,
                  registrationLink,
                  overview: eventOverview,
                  rules: eventRules,
                  teamSize,
                  coordinator: eventCoordinator,
                  groupId,
                  groupName,
                  groupSlug,
                  groupCategory: meta.category,
                  groupImage: getThumbnailForName(groupName) || getThumbnailForName(entry.department) || entry.group?.image || entry.group?.bannerImage || entry.bannerImage || entry.image || meta.image,
                  groupTagline: entry.group?.tagline || formattedDepartment || entry.group?.description || meta.tagline,
                  raw: entry
                };
              });

              const groupMap = new Map();
              mappedEvents.forEach((event) => {
                const slug = event.groupSlug;
                if (!groupMap.has(slug)) {
                  groupMap.set(slug, {
                    id: slug,
                    _id: event.groupId,
                    title: event.groupName,
                    tagline: event.groupTagline || event.tagline || event.groupCategory,
                    organizer: event.category,
                    organizerIcon: event.organizerIcon,
                    likes: event.likes,
                    eventCount: 0,
                    category: event.category,
                    accentColor: event.accentColor,
                    image: event.groupImage || event.image,
                    isActive: true,
                  });
                }
                const group = groupMap.get(slug);
                group.eventCount += 1;
                group.likes = Math.max(group.likes, event.likes || 0);
              });

              globalEvents = mappedEvents;
              globalGroups = Array.from(groupMap.values());
              globalLoading = false;
              globalError = null;
              updateSubscribers();
              return;
            }
          } catch (err) {
            console.warn(`Failed to load events from ${endpoint}`, err.message);
          }
        }

        globalEvents = [];
        globalGroups = [];
        globalLoading = false;
        globalError = 'Failed to fetch events from backend';
        updateSubscribers();
      };

      tryFetch();
    }

    return () => {
      isMounted = false;
      subscribers.delete(sub);
    };
  }, []);

  return state;
}
