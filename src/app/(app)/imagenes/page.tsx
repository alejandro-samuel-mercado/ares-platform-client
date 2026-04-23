/**
 * Página: Banco de Imágenes — App Vendedor Ares v2 (Cartoon-Futurista)
 * 
 * Rediseño total eliminando Tailwind genérico y alertas nativas.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Download, Search, Loader2, 
  Share2, CheckCircle2, AlertCircle, X, Sparkles, MessageCircle,
  Filter, RefreshCw
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Imagen {
  id: string;
  titulo: string;
  url_base: string;
  etiquetas: string;
  servicio_id?: string | null;
  activo: boolean;
}

export default function ImagenesVendorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [imagenes, setImagenes] = useState<Imagen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setActiveServiceId(searchParams.get('servicio'));
  }, [searchParams]);

  useEffect(() => { fetchImagenes(); }, []);

  const fetchImagenes = async () => {
    try {
      const data = await api.get('/imagenes');
      setImagenes(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string, error = false) => {
    setToastMsg(msg);
    setIsError(error);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDownload = async (img: Imagen) => {
    setDownloading(img.id);
    try {
      const token = localStorage.getItem('ares_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${apiUrl}/imagen/${img.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ares_${img.titulo.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      triggerToast('DESCARGA COMPLETADA 📁');
    } catch (error) {
      triggerToast('COMPLETA TU LOGO EN PERFIL', true);
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (img: Imagen) => {
    const shareText = `¡Mira este servicio de streaming que tengo para ti! 🚀\n${img.titulo}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: img.titulo,
          text: shareText,
          url: img.url_base,
        });
      } catch (err) { /* silent fail */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + img.url_base)}`, '_blank');
    }
  };

  const [activeCategory, setActiveCategory] = useState('TODOS');

  const CATEGORIAS = ['TODOS', 'FLYER', 'ESTRENO', 'PROMO', 'PARTIDO'];

  const CAT_EMOJIS: Record<string, string> = {
    TODOS: '🗂️', FLYER: '📣', ESTRENO: '🎬', PROMO: '💥', PARTIDO: '⚽',
  };

  const filteredImages = imagenes.filter(img => {
    const matchesSearch = img.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.etiquetas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = activeServiceId ? img.servicio_id === activeServiceId : true;
    const matchesCat = activeCategory === 'TODOS' || (img as any).categoria === activeCategory;
    return matchesSearch && matchesService && matchesCat;
  });

  return (
    <div style={{ padding: '1rem 1rem 8rem 1rem' }}>
      
      {/* Toast Ares v2 */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              background: '#000', color: 'white', padding: '1rem 2rem', width: 'max-content',
              borderRadius: '24px', border: `2px solid ${isError ? 'var(--color-danger)' : 'var(--color-primary)'}`,
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            {isError ? <AlertCircle color="var(--color-danger)" /> : <CheckCircle2 color="var(--color-primary)" />}
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              BANCO <span className="text-gradient-primary">VISUAL</span>
            </h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>PUBLICIDAD CON TU PROPIA MARCA</p>
          </div>
          <button 
            onClick={fetchImagenes} 
            className="btn-secondary" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refrescar Imágenes"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '18px', 
          background: 'rgba(0,0,0,0.05)', border: '2px solid #000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <ImageIcon size={28} />
          {activeServiceId && (
            <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-primary)', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #000' }} />
          )}
        </div>
      </div>

      {activeServiceId && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => {
              setActiveServiceId(null);
              router.replace('/imagenes');
            }}
            style={{ 
              background: 'var(--surface-raised)', border: '2px solid #000', borderRadius: '14px', 
              padding: '0.6rem 1.25rem', fontSize: '0.75rem', fontWeight: 900, 
              display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '4px 4px 0px 0px #000'
            }}
          >
            <Filter size={16} color="var(--color-primary)" />
            QUITAR FILTRO DE SERVICIO
            <X size={14} />
          </button>
        </div>
      )}

      {/* Buscador Futurista */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
        <input 
          className="input" 
          placeholder="Buscar por tag o título..."
          style={{ paddingLeft: '3.5rem', height: '55px', fontSize: '0.9rem' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {CATEGORIAS.map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={activeCategory === c ? 'chip chip-primary' : 'chip'}
            style={{ whiteSpace: 'nowrap', padding: '0.4rem 1.25rem', fontSize: '0.7rem' }}
          >
            {CAT_EMOJIS[c]} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <ImageIcon size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.4 }}>SIN RESULTADOS</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredImages.map((img, i) => (
            <motion.div 
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ position: 'relative', height: 250, background: '#000' }}>
                <img src={img.url_base} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', bottom: '15px', right: '15px',
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-primary)'
                }}>
                  HD PREMIUM
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{img.titulo}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {JSON.parse(img.etiquetas).slice(0, 3).map((tag: string) => (
                    <span key={tag} style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase' }}>#{tag}</span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleDownload(img)}
                    disabled={downloading === img.id}
                    className="btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', height: '50px' }}
                  >
                    {downloading === img.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <><Download size={18} /> DESCARGAR</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleShare(img)}
                    className="btn-secondary"
                    style={{ width: '50px', height: '50px', border: '2px solid #000', borderRadius: '15px', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tip Pro */}
      <div className="card-static" style={{ marginTop: '3rem', display: 'flex', gap: '1.25rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.05)', borderColor: 'var(--color-accent)' }}>
        <div style={{ 
          width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.4 }}>
          <strong>TIP DE VENTA:</strong> Las imágenes se descargan automáticamente con tu <strong>Logo</strong> y <strong>WhatsApp</strong>. Configúralos en tu perfil.
        </p>
      </div>

    </div>
  );
}
