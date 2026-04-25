/**
 * Página: Enlace Público de Vendedor — Ares v2 (Premium)
 * 
 * Esta página es visible para los clientes finales de un vendedor Pro.
 * No requiere autenticación. Renderiza el catálogo con estética HBO/Netflix.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ShoppingBag, MessageCircle, ExternalLink, ShieldCheck, Star, Rocket, Loader2, Globe, PlayCircle } from 'lucide-react';
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
  const [tasaCambio, setTasaCambio] = useState(6.96);

  useEffect(() => {
    if (alias) {
      Promise.all([
        api.get(`/public/u/${alias}`),
        api.get('/ajustes-publicos')
      ])
        .then(([res, ajustes]) => {
          setData(res);
          if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
        })
        .catch(err => {
          console.error(err);
          setError(err.response?.data?.error || 'No se pudo cargar el perfil');
        })
        .finally(() => setLoading(false));
    }
  }, [alias]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <p style={{ fontWeight: 900, marginTop: '1.5rem', letterSpacing: '0.2em', opacity: 0.6 }}>PREPARANDO CATÁLOGO PREMIUM...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: '#050505', color: 'white' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '24px', marginBottom: '2rem', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
          <Globe size={48} color="#EF4444" />
        </div>
        <h1 style={{ fontWeight: 900, fontSize: '2rem' }}>ACCESO RESTRINGIDO</h1>
        <p style={{ fontWeight: 700, opacity: 0.6, marginTop: '0.5rem' }}>{error || 'El perfil solicitado no está disponible.'}</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary" style={{ marginTop: '2rem', padding: '1rem 2rem' }}>VOLVER AL INICIO</button>
      </div>
    );
  }

  const { vendor, servicios } = data;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: 'white', paddingBottom: '6rem', overflowX: 'hidden' }}>
      
      {/* ──────────────────────────────────────────────────────────
          HERO SECTION CINEMÁTICO 
          ────────────────────────────────────────────────────────── */}
      <div style={{ 
        position: 'relative', 
        padding: '6rem 2rem 5rem 2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, rgba(var(--color-primary-rgb, 235,12,12), 0.1) 0%, #050505 100%)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% -20%, var(--color-primary) 0%, transparent 50%)', opacity: 0.15, zIndex: 0 }} />
        
        <div style={{ 
          width: '130px', height: '130px', borderRadius: '32px', background: '#111', margin: '0 auto 2rem auto',
          border: '3px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', zIndex: 1
        }}>
          {vendor.logo_url ? <img src={vendor.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={50} color="white" opacity={0.5} />}
        </div>
        
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, position: 'relative', zIndex: 1, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {vendor.nombre.toUpperCase()}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', position: 'relative', zIndex: 1, background: 'rgba(34, 197, 94, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          <ShieldCheck size={16} color="#22C55E" />
          <span style={{ fontWeight: 900, fontSize: '0.75rem', color: '#22C55E', letterSpacing: '0.1em' }}>PROVEEDOR OFICIAL VERIFICADO</span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        
        {/* ──────────────────────────────────────────────────────────
            MÉTRICAS (GLASSMORPHISM)
            ────────────────────────────────────────────────────────── */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', 
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px',
          padding: '2rem', marginTop: '-3rem', marginBottom: '4rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.1em' }}>SERVICIOS ACTIVOS</p>
            <p style={{ fontWeight: 900, fontSize: '1.8rem', color: 'white' }}>{servicios.length}</p>
          </div>
          <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.1em' }}>ENTREGA</p>
            <p style={{ fontWeight: 900, fontSize: '1.8rem', color: 'var(--color-primary)' }}>INMEDIATA</p>
          </div>
          <div style={{ height: '40px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.1em' }}>SOPORTE</p>
            <p style={{ fontWeight: 900, fontSize: '1.8rem', color: '#22C55E' }}>24/7</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--color-primary)', borderRadius: '4px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.05em' }}>CATÁLOGO DE ENTRETENIMIENTO</h2>
        </div>

        {/* ──────────────────────────────────────────────────────────
            GRID DE SERVICIOS (ESTILO CARTELERA)
            ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {servicios.map((s, idx) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px', 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              {/* Glow Header */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--color-primary)', opacity: 0.5 }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '18px', border: '2px solid rgba(255,255,255,0.1)', 
                  background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)',
                  padding: s.servicio.logo_url ? '0' : '1rem',
                  overflow: 'hidden'
                }}>
                  {s.servicio.logo_url ? <img src={s.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <PlayCircle size={32} opacity={0.3} />}
                </div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '1.3rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{s.servicio.nombre}</p>
                  <div style={{ display: 'inline-block', marginTop: '0.4rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8 }}>
                    {s.servicio.categoria || 'PREMIUM'}
                  </div>
                </div>
              </div>

              {s.servicio.descripcion_base && (
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.5, lineHeight: 1.5 }}>{s.servicio.descripcion_base}</p>
              )}

              <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' 
              }}>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, letterSpacing: '0.1em' }}>INVERSIÓN MENSUAL</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                      <span style={{ fontSize: '1rem', color: 'var(--color-primary)', marginRight: '4px' }}>Bs</span>
                      {s.precio_venta}
                    </p>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, opacity: 0.4 }}>| ${(s.precio_venta / tasaCambio).toFixed(2)} USD</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://wa.me/${vendor.whatsapp}?text=Hola%20${vendor.nombre},%20me%20interesa%20contratar%20el%20servicio%20${s.servicio.nombre}%20que%20vi%20en%20tu%20catálogo%20Ares.%20(Precio:%20Bs%20${s.precio_venta}%20/%20$${(s.precio_venta / tasaCambio).toFixed(2)}%20USD)`, '_blank')}
                  className="btn-primary" 
                  style={{ 
                    padding: '0.8rem 1.5rem', fontSize: '0.9rem', borderRadius: '100px',
                    boxShadow: '0 10px 20px rgba(var(--color-primary-rgb, 235,12,12), 0.3)' 
                  }}
                >
                  CONTRATAR
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {servicios.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <PlayCircle size={64} style={{ margin: '0 auto 1.5rem auto', opacity: 0.1 }} />
            <p style={{ fontWeight: 900, fontSize: '1.2rem', opacity: 0.5 }}>NO HAY SERVICIOS ACTIVOS ACTUALMENTE</p>
            <p style={{ fontWeight: 600, opacity: 0.3, marginTop: '0.5rem' }}>El proveedor está actualizando su catálogo.</p>
          </div>
        )}

      </div>

      <div style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.2 }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={14} /> POTENCIADO POR ARES V3
        </p>
      </div>
    </div>
  );
}

