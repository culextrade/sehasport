import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { ArrowLeft } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { addEvent } = useEvents();

    // Simple mock image for all new events for now
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800';

    const [formData, setFormData] = useState({
        title: '',
        sport: 'Tennis',
        date: '',
        location: '',
        price: 'Rp ',
        max_participants: 4,
        level: 'Open',
        image_url: DEFAULT_IMAGE
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await addEvent(formData);

        if (error) {
            alert('Failed to create event: ' + error.message);
        } else {
            alert('Event Created Successfully! 🎾');
            navigate('/');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text)',
        fontSize: '16px',
        marginBottom: '16px',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'var(--color-text-muted)',
    };

    const btnStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-fg)',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: 'var(--radius-md)',
        marginTop: '24px',
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </div>
                <h1 style={{ fontSize: '20px' }}>Create Event</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label style={labelStyle}>Event Title</label>
                    <input
                        style={inputStyle}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Sunday Tennis Fun"
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Sport</label>
                    <select
                        style={inputStyle}
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                    >
                        <option value="Tennis">Tennis 🎾</option>
                        <option value="Padel">Padel 🏏</option>
                        <option value="Mini Soccer">Mini Soccer ⚽</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Date & Time</label>
                    <input
                        style={inputStyle}
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        placeholder="e.g. Tomorrow, 19:00"
                        required
                    />
                </div>

                <div>
                    <label style={labelStyle}>Location</label>
                    <input
                        style={inputStyle}
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Venue Name"
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Price</label>
                        <input
                            style={inputStyle}
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Max Players</label>
                        <input
                            type="number"
                            style={inputStyle}
                            name="max_participants"
                            value={formData.max_participants}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button type="submit" style={btnStyle}>Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
