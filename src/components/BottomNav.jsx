import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import '../styles/theme.css'; // Ensure theme vars are available

const BottomNav = () => {
    const navStyle = {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 24px', // Extra padding for safe area
        zIndex: 50,
    };

    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontSize: '12px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s',
    });

    return (
        <nav style={navStyle}>
            <NavLink to="/" style={linkStyle}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/explore" style={linkStyle}>
                <Search size={24} />
                <span>Explore</span>
            </NavLink>
            <NavLink to="/create" style={linkStyle}>
                <PlusCircle size={24} />
                <span>Create</span>
            </NavLink>
            <NavLink to="/profile" style={linkStyle}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
