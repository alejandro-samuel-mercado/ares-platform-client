/**
 * Página: Enlace Público de Vendedor — Ares v2 (Público)
 * 
 * Esta página es visible para los clientes finales de un vendedor Pro.
 * No requiere autenticación.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingBag, MessageCircle, ExternalLink, ShieldCheck, Star, Rocket, Loader2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface PublicData {
  vendor: {
    nombre: string;
    alias: string;
    whatsapp: string;
    logo_url?: string;
  };
  servicios: Array<{
    id: string;
    precio_venta: number;
    servicio: {
      nombre: string;
      logo_url?: string;
      descripcion_base?: string;
      categoria?: string;
    };
  }>;
}

export default function PublicVendorPage() {
  const { alias } = useParams();
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alias) {
      api.get(`/public/u/${alias}`)
        .then(res => setData(res))
        .catch(err => {
          console.error(err);
          setError(err.response?.data?.error || 'No se pudo cargar el perfil');
        })
        .finally(() => setLoading(false));
    }
  }, [alias]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <Loader2 className="animate-spin" size={48} color="#EB0C0C" />
        <p style={{ fontWeight: 900, marginTop: '1rem', letterSpacing: '0.1em' }}>CONECTANDO CON EL VENDEDOR...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div style={{ background: '#FEE2E2', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem' }}>
          <Globe size={48} color="#EF4444" />
        </div>
        <h1 style={{ fontWeight: 900, fontSize: '2rem' }}>ACCESO RESTRINGIDO</h1>
        <p style={{ fontWeight: 700, opacity: 0.6, marginTop: '0.5rem' }}>{error || 'El perfil solicitado no está disponible.'}</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: '2rem' }}>VOLVER AL INICIO</button>
      </div>
    );
  }

  const { vendor, servicios } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '6rem' }}>
      {/* Header / Hero */}
      <div style={{ background: '#000', color: 'white', padding: '4rem 2rem', borderBottom: '6px solid #EB0C0C', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% 50%, #EB0C0C 0%, transparent 70%)', opacity: 0.1 }} />
        
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '32px', background: 'white', margin: '0 auto 1.5rem auto',
          border: '3px solid #EB0C0C', boxShadow: '0 0 30px rgba(235, 12, 12, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 1
        }}>
          {vendor.logo_url ? <img src={vendor.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={40} color="#000" />}
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, position: 'relative', zIndex: 1 }}>{vendor.nombre.toUpperCase()}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: 0.7, position: 'relative', zIndex: 1 }}>
          <ShieldCheck size={18} color="#22C55E" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>TIENDA VERIFICADA POR ARES</span>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '-2rem auto 0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* Info Card */}
        <div className="card-static" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', background: 'white', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4 }}>SERVICIOS</p>
            <p style={{ fontWeight: 900, fontSize: '1.2rem' }}>{servicios.length}</p>
          </div>
          <div style={{ height: '30px', width: '2px', background: '#EEE' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4 }}>GARANTÍA</p>
            <p style={{ fontWeight: 900, fontSize: '1.2rem', color: '#22C55E' }}>100%</p>
          </div>
          <div style={{ height: '30px', width: '2px', background: '#EEE' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4 }}>RED</p>
            <p style={{ fontWeight: 900, fontSize: '1.2rem' }}>@ARES</p>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Rocket color="#EB0C0C" /> CATÁLOGO DISPONIBLE
        </h2>

        {/* Servicios List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {servicios.map((s, idx) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card"
              style={{ background: 'white', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  width: '56px', height: '56px', borderRadius: '16px', border: '2px solid #000', 
                  background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {s.servicio.logo_url ? <img src={s.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={24} />}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.1 }}>{s.servicio.nombre}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>{s.servicio.categoria || 'SERVICIO DIGITAL'}</p>
                </div>
              </div>

              {s.servicio.descripcion_base && (
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.6, lineHeight: 1.4 }}>{s.servicio.descripcion_base}</p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #F1F5F9' }}>
                <p style={{ fontSize: '1.6rem', fontWeight: 900 }}>{s.precio_venta} <span style={{ fontSize: '0.8rem', opacity: 0.4 }}>BS</span></p>
                <button 
                  onClick={() => window.open(`https://wa.me/${vendor.whatsapp}?text=Hola%20${vendor.nombre},%20me%20interesa%20contratar%20el%20servicio%20${s.servicio.nombre}%20que%20vi%20en%20tu%20catálogo%20Ares.`, '_blank')}
                  className="btn-primary" 
                  style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
                >
                  <MessageCircle size={18} /> PEDIR
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {servicios.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.3 }}>
            <ShoppingBag size={64} style={{ margin: '0 auto 1.5rem auto' }} />
            <p style={{ fontWeight: 900 }}>EL VENDEDOR NO TIENE SERVICIOS ACTIVOS</p>
          </div>
        )}

      </div>

      <div style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.3 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.4em' }}>POTENCIADO POR ARES OLYMPUS v2</p>
      </div>
    </div>
  );
}
