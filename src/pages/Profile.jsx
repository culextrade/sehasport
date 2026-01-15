import { useEvents } from '../context/EventsContext';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { User, Settings, MapPin, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { events } = useEvents();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <h2 style={{ marginBottom: '16px' }}>Guest</h2>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-fg)',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'bold'
                    }}
                >
                    Login / Sign Up
                </button>
            </div>
        );
    }

    // Filter events created by user
    const myEvents = events.filter(e => e.creator_id === user.id);

    const headerStyle = {
        padding: 'var(--spacing-lg) var(--spacing-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: 'var(--spacing-lg)',
    };

    const avatarStyle = {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-primary)',
    };

    const sectionTitleStyle = {
        fontSize: '18px',
        marginBottom: 'var(--spacing-md)',
        padding: '0 var(--spacing-md)',
    };

    const venuePromoStyle = {
        margin: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-primary)',
        textAlign: 'center',
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div>
            <div style={headerStyle}>
                <div style={avatarStyle}>
                    <User size={32} />
                </div>
                <div>
                    <h1 style={{ fontSize: '20px' }}>{user.email?.split('@')[0]}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Athlete ⚡</p>
                </div>
                <div style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={handleLogout}>
                    <LogOut size={20} color="var(--color-text-muted)" />
                </div>
            </div>

            <div style={venuePromoStyle}>
                <h3 style={{ fontSize: '16px', color: 'var(--color-primary)' }}>Own a Sports Venue?</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '8px 0' }}>
                    List your court and get more bookings.
                </p>
                <button onClick={() => navigate('/venue/register')} style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-primary-fg)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>Register Venue</button>
            </div>

            <div>
                <h2 style={sectionTitleStyle}>My Hosted Games</h2>
                <div style={{ padding: '0 var(--spacing-md)' }}>
                    {myEvents.length === 0 && <p style={{ padding: '0 16px', color: '#666' }}>No games hosted yet.</p>}
                    {myEvents.map(event => (
                        <div key={event.id} onClick={() => navigate(`/event/${event.id}`)}>
                            <EventCard event={event} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Profile;
