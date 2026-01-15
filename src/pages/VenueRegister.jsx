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
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <MapPin size={20} color="var(--color-text-muted)" />
                    <input
                        style={{ ...inputStyle, marginBottom: 0 }}
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Address / Google Maps Link"
                        required
                    />
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
                    Submit for Review
                </button>
            </form>
        </div>
    );
};
export default VenueRegister;
