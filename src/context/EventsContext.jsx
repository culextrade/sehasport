import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [participations, setParticipations] = useState({}); // Map event_id -> status

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
                    *,
                    venues ( id, name, location, lat, lng ),
                    courts ( id, name, sport, capacity )
                `)
                .order('date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipations = async () => {
        if (!user) {
            setParticipations({});
            return;
        }
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('event_id, status')
                .eq('user_id', user.id);

            if (error) throw error;

            const map = {};
            (data || []).forEach(p => {
                map[p.event_id] = p.status || 'joined';
            });
            setParticipations(map);
        } catch (err) {
            console.error('Error fetching participations:', err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        fetchParticipations();
    }, [user]);

    /**
     * Add a new event with owner_type pattern
     * @param {Object} eventData - Event data
     * @param {string} eventData.title
     * @param {string} eventData.sport
     * @param {string} eventData.ownerType - 'USER' | 'COMMUNITY'
     * @param {string} eventData.ownerId - user id or community id
     * @param {number} eventData.venueId
     * @param {number} eventData.courtId
     * @param {string} eventData.date - YYYY-MM-DD
     * @param {string} eventData.startTime - HH:MM
     * @param {string} eventData.endTime - HH:MM
     * @param {string} eventData.location - fallback if no venue
     * @param {number} eventData.maxParticipants
     * @param {string} eventData.level
     * @param {string} eventData.price
     * @param {boolean} eventData.isPaid
     */
    const addEvent = async (eventData) => {
        if (!user) return { error: 'Not authenticated' };

        const {
            title,
            sport,
            ownerType = 'USER',
            ownerId,
            venueId,
            courtId,
            date,
            startTime,
            endTime,
            location,
            maxParticipants = 4,
            level,
            price,
            isPaid = false,
            description,
            imageUrl
        } = eventData;

        try {
            // If court is selected, check availability and create booking
            if (courtId) {
                // Check availability via RPC or manual check
                const { data: available, error: rpcError } = await supabase
                    .rpc('check_court_availability', {
                        p_court_id: courtId,
                        p_date: date,
                        p_start_time: startTime,
                        p_end_time: endTime
                    });

                if (rpcError) {
                    // Fallback: manual check
                    const { data: bookings, error: bookingError } = await supabase
                        .from('bookings')
                        .select('*')
                        .eq('court_id', courtId)
                        .eq('date', date)
                        .neq('status', 'cancelled');

                    if (bookingError) throw bookingError;

                    const hasOverlap = (bookings || []).some(b =>
                        b.start_time < endTime && b.end_time > startTime
                    );

                    if (hasOverlap) {
                        return { error: 'Time slot is not available' };
                    }
                } else if (!available) {
                    return { error: 'Time slot is not available' };
                }
            }

            // Create event
            const { data: event, error: eventError } = await supabase
                .from('events')
                .insert([{
                    title,
                    sport,
                    owner_type: ownerType,
                    owner_id: ownerId || user.id,
                    venue_id: venueId || null,
                    court_id: courtId || null,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    location: location || null,
                    price: price || null,
                    level: level || null,
                    participants_count: 1, // Creator auto-joins
                    max_participants: maxParticipants,
                    image_url: imageUrl || null,
                    description: description || null,
                    is_paid: isPaid,
                    is_featured: false
                }])
                .select()
                .single();

            if (eventError) throw eventError;

            // Create booking if court is selected (event creation auto-creates booking)
            if (courtId) {
                const { error: bookingError } = await supabase
                    .from('bookings')
                    .insert([{
                        court_id: courtId,
                        user_id: user.id,
                        event_id: event.id,
                        date,
                        start_time: startTime,
                        end_time: endTime,
                        status: 'confirmed'
                    }]);

                if (bookingError) {
                    console.error('Booking creation failed:', bookingError);
                    // Don't fail the event creation, just log
                }
            }

            // Auto-add creator as participant
            await supabase
                .from('participants')
                .insert([{
                    event_id: event.id,
                    user_id: user.id,
                    status: 'joined'
                }]);

            // Update local state
            setEvents([event, ...events]);
            setParticipations(prev => ({ ...prev, [event.id]: 'joined' }));

            return { data: event };
        } catch (err) {
            console.error('Error creating event:', err);
            return { error: err };
        }
    };

    const joinEvent = async (eventId, status = 'joined') => {
        if (!user) return { error: 'Not authenticated' };

        try {
            const existingStatus = participations[eventId];
            let error = null;

            if (existingStatus) {
                // Update existing participation
                const { error: updateError } = await supabase
                    .from('participants')
                    .update({ status })
                    .eq('event_id', eventId)
                    .eq('user_id', user.id);
                error = updateError;
            } else {
                // Insert new participation
                const { error: insertError } = await supabase
                    .from('participants')
                    .insert([{ event_id: eventId, user_id: user.id, status }]);
                error = insertError;
            }

            if (error) throw error;

            // Update local participation state
            setParticipations(prev => ({ ...prev, [eventId]: status }));

            // Update participant count
            const wasJoined = existingStatus === 'joined';
            const isJoined = status === 'joined';

            if (isJoined && !wasJoined) {
                await updateParticipantCount(eventId, 1);
            } else if (!isJoined && wasJoined) {
                await updateParticipantCount(eventId, -1);
            }

            return {};
        } catch (err) {
            console.error('Error joining event:', err);
            return { error: err };
        }
    };

    const updateParticipantCount = async (eventId, delta) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const newCount = Math.max(0, (event.participants_count || 0) + delta);

        const { error } = await supabase
            .from('events')
            .update({ participants_count: newCount })
            .eq('id', eventId);

        if (!error) {
            setEvents(events.map(e =>
                e.id === eventId ? { ...e, participants_count: newCount } : e
            ));
        }
    };

    // Get events by owner
    const getEventsByOwner = (ownerType, ownerId) => {
        return events.filter(e =>
            e.owner_type === ownerType && e.owner_id === String(ownerId)
        );
    };

    // Get user's created events
    const getMyEvents = () => {
        if (!user) return [];
        return events.filter(e =>
            e.owner_type === 'USER' && e.owner_id === user.id
        );
    };

    // Get community events
    const getCommunityEvents = (communityId) => {
        return events.filter(e =>
            e.owner_type === 'COMMUNITY' && e.owner_id === String(communityId)
        );
    };

    return (
        <EventsContext.Provider value={{
            events,
            loading,
            addEvent,
            joinEvent,
            fetchEvents,
            participations,
            getEventsByOwner,
            getMyEvents,
            getCommunityEvents
        }}>
            {children}
        </EventsContext.Provider>
    );
};
