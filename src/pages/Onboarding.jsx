import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Users } from 'lucide-react';
import { useState } from 'react';

const Onboarding = () => {
    const { user, setRole } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role) => {
        setLoading(true);
        try {
            await setRole(role);
            // Artificial delay for better UX (so they see the selection)
            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (error) {
            console.error('Failed to set role:', error);
            setLoading(false);
        }
    };

    const cardStyle = {
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Welcome! 👋</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                How do you plan to use SehaSport?
            </p>

            <div
                style={cardStyle}
                onClick={() => handleRoleSelect('player')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
                <div style={{
                    backgroundColor: 'rgba(204, 255, 0, 0.1)',
                    padding: '12px',
                    borderRadius: '50%',
                    color: 'var(--color-primary)'
                }}>
                    <User size={32} />
                </div>
                <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>I want to Play</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        Find games, join matches, and meet new friends.
                    </p>
                </div>
            </div>

            <div
                style={cardStyle}
                onClick={() => handleRoleSelect('community')}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
                <div style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    padding: '12px',
                    borderRadius: '50%',
                    color: 'var(--color-secondary)'
                }}>
                    <Users size={32} />
                </div>
                <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>I organize Games</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        Create events, manage players, and build a community.
                    </p>
                </div>
            </div>

            {loading && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '16px' }}>Setting up your profile...</p>}
        </div>
    );
};

export default Onboarding;
