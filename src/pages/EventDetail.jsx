import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy } from 'lucide-react';
import { useState } from 'react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, joinEvent, user } = useEvents(); // Need user to check if joined?
    // Supabase IDs are numbers (bigint), params.id is string
    const event = events.find(e => e.id == id);
    const [joined, setJoined] = useState(false);
    const [loadingComp, setLoadingComp] = useState(false);

    if (!event) return <div style={{ padding: '20px' }}>Event not found</div>;

    const handleJoin = async () => {
        setLoadingComp(true);
        const { error } = await joinEvent(event.id);
        setLoadingComp(false);
        if (error) {
            if (error === 'Not authenticated') navigate('/login');
            else if (error === 'Already joined') alert('You are already in this game!');
            else alert('Failed to join: ' + error.message);
        } else {
            setJoined(true);
        }
    };

    const navStyle = {
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        padding: '8px',
        color: 'white',
        display: 'flex',
        cursor: 'pointer',
    };

    const imageStyle = {
        width: '100%',
        height: '30vh',
        objectFit: 'cover',
    };

    const contentStyle = {
        padding: 'var(--spacing-lg) var(--spacing-md)',
        paddingBottom: '100px', // Space for bottom button
    };

    const sectionStyle = {
        marginBottom: 'var(--spacing-lg)',
    };

    const labelStyle = {
        color: 'var(--color-text-muted)',
        fontSize: '14px',
        marginBottom: '4px',
        display: 'block',
    };

    const iconRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
    };

    const bottomWithButtonStyle = {
        position: 'fixed',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-surface)',
        padding: '16px',
        borderTop: '1px solid var(--color-border)',
    };

    const btnStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: joined ? 'var(--color-surface-hover)' : 'var(--color-primary)',
        color: joined ? 'var(--color-text)' : 'var(--color-primary-fg)',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: 'var(--radius-md)',
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <div style={navStyle} onClick={() => navigate(-1)}>
                <ArrowLeft size={24} />
            </div>

            <img src={event.image_url} alt={event.title} style={imageStyle} />

            <div style={contentStyle}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                        {event.sport}
                    </span>
                    <h1 style={{ fontSize: '24px', margin: '8px 0' }}>{event.title}</h1>
                </div>

                <div style={sectionStyle}>
                    <div style={iconRowStyle}>
                        <Calendar size={20} color="var(--color-secondary)" />
                        <span>{event.date}</span>
                    </div>
                    <div style={iconRowStyle}>
                        <Clock size={20} color="var(--color-secondary)" />
                        <span>90 mins duration</span>
                    </div>
                    <div style={{ ...iconRowStyle, alignItems: 'flex-start' }}>
                        <MapPin size={20} color="var(--color-secondary)" style={{ marginTop: '2px' }} />
                        <div>
                            <span style={{ display: 'block', marginBottom: '4px' }}>{event.location}</span>
                            {event.venues?.lat && (
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.venues.lat},${event.venues.lng}`, '_blank')}
                                    style={{
                                        border: '1px solid var(--color-primary)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--color-primary)',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Navigate ↗
                                </button>
                            )}
                        </div>
                    </div>
                    {event.level && (
                        <div style={iconRowStyle}>
                            <Trophy size={20} color="var(--color-secondary)" />
                            <span>Level: {event.level}</span>
                        </div>
                    )}
                </div>

                <div style={sectionStyle}>
                    <span style={labelStyle}>About this Game</span>
                    <p style={{ lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                        Join us for a friendly match! We need {(event.max_participants || 4) - (event.participants_count || 0)} more player(s).
                        Please bring your own racket. Ball is provided.
                    </p>
                </div>

                <div style={sectionStyle}>
                    <span style={labelStyle}>Price per person</span>
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{event.price}</span>
                </div>
            </div>

            <div style={bottomWithButtonStyle}>
                <button
                    style={btnStyle}
                    onClick={handleJoin}
                    disabled={joined}
                >
                    {joined ? 'You have joined! ✅' : 'Join Event'}
                </button>
            </div>
        </div>
    );
};

export default EventDetail;
