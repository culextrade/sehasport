import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import EventCard from '../components/EventCard';
import { Search, Filter, X } from 'lucide-react';

const Explore = () => {
    const navigate = useNavigate();
    const { events, loading } = useEvents();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSport, setSelectedSport] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const sports = ['all', 'tennis', 'padel', 'futsal', 'mini soccer', 'badminton', 'basketball'];
    const levels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'Open'];

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

    // Filter events
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = event.title?.toLowerCase().includes(query);
                const matchesLocation = event.location?.toLowerCase().includes(query);
                const matchesVenue = event.venues?.name?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesLocation && !matchesVenue) return false;
            }

            // Sport filter
            if (selectedSport !== 'all') {
                if (event.sport?.toLowerCase() !== selectedSport.toLowerCase()) return false;
            }

            // Level filter
            if (selectedLevel !== 'all') {
                if (event.level !== selectedLevel) return false;
            }

            return true;
        });
    }, [events, searchQuery, selectedSport, selectedLevel]);

    // Get upcoming and featured events
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = filteredEvents.filter(e => e.date >= today);
    const featuredEvents = filteredEvents.filter(e => e.is_featured);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSport('all');
        setSelectedLevel('all');
    };

    const hasActiveFilters = searchQuery || selectedSport !== 'all' || selectedLevel !== 'all';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', paddingBottom: '0' }}>
                <h1 style={{ color: '#fff', fontSize: '24px', marginBottom: '16px' }}>Explore</h1>

                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Search size={20} color="rgba(255,255,255,0.5)" />
                        <input
                            type="text"
                            placeholder="Search events, venues..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                fontSize: '15px',
                                outline: 'none'
                            }}
                        />
                        {searchQuery && (
                            <X
                                size={18}
                                color="rgba(255,255,255,0.5)"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSearchQuery('')}
                            />
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            background: showFilters ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.08)',
                            border: showFilters ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Filter size={20} color={showFilters ? '#a5b4fc' : 'rgba(255,255,255,0.5)'} />
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Sport</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {sports.map(sport => (
                                    <button
                                        key={sport}
                                        onClick={() => setSelectedSport(sport)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            border: selectedSport === sport ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                                            background: selectedSport === sport ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                            color: selectedSport === sport ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {sport === 'all' ? '🌟 All' : `${getSportEmoji(sport)} ${sport}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Level</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {levels.map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '20px',
                                            border: selectedLevel === level ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                                            background: selectedLevel === level ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                            color: selectedLevel === level ? '#6ee7b7' : 'rgba(255,255,255,0.6)',
                                            fontSize: '13px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {level === 'all' ? 'All Levels' : level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    marginTop: '16px',
                                    padding: '10px',
                                    width: '100%',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    color: '#fca5a5',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Sport Quick Filters (always visible) */}
                {!showFilters && (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        marginBottom: '8px'
                    }}>
                        {sports.map(sport => (
                            <button
                                key={sport}
                                onClick={() => setSelectedSport(sport)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '20px',
                                    border: selectedSport === sport ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                                    background: selectedSport === sport ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: selectedSport === sport ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {sport === 'all' ? '🌟 All' : `${getSportEmoji(sport)} ${sport}`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            <div style={{ padding: '0 20px' }}>
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.5)'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTopColor: '#6366f1',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <p style={{ marginTop: '16px' }}>Loading events...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255,255,255,0.5)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ color: '#fff', marginBottom: '8px' }}>No events found</h3>
                        <p>Try adjusting your filters or search query</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                style={{
                                    marginTop: '16px',
                                    padding: '10px 20px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.4)',
                                    borderRadius: '10px',
                                    color: '#a5b4fc',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results count */}
                        <p style={{
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: '13px',
                            marginBottom: '16px'
                        }}>
                            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                        </p>

                        {/* Featured Events */}
                        {featuredEvents.length > 0 && !hasActiveFilters && (
                            <div style={{ marginBottom: '24px' }}>
                                <h2 style={{
                                    color: '#fff',
                                    fontSize: '18px',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    ⭐ Featured
                                </h2>
                                {featuredEvents.slice(0, 3).map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => navigate(`/event/${event.id}`)}
                                        style={{ marginBottom: '12px', cursor: 'pointer' }}
                                    >
                                        <EventCard event={event} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* All Events */}
                        <div>
                            <h2 style={{
                                color: '#fff',
                                fontSize: '18px',
                                marginBottom: '12px'
                            }}>
                                {hasActiveFilters ? 'Results' : 'All Events'}
                            </h2>
                            {upcomingEvents.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    style={{ marginBottom: '12px', cursor: 'pointer' }}
                                >
                                    <EventCard event={event} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Explore;
