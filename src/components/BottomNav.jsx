import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/theme.css';

const BottomNav = () => {
    const navStyle = {
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 24px',
        zIndex: 50,
    };

    const linkStyle = ({ isActive }) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.5)',
        fontSize: '11px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s',
    });

    const { role } = useAuth();

    return (
        <nav style={navStyle}>
            {/* Home */}
            <NavLink to="/" style={linkStyle}>
                <Home size={22} />
                <span>Home</span>
            </NavLink>

            {/* Explore/Search */}
            <NavLink to="/explore" style={linkStyle}>
                <Search size={22} />
                <span>Explore</span>
            </NavLink>

            {/* Create - for community role or any logged in user */}
            <NavLink to="/create" style={linkStyle}>
                <PlusCircle size={22} />
                <span>Create</span>
            </NavLink>

            {/* Communities */}
            <NavLink to="/communities" style={linkStyle}>
                <Users size={22} />
                <span>Groups</span>
            </NavLink>

            {/* Profile */}
            <NavLink to="/profile" style={linkStyle}>
                <User size={22} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
