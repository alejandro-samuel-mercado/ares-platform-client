import { useState, useEffect } from 'react';
import { WatermarkSettings, getWatermarkedUrl } from '@/lib/watermark';
import { useAuth } from '@/lib/auth';

export function useWatermark() {
    const { vendor } = useAuth();
    const [settings, setSettings] = useState<WatermarkSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                const res = await fetch(`${API_BASE}/ajustes-publicos`);
                if (!res.ok) throw new Error('Failed to fetch public settings');
                const data = await res.json();
                setSettings(data);
            } catch (err) {
                console.error("Error fetching watermark settings:", err);
            }
        };
        fetchSettings();
    }, []);

    const getUrl = (originalUrl: string | undefined) => {
        return getWatermarkedUrl(originalUrl, vendor?.plan_id, settings || undefined, vendor?.plan_features?.watermark_enabled);
    };

    return { getUrl, settings };
}
