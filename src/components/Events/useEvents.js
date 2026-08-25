import { useState, useEffect } from 'react';

// A simple global state cache
let globalGroups = [];
let globalEvents = [];
let globalLoading = true;
let globalError = null;
let subscribers = new Set();

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000';

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
            fetch(`${API_URL}/api/groups`),
            fetch(`${API_URL}/api/events`)
          ]);

          if (groupsRes.ok && eventsRes.ok) {
            const groupsData = await groupsRes.json();
            const eventsData = await eventsRes.json();

            const rawGroups = groupsData.groups || [];
            const rawEvents = eventsData.events || [];

            const groupEventCounts = {};
            rawEvents.forEach(evt => {
              const gid = evt.group?._id || evt.group;
              if (gid) {
                groupEventCounts[gid] = (groupEventCounts[gid] || 0) + 1;
              }
            });

            globalGroups = rawGroups.filter(g => g.status === 'Active').map(g => {
              const groupSlug = (g.shortName || g.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return {
                id: g._id,
                _id: g._id,
                slug: groupSlug || g._id,
                title: g.name,
                shortName: g.shortName,
                tagline: g.content || g.name,
                organizer: 'VEDA',
                groupLogo: formatImageUrl(g.banner, API_URL),
                image: formatImageUrl(g.banner, API_URL),
                eventCount: groupEventCounts[g._id] || 0,
                accentColor: '#7c3aed',
                isActive: g.status === 'Active'
              };
            });

            globalEvents = rawEvents.map(evt => {
              const groupId = evt.group?._id || evt.group;
              const parentGroup = globalGroups.find(g => g._id === groupId);
              const eventSlug = (evt.eventName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const groupSlug = parentGroup?.slug || (evt.group?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              
              return {
                id: evt._id,
                _id: evt._id,
                slug: eventSlug || evt._id,
                groupSlug: groupSlug || (evt.group?._id || evt.group),
                title: evt.eventName,
                tagline: evt.overview || '',
                description: evt.overview || '',
                image: formatImageUrl(evt.bannerImage, API_URL) || 'https://placehold.co/600x400/1e293b/94a3b8?text=Event+Image',
                groupLogo: parentGroup?.groupLogo || null,
                organizer: evt.department?.[0]?.name || evt.group?.name || 'Department',
                feeAmount: evt.price || 0,
                feeText: evt.price ? `₹${evt.price}` : 'Free',
                maxTeamSize: evt.maxTeamSize || 1,
                venue: evt.venueType + (evt.roomNo ? ` - Room ${evt.roomNo}` : ''),
                category: evt.group?.name || 'Event',
                categoryColor: '#7c3aed',
                isOpen: true,
                isActive: true,
                rules: evt.rules || [],
                groupId: evt.group?._id || evt.group,
                groupName: evt.group?.name || '',
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


