import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Calendar, Clock, Trophy, Users, Building2, Coins } from 'lucide-react';
import { useState } from 'react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { events, joinEvent, participations } = useEvents();
    const { user } = useAuth();

    const event = events.find(e => e.id == id);
    const status = (participations && participations[event?.id]) || 'none';
    const [loading, setLoading] = useState(false);

    if (!event) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
                color: '#fff'
            }}>
                Event not found
            </div>
        );
    }

    const handleInterest = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await joinEvent(event.id, 'interested');
    };

    const handleJoin = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        const { error } = await joinEvent(event.id, 'joined');
        setLoading(false);
        if (error) {
            alert('Failed to join: ' + (error.message || error));
        }
    };

    // Format time display
    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5); // HH:MM
    };

    const getSportEmoji = (sport) => {
        const emojis = {
            'tennis': '🎾',
            'padel': '🏸',
            'futsal': '⚽',
            'mini soccer': '⚽',
            'badminton': '🏸',
            'basketball': '🏀'
        };
        return emojis[sport?.toLowerCase()] || '🏃';
    };

    const spotsLeft = (event.max_participants || 4) - (event.participants_count || 0);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            paddingBottom: '120px'
        }}>
            {/* Back Button */}
            <div
                onClick={() => navigate(-1)}
                style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 10,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    padding: '10px',
                    color: 'white',
                    cursor: 'pointer',
                }}
            >
                <ArrowLeft size={22} />
            </div>

            {/* Hero Image */}
            <div style={{ position: 'relative' }}>
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=800'}
                    alt={event.title}
                    style={{ width: '100%', height: '35vh', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '40px 20px 20px',
                    background: 'linear-gradient(transparent, rgba(15, 15, 26, 0.95))'
                }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                            background: 'rgba(99, 102, 241, 0.3)',
                            color: '#a5b4fc',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {getSportEmoji(event.sport)} {event.sport}
                        </span>
                        {event.level && (
                            <span style={{
                                background: 'rgba(56, 189, 248, 0.2)',
                                color: '#7dd3fc',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {event.level}
                            </span>
                        )}
                        {event.is_paid && (
                            <span style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                color: '#fcd34d',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                <Coins size={12} style={{ marginRight: '4px' }} />Paid
                            </span>
                        )}
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '24px', margin: 0, fontWeight: '700' }}>{event.title}</h1>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                {/* Date & Time */}
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Calendar size={20} color="#6366f1" />
                        <span style={{ color: '#fff' }}>{event.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={20} color="#6366f1" />
                        <span style={{ color: '#fff' }}>
                            {event.start_time && event.end_time
                                ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                                : 'Time TBD'
                            }
                        </span>
                    </div>
                </div>

                {/* Venue & Location */}
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {event.venues && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Building2 size={20} color="#10b981" />
                            <span style={{ color: '#fff', fontWeight: '500' }}>{event.venues.name}</span>
                        </div>
                    )}
                    {event.courts && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                            }}>🏟️</div>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {event.courts.name} ({event.courts.capacity} players)
                            </span>
                        </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <MapPin size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                                {event.location || event.venues?.location || 'Location TBD'}
                            </span>
                            {event.venues?.lat && (
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.venues.lat},${event.venues.lng}`, '_blank')}
                                    style={{
                                        marginTop: '8px',
                                        border: '1px solid #6366f1',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: '#a5b4fc',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Navigate ↗
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Users size={20} color="#8b5cf6" />
                        <span style={{ color: '#fff' }}>
                            {event.participants_count || 1} / {event.max_participants || 4} players
                        </span>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${((event.participants_count || 1) / (event.max_participants || 4)) * 100}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: '8px'
                        }} />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '8px' }}>
                        {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left` : 'Event is full'}
                    </p>
                </div>

                {/* Description */}
                {event.description && (
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>About</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
                            {event.description}
                        </p>
                    </div>
                )}

                {/* Price */}
                {event.price && (
                    <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px' }}>Price per person</h3>
                        <span style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>{event.price}</span>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                background: 'rgba(15, 15, 26, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '16px 20px 32px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {status === 'none' && spotsLeft > 0 && (
                    <>
                        <button
                            onClick={handleJoin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '16px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Joining...' : 'Join Event'}
                        </button>
                        <button
                            onClick={handleInterest}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                fontWeight: '500',
                                fontSize: '15px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.15)',
                                cursor: 'pointer'
                            }}
                        >
                            👋 I'm Interested
                        </button>
                    </>
                )}

                {status === 'interested' && (
                    <>
                        <p style={{ textAlign: 'center', color: '#a5b4fc', fontSize: '13px', margin: 0 }}>
                            You're interested! Ready to commit?
                        </p>
                        <button
                            onClick={handleJoin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '16px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Joining...' : 'Join Event'}
                        </button>
                    </>
                )}

                {status === 'joined' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        borderRadius: '12px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7'
                    }}>
                        ✓ You're going to this event!
                    </div>
                )}

                {spotsLeft <= 0 && status === 'none' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '16px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5'
                    }}>
                        Event is full
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetail;
