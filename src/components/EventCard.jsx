import { MapPin, Clock, Users } from 'lucide-react';
import '../styles/theme.css';

const EventCard = ({ event }) => {
    const cardStyle = {
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 'var(--spacing-md)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    };

    const imageStyle = {
        width: '100%',
        height: '140px',
        objectFit: 'cover',
    };

    const contentStyle = {
        padding: 'var(--spacing-md)',
    };

    const badgeStyle = {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-fg)',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 'var(--spacing-xs)',
        display: 'inline-block',
    };

    const detailRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--color-text-muted)',
        fontSize: '12px',
        marginTop: '6px',
    };

    return (
        <div style={cardStyle}>
            <img src={event.image_url} alt={event.title} style={imageStyle} />
            <div style={contentStyle}>
                <span style={badgeStyle}>{event.sport}</span>
                <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{event.title}</h3>

                <div style={detailRowStyle}>
                    <Clock size={14} />
                    <span>{event.date}</span>
                </div>
                <div style={detailRowStyle}>
                    <MapPin size={14} />
                    <span>{event.location}</span>
                </div>
                <div style={{ ...detailRowStyle, justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Users size={14} />
                        <span>{event.participants_count || 1}/{event.max_participants || 4}</span>
                    </div>
                    <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{event.price}</span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
