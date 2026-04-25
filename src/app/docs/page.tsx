'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/landing?tab=docs');
    }, [router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--surface-base)' }}>
            <h2 style={{ color: 'var(--text-muted)' }}>Cargando Documentación...</h2>
        </div>
    );
}
