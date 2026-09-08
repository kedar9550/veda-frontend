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

const fetchAll = async () => {
  try {
    const [groupsSettled, eventsSettled, regSettled] = await Promise.allSettled([
      fetch(`${API_URL}/api/event-schools`),
      fetch(`${API_URL}/api/events`),
      fetch(`${API_URL}/api/razorpay/registrations?paymentStatus=PAID`)
    ]);

    let groupsData = null;
    let eventsData = null;
    let regData = null;

    if (groupsSettled.status === 'fulfilled' && groupsSettled.value.ok) {
      groupsData = await groupsSettled.value.json();
    }
    if (eventsSettled.status === 'fulfilled' && eventsSettled.value.ok) {
      eventsData = await eventsSettled.value.json();
    }
    if (regSettled.status === 'fulfilled' && regSettled.value.ok) {
      try {
        regData = await regSettled.value.json();
      } catch (e) {
        console.warn('Failed parsing registrations json:', e);
      }
    }

    if (groupsData && eventsData) {
      const rawGroups = Array.isArray(groupsData)
        ? groupsData
        : (groupsData.data || groupsData.schools || groupsData.eventSchools || groupsData.groups || []);

      const rawEvents = Array.isArray(eventsData)
        ? eventsData
        : (eventsData.data || eventsData.events || eventsData.results || []);

      const pList = Array.isArray(regData)
        ? regData
        : (regData?.payments || regData?.data || regData?.registrations || []);

      // Calculate statistics per event and school from registrations
      const eventStats = {}; // eventKey -> { regCount, partCount, teams: Set(), noTeamCount: 0 }
      const groupStats = {}; // groupId -> { regCount, partCount, teams: Set(), noTeamCount: 0 }

      let overallPaidRegistrations = 0;
      let overallPaidParticipants = 0;
      const overallPaidTeamsSet = new Set();
      let overallNoTeamCount = 0;

      // Map rawEvents lookup helpers
      const eventLookup = rawEvents.map(evt => {
        const id = String(evt._id || evt.id || '').trim();
        const nameNorm = normalizeString(evt.eventName || evt.name || evt.title);
        const slug = (evt.eventName || evt.name || evt.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const schoolId = String(evt.school?._id || evt.school || evt.eventSchool?._id || evt.eventSchool || evt.group?._id || evt.group || evt.schoolId || evt.groupId || '').trim();
        return { id, nameNorm, slug, schoolId, raw: evt };
      });

      pList.forEach(p => {
        // Exclusively include registrations with payment status "PAID"
        const status = String(p.paymentStatus || p.status || '').toUpperCase().trim();
        if (status !== 'PAID') {
          return;
        }

        let partCount = 1;
        if (Array.isArray(p.participants) && p.participants.length > 0) {
          partCount = p.participants.length;
        } else if (p.teamSize && !isNaN(Number(p.teamSize)) && Number(p.teamSize) > 0) {
          partCount = Number(p.teamSize);
        }

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

        // Find matching event
        const matched = eventLookup.find(evt =>
          (pEventId && (evt.id === pEventId || evt.slug === pEventId || evt.nameNorm === normalizeString(pEventId))) ||
          (pEventNameNorm && evt.nameNorm === pEventNameNorm) ||
          (pSlug && evt.slug === pSlug)
        );

        if (matched) {
          const key = matched.id;
          if (!eventStats[key]) {
            eventStats[key] = { regCount: 0, partCount: 0, teams: new Set(), noTeamCount: 0 };
          }
          eventStats[key].regCount += 1;
          eventStats[key].partCount += partCount;
          if (teamIdStr) {
            eventStats[key].teams.add(teamIdStr);
          } else {
            eventStats[key].noTeamCount += 1;
          }

          if (matched.schoolId) {
            if (!groupStats[matched.schoolId]) {
              groupStats[matched.schoolId] = { regCount: 0, partCount: 0, teams: new Set(), noTeamCount: 0 };
            }
            groupStats[matched.schoolId].regCount += 1;
            groupStats[matched.schoolId].partCount += partCount;
            if (teamIdStr) {
              groupStats[matched.schoolId].teams.add(teamIdStr);
            } else {
              groupStats[matched.schoolId].noTeamCount += 1;
            }
          }
        }
      });

      globalTotalPaidRegistrations = overallPaidRegistrations;
      globalTotalPaidParticipants = overallPaidParticipants;
      globalTotalPaidTeams = overallPaidTeamsSet.size + overallNoTeamCount;

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
          const gStat = groupStats[g._id] || { regCount: 0, partCount: 0, teams: new Set(), noTeamCount: 0 };
          const gTeamsCount = (gStat.teams ? gStat.teams.size : 0) + (gStat.noTeamCount || 0);

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
        const eStat = eventStats[evt._id] || { regCount: 0, partCount: 0, teams: new Set(), noTeamCount: 0 };

        const realRegistrationsCount = eStat.regCount || 0;
        const realParticipantsCount = eStat.partCount || 0;
        const realTeamsCount = (eStat.teams ? eStat.teams.size : 0) + (eStat.noTeamCount || 0);

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

      globalLoading = false;
      globalError = null;
      updateSubscribers();
      return;
    }
  } catch (err) {
    console.error(err);
  }

  globalLoading = false;
  globalError = 'Error fetching events';
  updateSubscribers();
};

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
