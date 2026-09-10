import { useState, useEffect, useCallback } from 'react';

// A simple global state cache
let globalGroups = [];
let globalEvents = [];
let globalLoading = true;
let globalError = null;
let globalTotalPaidTeams = 0;
let globalTotalPaidParticipants = 0;
let globalTotalPaidRegistrations = 0;
let subscribers = new Set();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9022';

function formatImageUrl(path, baseUrl = API_URL) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeString(str) {
  return String(str || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function updateSubscribers() {
  subscribers.forEach(sub => sub({
    groups: globalGroups,
    events: globalEvents,
    loading: globalLoading,
    error: globalError,
    totalPaidTeams: globalTotalPaidTeams,
    totalPaidParticipants: globalTotalPaidParticipants,
    totalPaidRegistrations: globalTotalPaidRegistrations
  }));
}

const STATS_CACHE_KEY = 'veda_events_stats_cache_v2';
const STATS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

function getCachedStats() {
  try {
    const raw = sessionStorage.getItem(STATS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < STATS_CACHE_TTL) {
      return parsed.data;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return null;
}

function setCachedStats(data) {
  try {
    sessionStorage.setItem(STATS_CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch (e) {}
}

function calculateStats(pList, rawEvents) {
  const eventStats = {};
  const groupStats = {};
  let overallPaidRegistrations = 0;
  let overallPaidParticipants = 0;
  const overallPaidTeamsSet = new Set();
  let overallNoTeamCount = 0;

  const eventLookup = rawEvents.map(evt => {
    const id = String(evt._id || evt.id || '').trim();
    const nameNorm = normalizeString(evt.eventName || evt.name || evt.title);
    const slug = (evt.eventName || evt.name || evt.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const schoolId = String(evt.school?._id || evt.school || evt.eventSchool?._id || evt.eventSchool || evt.group?._id || evt.group || evt.schoolId || evt.groupId || '').trim();
    return { id, nameNorm, slug, schoolId };
  });

  pList.forEach(p => {
    const status = String(p.paymentStatus || p.status || '').toUpperCase().trim();
    if (status !== 'PAID') return;

    const partCount = Array.isArray(p.participants) ? p.participants.length : 0;
    const teamIdStr = p.teamId ? String(p.teamId).trim() : '';

    overallPaidRegistrations += 1;
    overallPaidParticipants += partCount;
    if (teamIdStr) {
      overallPaidTeamsSet.add(teamIdStr);
    } else {
      overallNoTeamCount += 1;
    }

    const pEventId = String(p.eventId || p.event?._id || p.event?.id || (typeof p.event === 'string' ? p.event : '') || '').trim();
    const pEventNameNorm = normalizeString(p.eventName || p.event?.name || p.event?.title || p.title);
    const pSlug = (p.eventName || p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const matched = eventLookup.find(evt =>
      (pEventId && (evt.id === pEventId || evt.slug === pEventId || evt.nameNorm === normalizeString(pEventId))) ||
      (pEventNameNorm && evt.nameNorm === pEventNameNorm) ||
      (pSlug && evt.slug === pSlug)
    );

    if (matched) {
      const key = matched.id;
      if (!eventStats[key]) {
        eventStats[key] = { regCount: 0, partCount: 0, teamsCount: 0, noTeamCount: 0 };
      }
      eventStats[key].regCount += 1;
      eventStats[key].partCount += partCount;
      if (teamIdStr) {
        eventStats[key].teamsCount += 1;
      } else {
        eventStats[key].noTeamCount += 1;
      }

      if (matched.schoolId) {
        if (!groupStats[matched.schoolId]) {
          groupStats[matched.schoolId] = { regCount: 0, partCount: 0, teamsCount: 0, noTeamCount: 0 };
        }
        groupStats[matched.schoolId].regCount += 1;
        groupStats[matched.schoolId].partCount += partCount;
        if (teamIdStr) {
          groupStats[matched.schoolId].teamsCount += 1;
        } else {
          groupStats[matched.schoolId].noTeamCount += 1;
        }
      }
    }
  });

  return {
    eventStats,
    groupStats,
    overallPaidRegistrations,
    overallPaidParticipants,
    overallPaidTeams: overallPaidTeamsSet.size + overallNoTeamCount
  };
}

function applyProcessedData(rawGroups, rawEvents, stats) {
  const {
    eventStats = {},
    groupStats = {},
    overallPaidRegistrations = 0,
    overallPaidParticipants = 0,
    overallPaidTeams = 0
  } = stats || {};

  globalTotalPaidRegistrations = overallPaidRegistrations;
  globalTotalPaidParticipants = overallPaidParticipants;
  globalTotalPaidTeams = overallPaidTeams;

  const groupEventCounts = {};
  rawEvents.forEach(evt => {
    const gid = evt.school?._id || evt.school || evt.eventSchool?._id || evt.eventSchool || evt.group?._id || evt.group || evt.schoolId || evt.groupId;
    if (gid) {
      groupEventCounts[gid] = (groupEventCounts[gid] || 0) + 1;
    }
  });

  globalGroups = rawGroups
    .filter(g => !g.status || g.status.toLowerCase() === 'active' || g.isActive !== false)
    .map(g => {
      const groupSlug = (g.shortName || g.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const gStat = groupStats[g._id] || { regCount: 0, partCount: 0, teamsCount: 0, noTeamCount: 0 };
      const gTeamsCount = (gStat.teamsCount || 0) + (gStat.noTeamCount || 0);

      return {
        id: g._id,
        _id: g._id,
        slug: groupSlug || g._id,
        title: g.name,
        name: g.name,
        shortName: g.shortName,
        tagline: g.content || g.description || g.name,
        organizer: 'VEDA',
        groupLogo: formatImageUrl(g.banner || g.logo || g.image, API_URL),
        image: formatImageUrl(g.banner || g.logo || g.image, API_URL),
        eventCount: groupEventCounts[g._id] || 0,
        accentColor: '#7c3aed',
        coordinator: g.coordinator || g.eventCoordinator || null,
        coordinators: g.coordinators || (g.coordinator ? [g.coordinator] : (g.eventCoordinator ? [g.eventCoordinator] : [])),
        isActive: !g.status || g.status.toLowerCase() === 'active' || g.isActive !== false,
        participants: gStat.partCount || 0,
        usersRegistered: gStat.regCount || 0,
        registeredTeams: gTeamsCount,
        realTeamsCount: gTeamsCount,
        realParticipantsCount: gStat.partCount || 0,
        realRegistrationsCount: gStat.regCount || 0,
        raw: g
      };
    });

  globalEvents = rawEvents.map(evt => {
    const groupId = evt.school?._id || evt.school || evt.eventSchool?._id || evt.eventSchool || evt.group?._id || evt.group || evt.schoolId || evt.groupId;
    const parentGroup = globalGroups.find(g => g._id === groupId || g.id === groupId);
    const eventSlug = (evt.eventName || evt.name || evt.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const groupSlug = parentGroup?.slug || (evt.school?.name || evt.eventSchool?.name || evt.group?.name || evt.schoolName || evt.groupName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const eStat = eventStats[evt._id] || { regCount: 0, partCount: 0, teamsCount: 0, noTeamCount: 0 };

    const realRegistrationsCount = eStat.regCount || 0;
    const realParticipantsCount = eStat.partCount || 0;
    const realTeamsCount = (eStat.teamsCount || 0) + (eStat.noTeamCount || 0);

    return {
      id: evt._id,
      _id: evt._id,
      slug: eventSlug || evt._id,
      groupSlug: groupSlug || (parentGroup?.slug || groupId),
      title: evt.eventName || evt.name || evt.title || 'Event',
      tagline: evt.overview || evt.tagline || evt.description || '',
      description: evt.overview || evt.description || '',
      image: formatImageUrl(evt.bannerImage || evt.image, API_URL) || 'https://placehold.co/600x400/1e293b/94a3b8?text=Event+Image',
      groupLogo: parentGroup?.groupLogo || null,
      organizer: evt.department?.[0]?.name || evt.school?.name || evt.eventSchool?.name || evt.group?.name || 'Department',
      feeAmount: evt.price ?? evt.fee ?? evt.registrationFee ?? 0,
      feeText: (evt.price || evt.fee || evt.registrationFee) ? `₹${evt.price || evt.fee || evt.registrationFee}` : 'Free',
      maxTeamSize: evt.maxTeamSize || evt.teamSize || 1,
      venue: (evt.venueType || evt.venue || 'Campus') + (evt.roomNo ? ` - Room ${evt.roomNo}` : ''),
      category: evt.school?.name || evt.eventSchool?.name || evt.group?.name || 'Event',
      categoryColor: '#7c3aed',
      isOpen: evt.isOpen !== false && String(evt.registrationStop || '').toLowerCase() !== 'yes',
      isActive: evt.status ? evt.status.toLowerCase() === 'active' : true,
      rules: evt.rules || [],
      coordinator: evt.facultyCoordinator || evt.coordinator || evt.eventCoordinator || (evt.facultyCoordinators && evt.facultyCoordinators[0]) || null,
      coordinators: evt.facultyCoordinators || (evt.facultyCoordinator ? [evt.facultyCoordinator] : (evt.coordinator ? [evt.coordinator] : (evt.eventCoordinator ? [evt.eventCoordinator] : []))),
      groupId: groupId,
      groupName: parentGroup?.title || evt.school?.name || evt.eventSchool?.name || evt.group?.name || '',
      realTeamsCount,
      realParticipantsCount,
      realRegistrationsCount,
      registeredStudents: realRegistrationsCount,
      participants: realParticipantsCount,
      registeredTeams: realTeamsCount,
      raw: evt
    };
  });
}

let isStatsFetching = false;
const fetchRegistrationsStats = async (rawEvents, rawGroups) => {
  if (isStatsFetching) return;
  isStatsFetching = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout max

    const res = await fetch(`${API_URL}/api/razorpay/registrations?paymentStatus=PAID&select=eventId,eventName,teamId,schoolId,paymentStatus,participants`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const regData = await res.json();
      const pList = Array.isArray(regData)
        ? regData
        : (regData?.payments || regData?.data || regData?.registrations || []);

      const stats = calculateStats(pList, rawEvents);
      setCachedStats(stats);
      applyProcessedData(rawGroups, rawEvents, stats);
      updateSubscribers();
    }
  } catch (err) {
    // If registrations query times out or fails, don't break the UI
    console.warn('Background registration stats load bypassed:', err.message);
  } finally {
    isStatsFetching = false;
  }
};

const fetchAll = async () => {
  try {
    // Fetch core event schools and events in parallel (fast ~150ms)
    const [groupsRes, eventsRes] = await Promise.all([
      fetch(`${API_URL}/api/event-schools`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_URL}/api/events`).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    if (groupsRes && eventsRes) {
      const rawGroups = Array.isArray(groupsRes)
        ? groupsRes
        : (groupsRes.data || groupsRes.schools || groupsRes.eventSchools || groupsRes.groups || []);

      const rawEvents = Array.isArray(eventsRes)
        ? eventsRes
        : (eventsRes.data || eventsRes.events || eventsRes.results || []);

      // 1. Check if we have valid cached stats from session
      const cachedStats = getCachedStats();
      applyProcessedData(rawGroups, rawEvents, cachedStats || {});

      // 2. Render immediately! No blocking the UI
      globalLoading = false;
      globalError = null;
      updateSubscribers();

      // 3. If stats were not cached, fetch them asynchronously in background
      if (!cachedStats) {
        fetchRegistrationsStats(rawEvents, rawGroups);
      }
      return;
    }
  } catch (err) {
    console.error('Error in fetchAll:', err);
  }

  globalLoading = false;
  globalError = 'Error fetching events';
  updateSubscribers();
};

export function getGlobalEvents() {
  return globalEvents;
}

export function getGlobalStats() {
  return {
    totalPaidTeams: globalTotalPaidTeams,
    totalPaidParticipants: globalTotalPaidParticipants,
    totalPaidRegistrations: globalTotalPaidRegistrations
  };
}

export function useEvents() {
  const [state, setState] = useState({
    groups: globalGroups,
    events: globalEvents,
    loading: globalLoading,
    error: globalError,
    totalPaidTeams: globalTotalPaidTeams,
    totalPaidParticipants: globalTotalPaidParticipants,
    totalPaidRegistrations: globalTotalPaidRegistrations
  });

  useEffect(() => {
    const sub = (newState) => setState(newState);
    subscribers.add(sub);

    if (globalGroups.length === 0 && globalLoading) {
      fetchAll();
    }

    return () => {
      subscribers.delete(sub);
    };
  }, []);

  const refetch = useCallback(() => {
    return fetchAll();
  }, []);

  return { ...state, refetch };
}
