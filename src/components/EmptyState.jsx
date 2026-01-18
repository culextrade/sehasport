import React from 'react';
import { Sparkles, Calendar, Users } from 'lucide-react';

const EmptyState = ({ title, description, actionLabel, onAction, icon = 'sparkles' }) => {

    const icons = {
        sparkles: <Sparkles size={48} color="var(--color-primary)" />,
        calendar: <Calendar size={48} color="var(--color-secondary)" />,
        users: <Users size={48} color="#F472B6" />
    };

    const style = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--color-border)',
        margin: 'var(--spacing-md) 0',
    };

    return (
        <div style={style}>
            <div style={{ marginBottom: '16px', opacity: 0.8 }}>
                {icons[icon] || icons.sparkles}
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h3>
            <p style={{
                color: 'var(--color-text-muted)',
                fontSize: '14px',
                maxWidth: '300px',
                lineHeight: '1.6',
                marginBottom: actionLabel ? '24px' : '0'
            }}>
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    style={{
                        backgroundColor: 'var(--color-surface-hover)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-primary)',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
