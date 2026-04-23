'use client';
/**
 * Vendor: Feed de Estrenos — Novedades de plataformas de streaming
 */
import React, { useState, useEffect } from 'react';
import { Clapperboard, Search, Loader2, CalendarDays, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface Estreno {
  id: string;
  titulo: string;
  descripcion?: string;
  plataforma: string;
  fecha_estreno?: string;
  imagen_url?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  NETFLIX: '#E50914', DISNEY: '#113CCF', HBO: '#5B2D8E',
  AMAZON: '#FF9900', APPLE: '#1D1D1F', PARAMOUNT: '#0065CC',
  IPTV: '#00A36C', OTHER: '#6B7280',
};

const PLATFORM_EMOJIS: Record<string, string> = {
  NETFLIX: '🔴', DISNEY: '🔵', HBO: '🟣', AMAZON: '🟡', 
  APPLE: '⬛', PARAMOUNT: '⚡', IPTV: '📡', OTHER: '🎬',
};

export default function EstrenosVendorPage() {
  const [estrenos, setEstrenos] = useState<Estreno[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlataforma, setFilterPlataforma] = useState('TODOS');

  const fetchEstrenos = async () => {
    setLoading(true);
    try {
      const d = await api.get('/estrenos');
      setEstrenos(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstrenos();
  }, []);

  const plataformas = ['TODOS', ...Array.from(new Set(estrenos.map(e => e.plataforma)))];

  const filtered = estrenos.filter(e => {
    const matchSearch = e.titulo.toLowerCase().includes(search.toLowerCase());
    const matchPlat = filterPlataforma === 'TODOS' || e.plataforma === filterPlataforma;
    return matchSearch && matchPlat;
  });

  return (
    <div style={{ paddingBottom: '8rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clapperboard color="var(--color-primary)" />
            ESTRENOS <span className="text-gradient-primary">& NOVEDADES</span>
            <button 
                onClick={fetchEstrenos} 
                className="btn-secondary" 
                style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refrescar Estrenos"
            >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>LAS ÚLTIMAS NOTICIAS DE STREAMING PARA TUS CLIENTES</p>
        </div>
      </motion.div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
        <input className="input" placeholder="Buscar estreno..." style={{ paddingLeft: '3.5rem' }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Platform Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', scrollbarWidth: 'none' }}>
        {plataformas.map(p => (
          <button key={p} onClick={() => setFilterPlataforma(p)}
            style={{ whiteSpace: 'nowrap', padding: '0.5rem 1.25rem', borderRadius: 20, border: '2px solid',
              borderColor: filterPlataforma === p ? (PLATFORM_COLORS[p] || 'var(--color-primary)') : '#00000020',
              background: filterPlataforma === p ? (PLATFORM_COLORS[p] || 'var(--color-primary)') : 'transparent',
              color: filterPlataforma === p ? 'white' : 'inherit', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}>
            {PLATFORM_EMOJIS[p] || '🎬'} {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', borderStyle: 'dashed', opacity: 0.4 }}>
          <Clapperboard size={64} style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 900 }}>SIN ESTRENOS DISPONIBLES</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filtered.map((e, i) => (
            <motion.div key={e.id} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ padding: 0, overflow: 'hidden' }}>
              {/* Image */}
              <div style={{ height: 180, background: '#000', position: 'relative', overflow: 'hidden' }}>
                {e.imagen_url
                  ? <img src={e.imagen_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clapperboard size={64} color="white" style={{ opacity: 0.1 }} />
                    </div>}
                <div style={{ position: 'absolute', top: 12, left: 12, background: PLATFORM_COLORS[e.plataforma] || '#000', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 900 }}>
                  {e.plataforma}
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.4rem' }}>{e.titulo}</h3>
                {e.descripcion && <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, marginBottom: '0.75rem' }}>{e.descripcion}</p>}
                {e.fecha_estreno && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 900, fontSize: '0.7rem' }}>
                    <CalendarDays size={14} />
                    {new Date(e.fecha_estreno).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
