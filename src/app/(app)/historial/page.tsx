'use client';
/**
 * Vendor: Historial de Activaciones — Todos mis servicios activados
 */
import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, Loader2, Package, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface HistorialItem {
  id: string;
  precio_venta: number;
  activo: boolean;
  creado_en: string;
  servicio: { nombre: string; logo_url: string; categoria: string; descripcion_base: string };
}

const CAT_COLORS: Record<string, string> = {
  STREAMING: 'var(--color-primary)', IPTV: '#00A36C', OTRO: '#8B5CF6',
};

export default function HistorialPage() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const d = await api.get('/mis_servicios/historial');
      setHistorial(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const filtered = historial.filter(h => {
    if (filtro === 'ACTIVOS') return h.activo;
    if (filtro === 'INACTIVOS') return !h.activo;
    return true;
  });

  const activos = historial.filter(h => h.activo).length;

  return (
    <div style={{ paddingBottom: '8rem' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History color="var(--color-primary)" />
            HISTORIAL DE <span className="text-gradient-primary">ACTIVACIONES</span>
            <button 
                onClick={fetchHistorial} 
                className="btn-secondary" 
                style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refrescar Historial"
            >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.5 }}>TODOS LOS SERVICIOS QUE HAS ACTIVADO EN TU CUENTA</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'TOTAL', value: historial.length, color: 'var(--color-primary)' },
          { label: 'ACTIVOS', value: activos, color: '#10B981' },
          { label: 'INACTIVOS', value: historial.length - activos, color: '#6B7280' },
        ].map(s => (
          <div key={s.label} className="card-static" style={{ textAlign: 'center', padding: '1.25rem 1rem', background: 'var(--surface-raised)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', background: 'var(--surface-raised)', borderRadius: 20, padding: '0.4rem' }}>
        {(['TODOS', 'ACTIVOS', 'INACTIVOS'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ flex: 1, border: 'none', padding: '0.7rem', borderRadius: 16, fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s',
              background: filtro === f ? 'var(--color-primary)' : 'transparent',
              color: filtro === f ? 'white' : 'inherit' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem', borderStyle: 'dashed', opacity: 0.4 }}>
          <Package size={64} style={{ margin: '0 auto 1.5rem' }} />
          <p style={{ fontWeight: 900 }}>SIN SERVICIOS EN ESTE FILTRO</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((h, i) => (
            <motion.div key={h.id} className={`card-static`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'var(--surface-raised)', opacity: h.activo ? 1 : 0.55 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, border: '2px solid #00000015', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <img src={h.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900 }}>{h.servicio.nombre}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5 }}>
                  Activado: {new Date(h.creado_en).toLocaleDateString('es-ES')} &nbsp;·&nbsp;
                  <span style={{ color: CAT_COLORS[h.servicio.categoria] || '#000' }}>{h.servicio.categoria}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, color: 'var(--color-primary)', fontSize: '1.1rem' }}>Bs {h.precio_venta}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                  {h.activo ? <CheckCircle2 size={14} color="#10B981" /> : <XCircle size={14} color="#6B7280" />}
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: h.activo ? '#10B981' : '#6B7280' }}>
                    {h.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
