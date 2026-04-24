/**
 * Flyers — Ares v3 (Material Publicitario para WhatsApp/Facebook)
 * Descarga flyers individualmente o todos juntos.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Image as ImageIcon, Loader2, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface Imagen { id: string; titulo: string; url_base: string; categoria: string; etiquetas: string; }

export default function FlyersPage() {
  const [flyers, setFlyers] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const all = await api.get('/imagenes');
      setFlyers(all.filter((img: Imagen) => img.categoria === 'FLYER'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const downloadImage = async (url: string, name: string, id?: string) => {
    try {
      if (id) setDownloading(prev => new Set(prev).add(id));
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name.replace(/\s+/g, '_')}.jpg`;
      link.click();
      URL.revokeObjectURL(link.href);
      if (id) {
        const next = new Set(downloading);
        next.delete(id);
        setDownloading(next);
      }
    } catch { if (id) { const next = new Set(downloading); next.delete(id); setDownloading(next); } }
  };

  const downloadAll = async () => {
    setDownloadingAll(true);
    for (const flyer of flyers) {
      await downloadImage(flyer.url_base, flyer.titulo);
      await new Promise(r => setTimeout(r, 300));
    }
    setDownloadingAll(false);
    showToast(`${flyers.length} flyers descargados ✅`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
      <AnimatePresence>{toast && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
          style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'var(--surface-raised)', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontWeight: 800, fontSize: '0.9rem' }}>
          {toast}
        </motion.div>
      )}</AnimatePresence>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="text-gradient-primary">FLYERS</span>
            <button onClick={load} className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}><RefreshCw size={20} /></button>
          </h1>
          <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Material publicitario para WhatsApp y Facebook</p>
        </div>
        {flyers.length > 0 && (
          <button className="btn-primary" onClick={downloadAll} disabled={downloadingAll}
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {downloadingAll ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            DESCARGAR TODOS ({flyers.length})
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '5rem 0', textAlign: 'center' }}>
          <Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} />
        </div>
      ) : flyers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ImageIcon size={50} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontWeight: 900, color: 'var(--text-primary)' }}>SIN FLYERS DISPONIBLES</h3>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.5rem' }}>El admin aún no ha subido material publicitario</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {flyers.map((flyer, idx) => (
            <motion.div key={flyer.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              style={{ padding: 0, overflow: 'hidden', background: 'var(--surface-raised)' }}>
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#000', position: 'relative' }}>
                <img src={flyer.url_base} alt={flyer.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>{flyer.titulo}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {(() => { try { return JSON.parse(flyer.etiquetas).join(', '); } catch { return ''; } })()}
                  </div>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => downloadImage(flyer.url_base, flyer.titulo, flyer.id)}
                  disabled={downloading.has(flyer.id)}
                  style={{ width: '42px', height: '42px', padding: 0, borderRadius: '14px' }}
                >
                  {downloading.has(flyer.id) ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
