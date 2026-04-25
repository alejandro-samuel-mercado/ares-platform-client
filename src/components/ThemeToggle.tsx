'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'violet', color: '#F5C518', label: 'Light' },
        { id: 'default', color: '#4F46E5', label: 'Dark' },

        { id: 'red', color: '#EF4444', label: 'Neon' },
    ];

    return (
        <div className="theme-selector">


            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    style={{
                        background: t.id === 'violet' ? 'linear-gradient(135deg, #F5C518, #B45309)' : t.color,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: theme === t.id ? '2px solid #000' : '2px solid rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: theme === t.id ? 'scale(1.25)' : 'scale(1)',
                        boxShadow: theme === t.id ? '4px 4px 0px 0px rgba(0,0,0,0.3)' : 'none',
                        outline: 'none'
                    }}
                    title={t.label}
                />
            ))}
        </div>
    );
}
