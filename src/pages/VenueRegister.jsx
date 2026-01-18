import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Plus, Trash2, Building2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useVenue } from '../context/VenueContext';

const VenueRegister = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { myVenues, fetchMyVenues, addCourt } = useVenue();

    const [mode, setMode] = useState('list'); // 'list' or 'create'
    const [selectedVenue, setSelectedVenue] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        sports: '',
        lat: null,
        lng: null,
        description: '',
        image_url: ''
    });

    const [courts, setCourts] = useState([]);
    const [newCourt, setNewCourt] = useState({ name: '', sport: 'tennis', capacity: 4 });

    const [loading, setLoading] = useState(false);
    const [gpsError, setGpsError] = useState(null);

    useEffect(() => {
        if (user) fetchMyVenues();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetLocation = () => {
        setLoading(true);
        setGpsError(null);
        if (!navigator.geolocation) {
            setGpsError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (error) => {
                setGpsError('Unable to retrieve location: ' + error.message);
                setLoading(false);
            }
        );
    };

    const handleAddCourt = () => {
        if (!newCourt.name.trim()) return;
        setCourts([...courts, { ...newCourt, id: Date.now() }]);
        setNewCourt({ name: '', sport: 'tennis', capacity: 4 });
    };

    const handleRemoveCourt = (id) => {
        setCourts(courts.filter(c => c.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!user) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            // Create venue
            const { data: venue, error: venueError } = await supabase
                .from('venues')
                .insert([{
                    name: formData.name,
                    location: formData.location,
                    sports: formData.sports,
                    description: formData.description,
                    image_url: formData.image_url,
                    lat: formData.lat,
                    lng: formData.lng,
                    owner_id: user.id
                }])
                .select()
                .single();

            if (venueError) throw venueError;

            // Create courts
            if (courts.length > 0) {
                const courtsData = courts.map(c => ({
                    venue_id: venue.id,
                    name: c.name,
                    sport: c.sport,
                    capacity: c.capacity,
                    is_active: true
                }));

                const { error: courtsError } = await supabase
                    .from('courts')
                    .insert(courtsData);

                if (courtsError) console.error('Courts error:', courtsError);
            }

            alert('Venue Registered! 🏟️');
            fetchMyVenues();
            setMode('list');
            setFormData({ name: '', location: '', sports: '', lat: null, lng: null, description: '', image_url: '' });
            setCourts([]);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourtToVenue = async () => {
        if (!newCourt.name.trim() || !selectedVenue) return;

        const { error } = await addCourt(selectedVenue.id, newCourt);
        if (!error) {
            setNewCourt({ name: '', sport: 'tennis', capacity: 4 });
            fetchMyVenues();
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
    };

    const sports = ['tennis', 'padel', 'futsal', 'mini soccer', 'badminton', 'basketball'];

    // List Mode - Show my venues
    if (mode === 'list') {
        return (
            <div style={{ minHeight: '100vh', padding: '20px', paddingBottom: '100px', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div onClick={() => navigate('/profile')} style={{ cursor: 'pointer', color: '#fff' }}>
                        <ArrowLeft size={24} />
                    </div>
                    <h1 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>My Venues</h1>
                </div>

                {/* Create New Venue Button */}
                <button
                    onClick={() => setMode('create')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '24px'
                    }}
                >
                    <Plus size={20} /> Register New Venue
                </button>

                {/* Venues List */}
                {myVenues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                        <Building2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>You haven't registered any venues yet</p>
                    </div>
                ) : (
                    myVenues.map(venue => (
                        <div key={venue.id} style={{
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '16px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>{venue.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 8px' }}>
                                <MapPin size={14} style={{ marginRight: '4px' }} />
                                {venue.location}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 12px' }}>
                                {venue.courts?.length || 0} courts registered
                            </p>

                            {/* Courts List */}
                            {venue.courts?.length > 0 && (
                                <div style={{ marginBottom: '12px' }}>
                                    {venue.courts.map(court => (
                                        <div key={court.id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ color: '#fff', fontSize: '14px' }}>{court.name}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                                {court.sport} • {court.capacity} players
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Court Form */}
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px' }}>Add Court:</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <input
                                        style={{ ...inputStyle, flex: '1', minWidth: '120px', padding: '8px 12px' }}
                                        placeholder="Court name"
                                        value={selectedVenue?.id === venue.id ? newCourt.name : ''}
                                        onChange={(e) => {
                                            setSelectedVenue(venue);
                                            setNewCourt({ ...newCourt, name: e.target.value });
                                        }}
                                        onFocus={() => setSelectedVenue(venue)}
                                    />
                                    <select
                                        style={{ ...inputStyle, width: '100px', padding: '8px' }}
                                        value={selectedVenue?.id === venue.id ? newCourt.sport : 'tennis'}
                                        onChange={(e) => {
                                            setSelectedVenue(venue);
                                            setNewCourt({ ...newCourt, sport: e.target.value });
                                        }}
                                        onFocus={() => setSelectedVenue(venue)}
                                    >
                                        {sports.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button
                                        onClick={handleAddCourtToVenue}
                                        style={{
                                            background: '#6366f1',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 16px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    // Create Mode - Register new venue
    return (
        <div style={{ minHeight: '100vh', padding: '20px', paddingBottom: '100px', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div onClick={() => setMode('list')} style={{ cursor: 'pointer', color: '#fff' }}>
                    <ArrowLeft size={24} />
                </div>
                <h1 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>Register Venue</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Image Upload Placeholder */}
                <div style={{
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    padding: '32px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer'
                }}>
                    <Camera size={32} style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>Tap to upload venue photos</p>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Venue Name *</label>
                    <input style={inputStyle} name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sport Center Jakarta" required />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Address *</label>
                    <input style={inputStyle} name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Jl. Sudirman No. 1" required />
                </div>

                <button
                    type="button"
                    onClick={handleGetLocation}
                    style={{
                        padding: '12px',
                        background: formData.lat ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                        border: `1px solid ${formData.lat ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: '12px',
                        color: formData.lat ? '#6ee7b7' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <MapPin size={18} />
                    {formData.lat ? '✓ Location Tagged' : 'Get GPS Location'}
                </button>
                {gpsError && <p style={{ color: '#fca5a5', fontSize: '12px', margin: 0 }}>{gpsError}</p>}

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Sports Available *</label>
                    <input style={inputStyle} name="sports" value={formData.sports} onChange={handleChange} placeholder="e.g. Tennis, Futsal, Badminton" required />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>Description</label>
                    <textarea
                        style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your venue..."
                    />
                </div>

                {/* Courts Section */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h3 style={{ color: '#fff', margin: '0 0 12px', fontSize: '16px' }}>Courts / Fields</h3>

                    {courts.map(court => (
                        <div key={court.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            marginBottom: '8px'
                        }}>
                            <span style={{ color: '#fff' }}>{court.name} ({court.sport})</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveCourt(court.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <input
                            style={{ ...inputStyle, flex: 1, padding: '10px' }}
                            placeholder="Court name (e.g. Court A)"
                            value={newCourt.name}
                            onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                        />
                        <select
                            style={{ ...inputStyle, width: '100px', padding: '10px' }}
                            value={newCourt.sport}
                            onChange={(e) => setNewCourt({ ...newCourt, sport: e.target.value })}
                        >
                            {sports.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            type="number"
                            style={{ ...inputStyle, width: '60px', padding: '10px' }}
                            value={newCourt.capacity}
                            onChange={(e) => setNewCourt({ ...newCourt, capacity: parseInt(e.target.value) || 4 })}
                            min={2}
                            max={30}
                        />
                        <button
                            type="button"
                            onClick={handleAddCourt}
                            style={{
                                background: '#6366f1',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 16px',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        marginTop: '8px'
                    }}
                >
                    {loading ? 'Registering...' : 'Register Venue'}
                </button>
            </form>
        </div>
    );
};

export default VenueRegister;
