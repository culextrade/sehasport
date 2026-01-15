import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const EventsContext = createContext();

export const useEvents = () => useContext(EventsContext);

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*, venues ( name, location, lat, lng )') // Join venues table
                .order('date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const addEvent = async (newEvent) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    ...newEvent,
                    creator_id: user.id,
                    participants_count: 1 // Creator joins automatically?
                }])
                .select();

            if (error) throw error;

            // Optimistic update or refetch
            setEvents([data[0], ...events]);
            return { data };
        } catch (err) {
            console.error('Error creating event:', err);
            return { error: err };
        }
    };

    const joinEvent = async (eventId) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            // 1. Add to participants table
            const { error: partError } = await supabase
                .from('participants')
                .insert([{ event_id: eventId, user_id: user.id }]);

            if (partError) {
                if (partError.code === '23505') return { error: 'Already joined' }; // Unique constraint
                throw partError;
            }

            // 2. Increment count in events table (simple appraoch)
            // Ideally use a database function or trigger, but for MVP:
            const event = events.find(e => e.id === eventId);
            if (event) {
                const { error: updateError } = await supabase
                    .from('events')
                    .update({ participants_count: event.participants_count + 1 })
                    .eq('id', eventId);

                if (updateError) throw updateError;

                // Local update
                setEvents(events.map(e => e.id === eventId ? { ...e, participants_count: e.participants_count + 1 } : e));
            }
            return {};
        } catch (err) {
            console.error('Error joining event:', err);
            return { error: err };
        }
    };

    return (
        <EventsContext.Provider value={{ events, loading, addEvent, joinEvent, fetchEvents }}>
            {children}
        </EventsContext.Provider>
    );
};
