/**
 * eventsData.js
 * 
 * Static data source for events — structured to be API-ready.
 * To connect to admin panel: replace this with an API fetch in useEvents.js
 * 
 * Expected API shape (from admin panel):
 * GET /api/events → returns array of objects matching EVENTS_DATA structure
 */

export const EVENTS_DATA = [
  {
    id: 'krishi',
    title: 'KRISHI',
    tagline: 'Roots of Innovation',
    image: '/events/krishi.png',
    organizer: 'AGRICULTURE',
    organizerIcon: 'bi-tree-fill',
    likes: 3432,
    eventCount: 8,
    category: 'Agriculture',
    accentColor: '#22c55e',
    registrationLink: '#',
    isActive: true,
  },
  {
    id: 'techno',
    title: 'TECHNO',
    tagline: 'Engineer the Future',
    image: '/events/techno.png',
    organizer: 'ENGINEERING',
    organizerIcon: 'bi-cpu-fill',
    likes: 5218,
    eventCount: 12,
    category: 'Technology',
    accentColor: '#3b82f6',
    registrationLink: '#',
    isActive: true,
  },
  {
    id: 'pharma',
    title: 'PHARMA',
    tagline: 'Molecules of Tomorrow',
    image: '/events/pharma.png',
    organizer: 'PHARMACY',
    organizerIcon: 'bi-capsule',
    likes: 2187,
    eventCount: 6,
    category: 'Pharmacy',
    accentColor: '#a855f7',
    registrationLink: '#',
    isActive: true,
  },
  {
    id: 'scientia',
    title: 'SCIENTIA',
    tagline: 'Discover the Unknown',
    image: '/events/scientia.png',
    organizer: 'SCIENCE',
    organizerIcon: 'bi-calculator-fill',
    likes: 1893,
    eventCount: 9,
    category: 'Science',
    accentColor: '#f59e0b',
    registrationLink: '#',
    isActive: true,
  },
  {
    id: 'entrix',
    title: 'ENTRIX',
    tagline: 'Lead. Innovate. Succeed.',
    image: '/events/entrix.png',
    organizer: 'MANAGEMENT',
    organizerIcon: 'bi-briefcase-fill',
    likes: 4102,
    eventCount: 10,
    category: 'Management',
    accentColor: '#f97316',
    registrationLink: '#',
    isActive: true,
  },
];
