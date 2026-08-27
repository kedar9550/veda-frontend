import { useState, useEffect } from 'react';

// A simple global state cache
let globalGroups = [];
let globalEvents = [];
let globalLoading = true;
let globalError = null;
let subscribers = new Set();

const API_URL = import.meta.env.VITE_API_URL;

function formatImageUrl(path, baseUrl = API_URL) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function updateSubscribers() {
  subscribers.forEach(sub => sub({
    groups: globalGroups,
    events: globalEvents,
    loading: globalLoading,
    error: globalError
  }));
}

export function useEvents() {
  const [state, setState] = useState({
    groups: globalGroups,
    events: globalEvents,
    loading: globalLoading,
    error: globalError
  });

  useEffect(() => {
    const sub = (newState) => setState(newState);
    subscribers.add(sub);
    let isMounted = true;

    if (globalGroups.length === 0 && globalLoading) {
      const fetchAll = async () => {
        try {
          const [groupsRes, eventsRes] = await Promise.all([
            fetch(`${API_URL}/api/event-schools`),
            fetch(`${API_URL}/api/events`)
          ]);

          if (groupsRes.ok && eventsRes.ok) {
            const groupsData = await groupsRes.json();
            const eventsData = await eventsRes.json();

            const rawGroups = Array.isArray(groupsData)
              ? groupsData
              : (groupsData.data || groupsData.schools || groupsData.eventSchools || groupsData.groups || []);

            const rawEvents = Array.isArray(eventsData)
              ? eventsData
              : (eventsData.data || eventsData.events || eventsData.results || []);

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
                  isActive: !g.status || g.status.toLowerCase() === 'active' || g.isActive !== false,
                  raw: g
                };
              });

            globalEvents = rawEvents.map(evt => {
              const groupId = evt.school?._id || evt.school || evt.eventSchool?._id || evt.eventSchool || evt.group?._id || evt.group || evt.schoolId || evt.groupId;
              const parentGroup = globalGroups.find(g => g._id === groupId || g.id === groupId);
              const eventSlug = (evt.eventName || evt.name || evt.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const groupSlug = parentGroup?.slug || (evt.school?.name || evt.eventSchool?.name || evt.group?.name || evt.schoolName || evt.groupName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
                isOpen: evt.isOpen !== false,
                isActive: evt.status ? evt.status.toLowerCase() === 'active' : true,
                rules: evt.rules || [],
                groupId: groupId,
                groupName: parentGroup?.title || evt.school?.name || evt.eventSchool?.name || evt.group?.name || '',
                raw: evt
              };
            });

            globalLoading = false;
            globalError = null;
            if (isMounted) updateSubscribers();
            return;
          }
        } catch (err) {
          console.error(err);
        }

        globalLoading = false;
        globalError = 'Error fetching events';
        if (isMounted) updateSubscribers();
      };

      fetchAll();
    }

    return () => {
      isMounted = false;
      subscribers.delete(sub);
    };
  }, []);

  return state;
}


