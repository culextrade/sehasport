import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                setMsg('Account created! Please check your email to verify.');
            } else {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/profile');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--color-text)',
        marginTop: '8px',
        outline: 'none',
    };

    const btnStyle = {
        width: '100%',
        padding: '16px',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-fg)',
        fontWeight: 'bold',
        fontSize: '16px',
        borderRadius: 'var(--radius-md)',
        marginTop: '24px',
        opacity: loading ? 0.7 : 1,
        cursor: loading ? 'not-allowed' : 'pointer'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', marginBottom: '40px' }}>
                <ArrowLeft size={24} />
            </div>

            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
                {isSignUp ? 'Join the Community' : 'Welcome Back'}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                {isSignUp ? 'Find friends to play with 🎾' : 'Login to manage your games'}
            </p>

            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            {msg && <div style={{ color: 'var(--color-primary)', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Email</label>
                    <input
                        type="email"
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Password</label>
                    <input
                        type="password"
                        style={inputStyle}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" style={btnStyle} disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                </button>
            </form>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <span
                    onClick={() => setIsSignUp(!isSignUp)}
                    style={{ color: 'var(--color-primary)', marginLeft: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {isSignUp ? 'Login' : 'Sign Up'}
                </span>
            </p>
        </div>
    );
};

export default Login;
