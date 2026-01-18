import { useState } from 'react';
import { CATEGORIES } from '../data/mockEvents';
import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, MapPin as VenueIcon } from 'lucide-react';
import EventCard from '../components/EventCard';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';

const SeekerHome = ({ events, activeCategory, setActiveCategory, navigate }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [sortByDistance, setSortByDistance] = useState(false);

    // Get User Location on Mount
    useState(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setSortByDistance(true); // Auto-enable sort if location found
                },
                (err) => console.log('Location access denied', err)
            );
        }
    }, []);

    // Haversine Formula for Distance (km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Process Events with Distance
    const eventsWithDistance = events.map(event => {
        // Check if event has joined venue data
        const venueLat = event.venues?.lat;
        const venueLng = event.venues?.lng;
        const dist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, venueLat, venueLng) : null;
        return { ...event, distance: dist };
    });

    let filteredEvents = activeCategory === 'All'
        ? eventsWithDistance
        : eventsWithDistance.filter(e => e.id === activeCategory.toLowerCase() || e.sport.toLowerCase() === activeCategory.toLowerCase());

    // Sort by Distance if enabled and location available
    if (sortByDistance && userLocation) {
        filteredEvents.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });
    }

    const headerStyle = { padding: 'var(--spacing-lg) var(--spacing-md)', paddingBottom: '0' };
    const locationStyle = { display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)', fontSize: '14px', fontWeight: '500', marginBottom: 'var(--spacing-md)' };
    const categoryScrollStyle = { display: 'flex', gap: '12px', overflowX: 'auto', padding: 'var(--spacing-md)', paddingTop: '0', scrollbarWidth: 'none' };
    const chipStyle = (isActive) => ({
        padding: '8px 16px', borderRadius: 'var(--radius-full)', backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
        color: isActive ? 'var(--color-primary-fg)' : 'var(--color-text)', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap',
        cursor: 'pointer', border: '1px solid', borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)', transition: 'all 0.2s'
    });

    return (
        <div>
            <div style={headerStyle}>
                <div style={locationStyle}>
                    <MapPin size={16} />
                    <span>{userLocation ? 'Your Location (GPS)' : 'Jakarta Selatan, ID'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Find your game ⚡</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Join 24+ sports events happening around you.</p>
                <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                    <RoleBadge role="player" />
                </div>
            </div>

            {/* Featured Section */}
            {events.find(e => e.is_featured) && (
                <div style={{ padding: '0 var(--spacing-md)', marginBottom: 'var(--spacing-md)' }} onClick={() => navigate(`/event/${events.find(e => e.is_featured).id}`)}>
                    <div style={{
                        backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', padding: '16px', color: 'var(--color-primary-fg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Featured Match 🔥</span>
                            <h3 style={{ margin: '4px 0', fontSize: '18px' }}>{events.find(e => e.is_featured).title}</h3>
                            <span style={{ fontSize: '12px' }}>{events.find(e => e.is_featured).location}</span>
                        </div>
                        <div style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 'bold' }}>Join</div>
                    </div>
                </div>
            )}

            <div style={categoryScrollStyle}>
                <button style={chipStyle(activeCategory === 'All')} onClick={() => setActiveCategory('All')}>All</button>
                {CATEGORIES.map(cat => (
                    <button key={cat.id} style={chipStyle(activeCategory === cat.name)} onClick={() => setActiveCategory(cat.name)}>{cat.icon} {cat.name}</button>
                ))}
            </div>

            <div style={{ padding: '0 var(--spacing-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <h2 style={{ fontSize: '18px' }}>
                        {sortByDistance ? 'Nearest Events' : 'Nearby Events'}
                    </h2>
                </div>

                {filteredEvents.length === 0 ? (
                    <EmptyState
                        title="No events found"
                        description="Try changing the category filter or looking in a different area."
                        icon="sparkles"
                    />
                ) : (
                    filteredEvents.map(event => (
                        <div key={event.id} onClick={() => navigate(`/event/${event.id}`)}>
                            <EventCard event={event} />
                            {event.distance && (
                                <div style={{
                                    fontSize: '12px', color: 'var(--color-primary)', marginTop: '-8px', marginBottom: '16px',
                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'
                                }}>
                                    <MapPin size={12} /> {event.distance.toFixed(1)} km away
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const CommunityDashboard = ({ events, user, navigate }) => {
    // Filter events created by this user
    // Note: In a real app we'd filter by creator_id. For MVP mock data we might not have it unless we query DB.
    // Let's assume 'events' context has creator_id if fetched from DB.

    // For now, let's just show "My Events" placeholder or real filter if possible
    const myEvents = events.filter(e => e.creator_id === user?.id);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Community Dashboard 📢</h1>
                <RoleBadge role="community" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '32px', color: 'var(--color-primary)', margin: 0 }}>{myEvents.length}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Active Events</span>
                </div>
                <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '32px', color: 'white', margin: 0 }}>0</h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Participants joined</span>
                </div>
            </div>

            <button
                onClick={() => navigate('/create')}
                style={{
                    width: '100%', padding: '16px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)',
                    borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px'
                }}
            >
                <Plus size={20} /> Create New Event
            </button>

            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Your Events</h2>
            {myEvents.length > 0 ? (
                myEvents.map(e => (
                    <div key={e.id} style={{ backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 'bold' }}>{e.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <Calendar size={12} /> {e.date}
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState
                    title="Community is quiet..."
                    description="Usually, the first post is the hardest. Break the ice!"
                    actionLabel="Create First Event"
                    onAction={() => navigate('/create')}
                    icon="users"
                />
            )}
        </div>
    );
};

const VenueDashboard = ({ navigate }) => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Venue Dashboard 🏟️</h1>
                <RoleBadge role="venue" />
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <VenueIcon size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
                <h3>Your Venue Profile</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    You are registered as a Venue Owner. Users can see your venue when exploring events.
                </p>
                <button
                    onClick={() => navigate('/venue/register')}
                    style={{ padding: '8px 16px', backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '8px' }}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
}


const Home = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const navigate = useNavigate();
    const { events } = useEvents();
    const { role, user } = useAuth();

    if (role === 'community') {
        return <CommunityDashboard events={events} user={user} navigate={navigate} />;
    }

    if (role === 'venue') {
        return <VenueDashboard navigate={navigate} />;
    }

    // Default to Seeker
    return <SeekerHome events={events} activeCategory={activeCategory} setActiveCategory={setActiveCategory} navigate={navigate} />;
};

export default Home;
