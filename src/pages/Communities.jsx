import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Communities.css';

const Communities = () => {
    const navigate = useNavigate();
    const { communities, myCommunities, loading, joinCommunity } = useCommunity();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('discover');
    const [joiningId, setJoiningId] = useState(null);

    const handleJoin = async (communityId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setJoiningId(communityId);
        const { error } = await joinCommunity(communityId);
        if (error) {
            console.error('Failed to join:', error);
        }
        setJoiningId(null);
    };

    const isJoined = (communityId) => {
        return myCommunities.some(c => c.id === communityId);
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

    const getRoleBadge = (role) => {
        if (role === 'LEADER') return <span className="role-badge leader">Leader</span>;
        if (role === 'ADMIN') return <span className="role-badge admin">Admin</span>;
        return null;
    };

    if (loading) {
        return (
            <div className="communities-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading communities...</p>
                </div>
            </div>
        );
    }

    const displayCommunities = activeTab === 'discover' ? communities : myCommunities;

    return (
        <div className="communities-page">
            <header className="communities-header">
                <h1>Communities</h1>
                {user && (
                    <button
                        className="create-btn"
                        onClick={() => navigate('/communities/create')}
                    >
                        + Create
                    </button>
                )}
            </header>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'discover' ? 'active' : ''}`}
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
                <button
                    className={`tab ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my')}
                >
                    My Communities
                </button>
            </div>

            <div className="communities-list">
                {displayCommunities.length === 0 ? (
                    <div className="empty-state">
                        <span className="emoji">🏟️</span>
                        <h3>{activeTab === 'discover' ? 'No communities yet' : 'You haven\'t joined any community'}</h3>
                        <p>
                            {activeTab === 'discover'
                                ? 'Be the first to create a sports community!'
                                : 'Discover and join communities to connect with players'}
                        </p>
                    </div>
                ) : (
                    displayCommunities.map(community => (
                        <div
                            key={community.id}
                            className="community-card"
                            onClick={() => navigate(`/communities/${community.id}`)}
                        >
                            <div className="community-image">
                                {community.image_url ? (
                                    <img src={community.image_url} alt={community.name} />
                                ) : (
                                    <div className="placeholder-image">
                                        {getSportEmoji(community.sport)}
                                    </div>
                                )}
                            </div>
                            <div className="community-info">
                                <div className="community-name-row">
                                    <h3>{community.name}</h3>
                                    {community.my_role && getRoleBadge(community.my_role)}
                                </div>
                                <p className="community-sport">{getSportEmoji(community.sport)} {community.sport}</p>
                                <p className="community-members">{community.member_count} members</p>
                                {community.description && (
                                    <p className="community-desc">{community.description}</p>
                                )}
                            </div>
                            {activeTab === 'discover' && !isJoined(community.id) && (
                                <button
                                    className="join-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleJoin(community.id);
                                    }}
                                    disabled={joiningId === community.id}
                                >
                                    {joiningId === community.id ? 'Joining...' : 'Join'}
                                </button>
                            )}
                            {isJoined(community.id) && activeTab === 'discover' && (
                                <span className="joined-badge">Joined ✓</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Communities;
