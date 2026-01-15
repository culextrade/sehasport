import { useState } from 'react';
import { CATEGORIES } from '../data/mockEvents';
import { useEvents } from '../context/EventsContext';
import EventCard from '../components/EventCard';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const navigate = useNavigate();
    const { events } = useEvents();

    const filteredEvents = activeCategory === 'All'
        ? events
        : events.filter(e => e.id === activeCategory.toLowerCase() || e.sport.toLowerCase() === activeCategory.toLowerCase());
    // Simplified filter logic for now

    const handleCategoryClick = (catName) => {
        setActiveCategory(catName === activeCategory ? 'All' : catName);
    };

    const headerStyle = {
        padding: 'var(--spacing-lg) var(--spacing-md)',
        paddingBottom: '0',
    };

    const locationStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'var(--color-secondary)',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: 'var(--spacing-md)',
    };

    const categoryScrollStyle = {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        padding: 'var(--spacing-md)',
        paddingTop: '0',
        scrollbarWidth: 'none',
    };

    const chipStyle = (isActive) => ({
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
        color: isActive ? 'var(--color-primary-fg)' : 'var(--color-text)',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
        transition: 'all 0.2s',
    });

    return (
        <div>
            <div style={headerStyle}>
                <div style={locationStyle}>
                    <MapPin size={16} />
                    <span>Jakarta Selatan, ID</span>
                </div>
                <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Find your game ⚡</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Join 24+ sports events happening around you.
                </p>
            </div>
            {/* Featured Section */}
            {events.find(e => e.is_featured) && (
                <div style={{ padding: '0 var(--spacing-md)', marginBottom: 'var(--spacing-md)' }} onClick={() => navigate(`/event/${events.find(e => e.is_featured).id}`)}>
                    <div style={{
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        color: 'var(--color-primary-fg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Featured Match 🔥</span>
                            <h3 style={{ margin: '4px 0', fontSize: '18px' }}>{events.find(e => e.is_featured).title}</h3>
                            <span style={{ fontSize: '12px' }}>{events.find(e => e.is_featured).location}</span>
                        </div>
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            Join
                        </div>
                    </div>
                </div>
            )}

            <div style={categoryScrollStyle}>
                <button style={chipStyle(activeCategory === 'All')} onClick={() => setActiveCategory('All')}>
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        style={chipStyle(activeCategory === cat.name)}
                        onClick={() => setActiveCategory(cat.name)}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            <div style={{ padding: '0 var(--spacing-md)' }}>
                <h2 style={{ fontSize: '18px', marginBottom: 'var(--spacing-md)' }}>Nearby Events</h2>
                {filteredEvents.map(event => (
                    <div key={event.id} onClick={() => navigate(`/event/${event.id}`)}>
                        <EventCard event={event} />
                    </div>
                ))}
                {filteredEvents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                        No events found for this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
