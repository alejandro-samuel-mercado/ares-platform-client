/**
 * Página: Mercado (Marketplace) — App Vendedor Ares v2.2
 * 
 * Permite a los vendedores descubrir servicios de otros proveedores
 * y proponer sus propios servicios para la red.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Search, MessageCircle, Star, Rocket, Plus, ExternalLink, ShieldCheck, Zap, X, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Vendor {
  id: string;
  nombre: string;
  alias: string;
  whatsapp: string;
  logo_url?: string;
  rating: number;
}

interface ExternalService {
  id: string;
  nombre: string;
  logo_url: string;
  descripcion_base: string;
  precio_sugerido: number;
  categoria: string;
  proveedor_id: string;
  proveedor: Vendor;
}

export default function MarketplacePage() {
  const { vendor } = useAuth();
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tasaCambio, setTasaCambio] = useState(6.96);
  
  // Form state for proposal
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    logo: ''
  });

  const loadMarketplace = async () => {
    try {
      const [data, ajustes] = await Promise.all([api.get('/marketplace'), api.get('/ajustes-publicos')]);
      setServices(data);
      if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMarketplace(); }, []);

  const handleTrackInterest = (svc: ExternalService) => {
      // Abrir WhatsApp del proveedor directamente
      const text = `Hola ${svc.proveedor.nombre}, vi tu servicio "${svc.nombre}" en el Marketplace de Ares y me interesa revenderlo.`;
      window.open(`https://wa.me/${svc.proveedor.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/marketplace/propose', {
        nombre_servicio: form.nombre,
        descripcion: form.descripcion,
        precio_base: form.precio,
        logo_url: form.logo
      });
      alert('Propuesta enviada con éxito. El administrador la revisará pronto.');
      setShowModal(false);
      setForm({ nombre: '', descripcion: '', precio: '', logo: '' });
    } catch (err) {
      alert('Error al enviar propuesta. Asegúrate de tener el rol de PROVEEDOR.');
    }
  };

  const filtered = services.filter(s => 
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.proveedor.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: '8rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--surface-raised)', color: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
            <Store size={24} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>MERCADO <span className="text-gradient-primary">GLOBAL</span></h1>
        </div>
        
        {vendor?.plan_features?.marketplace_proveedor ? (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            style={{ 
              background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.75rem 1.25rem', 
              borderRadius: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(235, 12, 12, 0.3)'
            }}
          >
            <Plus size={20} /> <span className="desktop-only">PROPONER SERVICIO</span>
          </motion.button>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => alert('Esta función requiere el Plan PROVEEDOR. Actualiza en el módulo de Plan.')}
            style={{ 
              background: 'var(--surface-base)', color: 'var(--text-muted)', border: '2px solid rgba(255,255,255,0.1)', padding: '0.75rem 1.25rem', 
              borderRadius: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: 0.6
            }}
          >
            <Rocket size={18} /> <span className="desktop-only">MODO PROVEEDOR</span>
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '3rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
        <input 
          className="input" 
          placeholder="Buscar servicios o proveedores..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '3.5rem' }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Zap className="animate-pulse" size={40} color="var(--color-primary)" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((svc, i) => (
            <motion.div 
              key={svc.id} 
              className="card" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-raised)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', border: '2px solid #000', overflow: 'hidden', background: '#fff' }}>
                  <img src={svc.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={svc.nombre} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    <ShieldCheck size={12} /> PROVEEDOR VERIFICADO
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', marginTop: '0.25rem' }}>Bs {svc.precio_sugerido} <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>| ${(svc.precio_sugerido / tasaCambio).toFixed(2)}</span></div>
                </div>
              </div>

              <div>
                <h3 style={{ fontWeight: 900, fontSize: '1.1rem' }}>{svc.nombre}</h3>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, marginTop: '0.25rem', height: '2.4rem', overflow: 'hidden' }}>{svc.descripcion_base}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--surface-base)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem' }}>
                  {svc.proveedor.nombre[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>{svc.proveedor.nombre}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={10} color="#FBBF24" fill="#FBBF24" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{svc.proveedor.rating}</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleTrackInterest(svc)}
                  style={{ background: 'var(--color-primary)', color: 'white', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <MessageCircle size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Propuesta */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'var(--surface-raised)', borderRadius: '32px', border: '4px solid var(--color-primary)', padding: '2rem', boxShadow: '20px 20px 0px #000' }}
            >
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem' }}>NUEVA <span className="text-gradient-primary">PROPUESTA</span></h2>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.6, marginBottom: '2rem' }}>Envía tu servicio para que otros vendedores lo distribuyan.</p>

              <form onSubmit={handleSubmitProposal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5 }}>NOMBRE DEL SERVICIO</label>
                  <input className="input" placeholder="Ej: IPTV Platinum 1 Mes" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5 }}>DESCRIPCIÓN</label>
                  <textarea className="input" placeholder="Detalles de canales, pantallas, etc..." rows={3} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{ resize: 'none', padding: '1rem' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5 }}>PRECIO BS (AL COSTO)</label>
                    <input className="input" type="number" placeholder="0.00" required value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5 }}>URL LOGO</label>
                    <input className="input" placeholder="https://..." value={form.logo} onChange={e => setForm({...form, logo: e.target.value})} />
                  </div>
                </div>
                
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', height: '60px', fontSize: '1.1rem' }}>
                  <Rocket size={20} /> ENVIAR A REVISIÓN
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.3 }}>
          <Store size={64} style={{ margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 900 }}>NO HAY SERVICIOS EXTERNOS DISPONIBLES</p>
        </div>
      )}
    </div>
  );
}
