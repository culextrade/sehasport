import React, { useEffect, useState } from 'react';

const RoleTransition = ({ role, isOpen, onComplete }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onComplete, 300); // Wait for fade out
            }, 2000); // 2 seconds display time
            return () => clearTimeout(timer);
        }
    }, [isOpen, onComplete]);

    if (!isOpen && !visible) return null;

    let title = "Switching Mode...";
    let description = "Updating your interface.";
    let icon = "⚡";

    switch (role) {
        case 'player':
        case 'seeker':
            title = "Entering Player Mode";
            description = "Find games, join events, and play.";
            icon = "👟";
            break;
        case 'community':
            title = "Entering Community Mode";
            description = "Manage events, gather players, and build your community.";
            icon = "📢";
            break;
        case 'venue':
            title = "Entering Venue Mode";
            description = "Manage bookings and showcase your spaces.";
            icon = "🏟️";
            break;
    }

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--color-bg)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: visible ? 'all' : 'none',
    };

    return (
        <div style={overlayStyle}>
            <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>{icon}</div>
            <h2 style={{ fontSize: '24px', color: 'var(--color-primary)', marginBottom: '8px' }}>{title}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>{description}</p>
        </div>
    );
};

export default RoleTransition;
