import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const VenueRegister = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        sports: '',
        lat: null,
        lng: null
    });
    const [loading, setLoading] = useState(false);
    const [gpsError, setGpsError] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!user) {
            alert('Please login first');
            navigate('/login');
            return;
        }

        try {
            const { error } = await supabase
                .from('venues')
                .insert([{
                    ...formData,
                    owner_id: user.id
                }]);

            if (error) throw error;
            alert('Venue Registered! 🏟️');
            navigate('/profile');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text)',
        marginBottom: '16px',
    };

    const uploadBoxStyle = {
        border: '2px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        marginBottom: '24px',
        cursor: 'pointer',
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </div>
                <h1 style={{ fontSize: '20px' }}>Register Venue</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={uploadBoxStyle}>
                    <Camera size={32} style={{ marginBottom: '8px' }} />
                    <p>Tap to upload venue photos</p>
                </div>

                <input
                    style={inputStyle}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Venue Name"
                    required
                />

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        <MapPin size={20} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Location</span>
                    </div>

                    <input
                        style={{ ...inputStyle, marginBottom: '8px' }}
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Address text (e.g. Jalan Sudirman No. 1)"
                        required
                    />

                    <button
                        type="button"
                        onClick={handleGetLocation}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontWeight: '500'
                        }}
                    >
                        <MapPin size={16} />
                        {formData.lat ? 'Location Tagged ✅' : 'Get Current Location (GPS)'}
                    </button>

                    {gpsError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{gpsError}</div>}

                    {formData.lat && (
                        <div style={{ marginTop: '8px' }}>
                            <a
                                href={`https://www.google.com/maps?q=${formData.lat},${formData.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'underline' }}
                            >
                                Check on Google Maps ↗
                            </a>
                        </div>
                    )}
                </div>

                <input
                    style={inputStyle}
                    name="sports"
                    value={formData.sports}
                    onChange={handleChange}
                    placeholder="Available Sports (e.g. Tennis, Futsal)"
                    required
                />

                <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
                    {loading && !formData.lat ? 'Getting Location...' : 'Submit for Review'}
                </button>
            </form>
        </div>
    );
};
export default VenueRegister;
