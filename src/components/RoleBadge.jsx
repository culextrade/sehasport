import React from 'react';

const RoleBadge = ({ role }) => {
    let label = 'Observer';
    let color = 'var(--color-text-muted)';
    let bg = 'var(--color-surface)';
    let border = 'var(--color-border)';

    switch (role) {
        case 'player':
        case 'seeker': // normalizing terms
            label = 'Mode: Player';
            color = 'var(--color-primary)';
            bg = 'rgba(204, 255, 0, 0.1)';
            border = 'var(--color-primary)';
            break;
        case 'community':
            label = 'Mode: Community Owner';
            color = 'var(--color-secondary)';
            bg = 'rgba(56, 189, 248, 0.1)';
            border = 'var(--color-secondary)';
            break;
        case 'venue':
            label = 'Mode: Venue Owner';
            color = '#F472B6'; // Pink-ish
            bg = 'rgba(244, 114, 182, 0.1)';
            border = '#F472B6';
            break;
        default:
            break;
    }

    const style = {
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        letterSpacing: '0.025em',
    };

    return (
        <span style={style}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }}></span>
            {label}
        </span>
    );
};

export default RoleBadge;
