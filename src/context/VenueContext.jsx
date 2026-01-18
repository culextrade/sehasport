import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const VenueContext = createContext();

export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
    const [venues, setVenues] = useState([]);
    const [myVenues, setMyVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch all venues with courts
    const fetchVenues = async () => {
        try {
            const { data, error } = await supabase
                .from('venues')
                .select('*, courts (*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVenues(data || []);
        } catch (err) {
            console.error('Error fetching venues:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch venues owned by current user
    const fetchMyVenues = async () => {
        if (!user) {
            setMyVenues([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('venues')
                .select('*, courts (*)')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyVenues(data || []);
        } catch (err) {
            console.error('Error fetching my venues:', err);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    useEffect(() => {
        fetchMyVenues();
    }, [user]);

    // Check court availability for a specific date and time range
    const checkAvailability = async (courtId, date, startTime, endTime) => {
        try {
            const { data, error } = await supabase
                .rpc('check_court_availability', {
                    p_court_id: courtId,
                    p_date: date,
                    p_start_time: startTime,
                    p_end_time: endTime
                });

            if (error) {
                // Fallback: manual check if RPC not available
                const { data: bookings, error: bookingError } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('court_id', courtId)
                    .eq('date', date)
                    .neq('status', 'cancelled');

                if (bookingError) throw bookingError;

                // Check for overlaps manually
                const hasOverlap = (bookings || []).some(booking => {
                    return booking.start_time < endTime && booking.end_time > startTime;
                });

                return { available: !hasOverlap };
            }

            return { available: data };
        } catch (err) {
            console.error('Error checking availability:', err);
            return { available: false, error: err };
        }
    };

    // Create a booking (called automatically when event is created)
    const createBooking = async (courtId, date, startTime, endTime, eventId = null) => {
        if (!user) return { error: 'Not authenticated' };

        // First check availability
        const { available, error: checkError } = await checkAvailability(courtId, date, startTime, endTime);

        if (checkError) return { error: checkError };
        if (!available) return { error: 'Time slot not available' };

        try {
            const { data, error } = await supabase
                .from('bookings')
                .insert([{
                    court_id: courtId,
                    user_id: user.id,
                    event_id: eventId,
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    status: 'confirmed'
                }])
                .select()
                .single();

            if (error) throw error;
            return { data };
        } catch (err) {
            console.error('Error creating booking:', err);
            return { error: err };
        }
    };

    // Add court to a venue
    const addCourt = async (venueId, courtData) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            const { data, error } = await supabase
                .from('courts')
                .insert([{
                    venue_id: venueId,
                    name: courtData.name,
                    sport: courtData.sport,
                    capacity: courtData.capacity || 4,
                    is_active: true
                }])
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setMyVenues(prev => prev.map(v =>
                v.id === venueId
                    ? { ...v, courts: [...(v.courts || []), data] }
                    : v
            ));

            return { data };
        } catch (err) {
            console.error('Error adding court:', err);
            return { error: err };
        }
    };

    // Get courts for a specific venue
    const getCourtsByVenue = (venueId) => {
        const venue = venues.find(v => v.id === venueId);
        return venue?.courts || [];
    };

    // Get available time slots for a court on a specific date
    const getAvailableSlots = async (courtId, date) => {
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('start_time, end_time')
                .eq('court_id', courtId)
                .eq('date', date)
                .neq('status', 'cancelled')
                .order('start_time');

            if (error) throw error;

            // Define operating hours (8 AM to 10 PM)
            const operatingStart = '08:00';
            const operatingEnd = '22:00';
            const slotDuration = 60; // minutes

            const bookedSlots = bookings || [];
            const availableSlots = [];

            // Generate hourly slots
            let currentTime = operatingStart;
            while (currentTime < operatingEnd) {
                const endSlot = addMinutesToTime(currentTime, slotDuration);

                const isBooked = bookedSlots.some(b =>
                    b.start_time < endSlot && b.end_time > currentTime
                );

                if (!isBooked) {
                    availableSlots.push({
                        start_time: currentTime,
                        end_time: endSlot
                    });
                }

                currentTime = endSlot;
            }

            return { data: availableSlots };
        } catch (err) {
            console.error('Error getting available slots:', err);
            return { error: err, data: [] };
        }
    };

    // Helper: Add minutes to time string
    const addMinutesToTime = (timeStr, minutes) => {
        const [hours, mins] = timeStr.split(':').map(Number);
        const totalMins = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMins / 60);
        const newMins = totalMins % 60;
        return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    };

    return (
        <VenueContext.Provider value={{
            venues,
            myVenues,
            loading,
            fetchVenues,
            fetchMyVenues,
            checkAvailability,
            createBooking,
            addCourt,
            getCourtsByVenue,
            getAvailableSlots
        }}>
            {children}
        </VenueContext.Provider>
    );
};
