import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useVenue } from '../context/VenueContext';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Clock, Users, AlertCircle } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addEvent } = useEvents();
    const { venues, checkAvailability, getAvailableSlots } = useVenue();
    const { getManageableCommunities } = useCommunity();
    const { user } = useAuth();

    const manageableCommunities = getManageableCommunities();
    const preselectedCommunityId = location.state?.communityId;

    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800';

    const [formData, setFormData] = useState({
        title: '',
        sport: 'tennis',
        ownerType: preselectedCommunityId ? 'COMMUNITY' : 'USER',
        communityId: preselectedCommunityId || '',
        venueId: '',
        courtId: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        price: '',
        maxParticipants: 4,
        level: 'Open',
        description: '',
        isPaid: false,
        imageUrl: DEFAULT_IMAGE
    });

    const [courts, setCourts] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [availabilityStatus, setAvailabilityStatus] = useState(null); // 'checking', 'available', 'unavailable'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update courts when venue changes
    useEffect(() => {
        if (formData.venueId) {
            const venue = venues.find(v => v.id === parseInt(formData.venueId));
            if (venue && venue.courts) {
                setCourts(venue.courts.filter(c => c.is_active !== false));
                // Auto-fill location from venue
                setFormData(prev => ({
                    ...prev,
                    location: venue.location,
                    courtId: ''
                }));
            }
        } else {
            setCourts([]);
        }
    }, [formData.venueId, venues]);

    // Check availability when court and date change
    useEffect(() => {
        const checkSlots = async () => {
            if (formData.courtId && formData.date) {
                const { data } = await getAvailableSlots(parseInt(formData.courtId), formData.date);
                setAvailableSlots(data || []);
            } else {
                setAvailableSlots([]);
            }
        };
        checkSlots();
    }, [formData.courtId, formData.date]);

    // Validate availability when time changes
    useEffect(() => {
        const validate = async () => {
            if (formData.courtId && formData.date && formData.startTime && formData.endTime) {
                setAvailabilityStatus('checking');
                const { available } = await checkAvailability(
                    parseInt(formData.courtId),
                    formData.date,
                    formData.startTime,
                    formData.endTime
                );
                setAvailabilityStatus(available ? 'available' : 'unavailable');
            } else {
                setAvailabilityStatus(null);
            }
        };
        validate();
    }, [formData.courtId, formData.date, formData.startTime, formData.endTime]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSlotSelect = (slot) => {
        setFormData(prev => ({
            ...prev,
            startTime: slot.start_time,
            endTime: slot.end_time
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title.trim()) {
            setError('Event title is required');
            return;
        }

        if (!formData.date) {
            setError('Please select a date');
            return;
        }

        if (!formData.startTime || !formData.endTime) {
            setError('Please select start and end time');
            return;
        }

        if (formData.ownerType === 'COMMUNITY' && !formData.communityId) {
            setError('Please select a community');
            return;
        }

        // Validate availability if court selected
        if (formData.courtId && availabilityStatus === 'unavailable') {
            setError('Selected time slot is not available');
            return;
        }

        setLoading(true);

        const eventData = {
            title: formData.title,
            sport: formData.sport,
            ownerType: formData.ownerType,
            ownerId: formData.ownerType === 'COMMUNITY' ? formData.communityId : user.id,
            venueId: formData.venueId ? parseInt(formData.venueId) : null,
            courtId: formData.courtId ? parseInt(formData.courtId) : null,
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: formData.location,
            maxParticipants: parseInt(formData.maxParticipants),
            level: formData.level,
            price: formData.price || null,
            isPaid: formData.isPaid,
            description: formData.description,
            imageUrl: formData.imageUrl
        };

        const { data, error: createError } = await addEvent(eventData);

        setLoading(false);

        if (createError) {
            setError(typeof createError === 'string' ? createError : createError.message || 'Failed to create event');
            return;
        }

        // Navigate back
        if (formData.ownerType === 'COMMUNITY') {
            navigate(`/communities/${formData.communityId}`);
        } else {
            navigate('/');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)',
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px', paddingBottom: '100px', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer', color: '#fff' }}>
                    <ArrowLeft size={24} />
                </div>
                <h1 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>Create Event</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Owner Type Toggle */}
                {manageableCommunities.length > 0 && (
                    <div>
                        <label style={labelStyle}>Event Type</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, ownerType: 'USER', communityId: '' }))}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: formData.ownerType === 'USER' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                                    background: formData.ownerType === 'USER' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: formData.ownerType === 'USER' ? '600' : '400'
                                }}
                            >
                                👤 Personal Event
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, ownerType: 'COMMUNITY' }))}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: formData.ownerType === 'COMMUNITY' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                                    background: formData.ownerType === 'COMMUNITY' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: formData.ownerType === 'COMMUNITY' ? '600' : '400'
                                }}
                            >
                                👥 Community Event
                            </button>
                        </div>
                    </div>
                )}

                {/* Community Selector */}
                {formData.ownerType === 'COMMUNITY' && (
                    <div>
                        <label style={labelStyle}>Select Community</label>
                        <select
                            style={inputStyle}
                            name="communityId"
                            value={formData.communityId}
                            onChange={handleChange}
                        >
                            <option value="">-- Choose Community --</option>
                            {manageableCommunities.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Title */}
                <div>
                    <label style={labelStyle}>Event Title *</label>
                    <input
                        style={inputStyle}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Sunday Tennis Fun"
                    />
                </div>

                {/* Sport */}
                <div>
                    <label style={labelStyle}>Sport</label>
                    <select style={inputStyle} name="sport" value={formData.sport} onChange={handleChange}>
                        <option value="tennis">🎾 Tennis</option>
                        <option value="padel">🏸 Padel</option>
                        <option value="futsal">⚽ Futsal</option>
                        <option value="mini soccer">⚽ Mini Soccer</option>
                        <option value="badminton">🏸 Badminton</option>
                        <option value="basketball">🏀 Basketball</option>
                    </select>
                </div>

                {/* Venue */}
                <div>
                    <label style={labelStyle}>Venue</label>
                    <select style={inputStyle} name="venueId" value={formData.venueId} onChange={handleChange}>
                        <option value="">-- Select Venue (Optional) --</option>
                        {venues.map(v => (
                            <option key={v.id} value={v.id}>{v.name} - {v.location}</option>
                        ))}
                    </select>
                    {formData.location && (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {formData.location}
                        </div>
                    )}
                </div>

                {/* Court */}
                {courts.length > 0 && (
                    <div>
                        <label style={labelStyle}>Court / Field</label>
                        <select style={inputStyle} name="courtId" value={formData.courtId} onChange={handleChange}>
                            <option value="">-- Select Court --</option>
                            {courts.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.sport}) - {c.capacity} players</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Manual Location (if no venue) */}
                {!formData.venueId && (
                    <div>
                        <label style={labelStyle}>Location</label>
                        <input
                            style={inputStyle}
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location manually"
                        />
                    </div>
                )}

                {/* Date */}
                <div>
                    <label style={labelStyle}>Date *</label>
                    <input
                        style={inputStyle}
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Available Slots */}
                {availableSlots.length > 0 && (
                    <div>
                        <label style={labelStyle}>Available Slots</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {availableSlots.map((slot, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSlotSelect(slot)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: formData.startTime === slot.start_time ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                                        background: formData.startTime === slot.start_time ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Clock size={14} />
                                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Manual Time Selection */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Start Time *</label>
                        <input
                            style={inputStyle}
                            type="time"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>End Time *</label>
                        <input
                            style={inputStyle}
                            type="time"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Availability Status */}
                {availabilityStatus && formData.courtId && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: availabilityStatus === 'available' ? 'rgba(16, 185, 129, 0.15)' :
                            availabilityStatus === 'unavailable' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${availabilityStatus === 'available' ? 'rgba(16, 185, 129, 0.3)' :
                            availabilityStatus === 'unavailable' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                        color: availabilityStatus === 'available' ? '#6ee7b7' :
                            availabilityStatus === 'unavailable' ? '#fca5a5' : 'rgba(255,255,255,0.6)',
                        fontSize: '14px'
                    }}>
                        {availabilityStatus === 'checking' && '⏳ Checking availability...'}
                        {availabilityStatus === 'available' && '✓ Time slot is available!'}
                        {availabilityStatus === 'unavailable' && '✗ Time slot is not available. Please choose another time.'}
                    </div>
                )}

                {/* Price & Max Participants */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Price</label>
                        <input
                            style={inputStyle}
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g. Rp 50.000"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Max Players</label>
                        <input
                            style={inputStyle}
                            type="number"
                            name="maxParticipants"
                            value={formData.maxParticipants}
                            onChange={handleChange}
                            min={2}
                            max={50}
                        />
                    </div>
                </div>

                {/* Level */}
                <div>
                    <label style={labelStyle}>Skill Level</label>
                    <select style={inputStyle} name="level" value={formData.level} onChange={handleChange}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Open">Open (All levels)</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                        style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your event..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || availabilityStatus === 'unavailable'}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '16px',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading || availabilityStatus === 'unavailable' ? 0.6 : 1,
                        marginTop: '8px',
                        transition: 'transform 0.2s'
                    }}
                >
                    {loading ? 'Creating...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;
