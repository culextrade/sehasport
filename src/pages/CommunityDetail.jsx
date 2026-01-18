import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import '../styles/CommunityDetail.css';

const CommunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        getCommunityById,
        joinCommunity,
        leaveCommunity,
        transferLeadership,
        promoteMember,
        isMember,
        getMyRole
    } = useCommunity();
    const { events } = useEvents();

    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [showTransferModal, setShowTransferModal] = useState(false);

    const myRole = getMyRole(parseInt(id));
    const isLeader = myRole === 'LEADER';
    const isAdmin = myRole === 'ADMIN';
    const canManage = isLeader || isAdmin;

    useEffect(() => {
        loadCommunity();
    }, [id]);

    const loadCommunity = async () => {
        setLoading(true);
        const { data, error } = await getCommunityById(parseInt(id));
        if (data) {
            setCommunity(data);
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await joinCommunity(parseInt(id));
        loadCommunity();
    };

    const handleLeave = async () => {
        if (window.confirm('Are you sure you want to leave this community?')) {
            const { error } = await leaveCommunity(parseInt(id));
            if (error) {
                alert(error);
            } else {
                navigate('/communities');
            }
        }
    };

    const handleTransfer = async (newLeaderId) => {
        await transferLeadership(parseInt(id), newLeaderId);
        setShowTransferModal(false);
        loadCommunity();
    };

    const handlePromote = async (memberId) => {
        await promoteMember(parseInt(id), memberId);
        loadCommunity();
    };

    const getSportEmoji = (sport) => {
        const emojis = {
            'tennis': '🎾',
            'padel': '🏸',
            'futsal': '⚽',
            'mini soccer': '⚽'
        };
        return emojis[sport?.toLowerCase()] || '🏃';
    };

    const getRoleBadgeClass = (role) => {
        if (role === 'LEADER') return 'leader';
        if (role === 'ADMIN') return 'admin';
        return 'member';
    };

    // Filter events owned by this community
    const communityEvents = events.filter(
        e => e.owner_type === 'COMMUNITY' && e.owner_id === id
    );

    if (loading) {
        return (
            <div className="community-detail-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="community-detail-page">
                <div className="error-state">
                    <h2>Community not found</h2>
                    <button onClick={() => navigate('/communities')}>Back to Communities</button>
                </div>
            </div>
        );
    }

    return (
        <div className="community-detail-page">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate('/communities')}>
                    ← Back
                </button>
            </header>

            <div className="community-hero">
                {community.image_url ? (
                    <img src={community.image_url} alt={community.name} className="hero-image" />
                ) : (
                    <div className="hero-placeholder">
                        {getSportEmoji(community.sport)}
                    </div>
                )}
                <div className="hero-overlay">
                    <h1>{community.name}</h1>
                    <p className="sport-tag">{getSportEmoji(community.sport)} {community.sport}</p>
                    <p className="member-count">{community.community_members?.length || 0} members</p>
                </div>
            </div>

            {community.description && (
                <div className="description-section">
                    <p>{community.description}</p>
                </div>
            )}

            <div className="action-buttons">
                {!isMember(parseInt(id)) && (
                    <button className="primary-btn" onClick={handleJoin}>
                        Join Community
                    </button>
                )}
                {canManage && (
                    <button
                        className="primary-btn"
                        onClick={() => navigate('/events/create', { state: { communityId: id } })}
                    >
                        Create Event
                    </button>
                )}
                {isMember(parseInt(id)) && myRole !== 'LEADER' && (
                    <button className="secondary-btn danger" onClick={handleLeave}>
                        Leave
                    </button>
                )}
                {isLeader && (
                    <button className="secondary-btn" onClick={() => setShowTransferModal(true)}>
                        Transfer Leadership
                    </button>
                )}
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    Events
                </button>
                <button
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    Members
                </button>
            </div>

            {activeTab === 'events' && (
                <div className="events-section">
                    {communityEvents.length === 0 ? (
                        <div className="empty-state">
                            <span className="emoji">📅</span>
                            <p>No events yet</p>
                        </div>
                    ) : (
                        communityEvents.map(event => (
                            <div
                                key={event.id}
                                className="event-card"
                                onClick={() => navigate(`/events/${event.id}`)}
                            >
                                <h3>{event.title}</h3>
                                <p>{event.date} • {event.start_time}</p>
                                <p>{event.participants_count}/{event.max_participants} participants</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'members' && (
                <div className="members-section">
                    {community.community_members?.map(member => (
                        <div key={member.user_id} className="member-card">
                            <div className="member-avatar">
                                {member.profiles?.avatar_url ? (
                                    <img src={member.profiles.avatar_url} alt="" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {member.profiles?.full_name?.[0] || '?'}
                                    </div>
                                )}
                            </div>
                            <div className="member-info">
                                <span className="member-name">
                                    {member.profiles?.full_name || member.profiles?.email || 'Unknown'}
                                </span>
                                <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                                    {member.role}
                                </span>
                            </div>
                            {isLeader && member.role === 'MEMBER' && (
                                <button
                                    className="promote-btn"
                                    onClick={() => handlePromote(member.user_id)}
                                >
                                    Promote to Admin
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showTransferModal && (
                <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Transfer Leadership</h2>
                        <p>Select a member to become the new leader:</p>
                        <div className="member-list">
                            {community.community_members
                                ?.filter(m => m.role !== 'LEADER')
                                .map(member => (
                                    <button
                                        key={member.user_id}
                                        className="member-option"
                                        onClick={() => handleTransfer(member.user_id)}
                                    >
                                        {member.profiles?.full_name || 'Unknown'}
                                        <span className={`role-badge ${getRoleBadgeClass(member.role)}`}>
                                            {member.role}
                                        </span>
                                    </button>
                                ))
                            }
                        </div>
                        <button className="cancel-btn" onClick={() => setShowTransferModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityDetail;
