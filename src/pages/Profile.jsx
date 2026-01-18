import { useState, useEffect } from 'react';
import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { useVenue } from '../context/VenueContext';
import EventCard from '../components/EventCard';
import RoleBadge from '../components/RoleBadge';
import RoleTransition from '../components/RoleTransition';
import EmptyState from '../components/EmptyState';
import { User, LogOut, Calendar, Users, Building2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { events, getMyEvents, participations } = useEvents();
    const { user, signOut, role, setRole, profile } = useAuth();
    const { myCommunities } = useCommunity();
    const { myVenues } = useVenue();
    const navigate = useNavigate();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [targetRole, setTargetRole] = useState(null);
    const [activeTab, setActiveTab] = useState('events');

    if (!user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <User size={40} color="#6366f1" />
                </div>
                <h2 style={{ color: '#fff', marginBottom: '8px' }}>Welcome to SehaSport</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '24px', textAlign: 'center' }}>
                    Sign in to create events, join games, and connect with players
                </p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        padding: '14px 32px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Login / Sign Up
                </button>
            </div>
        );
    }

    // Get user's created events (using new owner_type model)
    const myCreatedEvents = events.filter(e =>
        e.owner_type === 'USER' && e.owner_id === user.id
    );

    // Get events user has joined
    const myJoinedEvents = events.filter(e =>
        participations[e.id] === 'joined' &&
        !(e.owner_type === 'USER' && e.owner_id === user.id)
    );

    const handleRoleSwitch = (newRole) => {
        if (newRole === role) return;
        setTargetRole(newRole);
        setIsTransitioning(true);
    };

    const completeTransition = () => {
        if (setRole) setRole(targetRole);
        setIsTransitioning(false);
        setTargetRole(null);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
            paddingBottom: '100px'
        }}>
            <RoleTransition
                role={targetRole}
                isOpen={isTransitioning}
                onComplete={completeTransition}
            />

            {/* Header */}
            <div style={{
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <User size={28} color="#fff" />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ color: '#fff', fontSize: '20px', margin: 0 }}>
                        {profile?.full_name || user.email?.split('@')[0]}
                    </h1>
                    <div style={{ marginTop: '6px' }}>
                        <RoleBadge role={role || 'seeker'} />
                    </div>
                </div>
                <div onClick={handleLogout} style={{ cursor: 'pointer', padding: '8px' }}>
                    <LogOut size={22} color="rgba(255,255,255,0.5)" />
                </div>
            </div>

            {/* Role Switch */}
            <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '10px' }}>Switch Mode</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['seeker', 'community', 'venue'].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRoleSwitch(r)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '20px',
                                border: role === r ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.15)',
                                background: role === r ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: role === r ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                                fontSize: '13px',
                                fontWeight: role === r ? '600' : '400',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '0 20px',
                marginBottom: '24px'
            }}>
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Calendar size={20} color="#6366f1" style={{ marginBottom: '8px' }} />
                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>{myCreatedEvents.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Created</div>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Users size={20} color="#10b981" style={{ marginBottom: '8px' }} />
                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>{myCommunities.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Groups</div>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Building2 size={20} color="#f59e0b" style={{ marginBottom: '8px' }} />
                    <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>{myVenues.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Venues</div>
                </div>
            </div>

            {/* Quick Actions */}
            {role === 'venue' && myVenues.length === 0 && (
                <div
                    onClick={() => navigate('/venue/register')}
                    style={{
                        margin: '0 20px 20px',
                        padding: '16px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                >
                    <div>
                        <p style={{ color: '#fcd34d', fontWeight: '600', margin: 0 }}>Register Your Venue</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0' }}>List courts & get bookings</p>
                    </div>
                    <ChevronRight size={20} color="#fcd34d" />
                </div>
            )}

            {myVenues.length > 0 && (
                <div
                    onClick={() => navigate('/venue/register')}
                    style={{
                        margin: '0 20px 20px',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Building2 size={20} color="#f59e0b" />
                        <div>
                            <p style={{ color: '#fff', fontWeight: '500', margin: 0 }}>Manage Venues</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '2px 0 0' }}>
                                {myVenues.length} venue{myVenues.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
                </div>
            )}

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '0 20px',
                marginBottom: '16px'
            }}>
                {['events', 'joined', 'groups'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === tab ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                            color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
                            fontWeight: activeTab === tab ? '600' : '400',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'events' ? 'My Events' : tab === 'joined' ? 'Joined' : 'My Groups'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px' }}>
                {activeTab === 'events' && (
                    <>
                        {myCreatedEvents.length === 0 ? (
                            <EmptyState
                                title="No events created"
                                description="You haven't hosted any events yet"
                                actionLabel="Create Event"
                                onAction={() => navigate('/create')}
                                icon="calendar"
                            />
                        ) : (
                            myCreatedEvents.map(event => (
                                <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{ marginBottom: '12px' }}>
                                    <EventCard event={event} />
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'joined' && (
                    <>
                        {myJoinedEvents.length === 0 ? (
                            <EmptyState
                                title="No events joined"
                                description="You haven't joined any events yet"
                                actionLabel="Explore Events"
                                onAction={() => navigate('/explore')}
                                icon="calendar"
                            />
                        ) : (
                            myJoinedEvents.map(event => (
                                <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{ marginBottom: '12px' }}>
                                    <EventCard event={event} />
                                </div>
                            ))
                        )}
                    </>
                )}

                {activeTab === 'groups' && (
                    <>
                        {myCommunities.length === 0 ? (
                            <EmptyState
                                title="No groups joined"
                                description="Join communities to connect with players"
                                actionLabel="Browse Groups"
                                onAction={() => navigate('/communities')}
                                icon="users"
                            />
                        ) : (
                            myCommunities.map(community => (
                                <div
                                    key={community.id}
                                    onClick={() => navigate(`/communities/${community.id}`)}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: '12px',
                                        padding: '14px',
                                        marginBottom: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                >
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px'
                                    }}>
                                        {community.image_url ? (
                                            <img src={community.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                        ) : (
                                            '🏟️'
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: '#fff', fontWeight: '500', margin: 0 }}>{community.name}</p>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0' }}>
                                            {community.sport} • {community.member_count} members
                                        </p>
                                    </div>
                                    {community.my_role && (
                                        <span style={{
                                            background: community.my_role === 'LEADER' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                            color: community.my_role === 'LEADER' ? '#fcd34d' : '#a5b4fc',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: '600'
                                        }}>
                                            {community.my_role}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;
