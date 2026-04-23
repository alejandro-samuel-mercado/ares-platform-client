/**
 * Página: Mensajes Rápidos — App Vendedor Ares v2.2 (Saneamiento Temas)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, MessageCircle, Zap, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Mensaje { id: string; titulo: string; template: string; orden: number; }
interface MiServicio { servicio_id: string; precio_venta: number; activo: boolean; servicio: { nombre: string }; }

function resolveVariables(template: string, vendor: any, servicios: MiServicio[]): string {
  const firstService = servicios[0];
  return template
    .replace(/\[PRECIO\]/g, firstService?.precio_venta?.toString() ?? '—')
    .replace(/\[WHATSAPP\]/g, vendor?.role === 'GUEST' ? '[DEMO]' : (vendor?.whatsapp || vendor?.telefono || ''))
    .replace(/\[NOMBRE_VENDEDOR\]/g, vendor?.alias || vendor?.nombre || '')
    .replace(/\[SERVICIO\]/g, firstService?.servicio?.nombre || '')
    .replace(/\[PARTIDO_HOY\]/g, '(ver partidos)');
}

export default function MensajesPage() {
  const { vendor } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [msgs, svcs] = await Promise.all([api.get('/mensajes'), api.get('/mis_servicios')]);
        setMensajes(msgs);
        setMisServicios(svcs.filter((s: MiServicio) => s.activo));
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCopy = async (msg: Mensaje) => {
    const resolved = resolveVariables(msg.template, vendor, misServicios);
    try {
      await navigator.clipboard.writeText(resolved);
      triggerToast();
    } catch { /* fallback */ }
  };

  return (
    <div style={{ paddingBottom: '8rem', margin: '0 auto' }}>
      
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1rem 2rem', width: 'max-content',
              borderRadius: '24px', border: '2px solid var(--color-primary)', boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <CheckCircle2 color="var(--color-primary)" /> TEXTO COPIADO
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--surface-raised)', color: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
            <MessageCircle size={24} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>SCRIPTS <span className="text-gradient-primary">RÁPIDOS</span></h1>
        </div>
        <button 
                onClick={fetchData} 
                className="btn-secondary" 
                style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refrescar Scripts"
            >
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
      </div>

      {vendor?.role === 'GUEST' && (
        <div style={{ marginBottom: '2rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--color-danger)', border: '2px dashed var(--color-danger)', padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <ShieldAlert size={20} color="var(--color-danger)" />
          <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-danger)' }}>MODO DEMO ACTIVA: SE USARÁ [DEMO].</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Zap className="animate-pulse" size={40} color="var(--color-primary)" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {mensajes.map((msg, i) => {
            const hasPriceVar = msg.template.includes('[PRECIO]');
            const hasServiceVar = msg.template.includes('[SERVICIO]');
            
            // Si tiene variables de servicio/precio, mostramos una versión por cada servicio activo
            if (hasPriceVar || hasServiceVar) {
                return misServicios.map((svc) => (
                    <motion.button key={`${msg.id}-${svc.servicio_id}`} onClick={() => {
                        const resolved = resolveVariables(msg.template, vendor, [svc]);
                        navigator.clipboard.writeText(resolved);
                        triggerToast();
                    }} className="card"
                      style={{ padding: '1.5rem', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-raised)' }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.6rem', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '6px', fontWeight: 900 }}>
                                {svc.servicio.nombre}
                            </span>
                            <h3 style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{msg.titulo}</h3>
                        </div>
                        <div style={{ background: 'var(--surface-base)', padding: '0.4rem', borderRadius: '10px', border: '1px solid #000' }}><Copy size={14} color="var(--text-primary)" /></div>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, opacity: 0.9 }}>
                        {resolveVariables(msg.template, vendor, [svc])}
                      </p>
                    </motion.button>
                ));
            }

            // Mensajes genéricos (una sola vez)
            return (
              <motion.button key={msg.id} onClick={() => handleCopy(msg)} className="card"
                style={{ padding: '1.5rem', textAlign: 'left', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-raised)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>{msg.titulo}</h3>
                  <div style={{ background: 'var(--surface_base)', padding: '0.4rem', borderRadius: '10px', border: '1px solid #000' }}><Copy size={16} color="var(--text-primary)" /></div>
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, opacity: 0.9 }}>
                  {resolveVariables(msg.template, vendor, misServicios)}
                </p>
              </motion.button>
            );
          })}
          
          {mensajes.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.4, padding: '4rem' }}>
                <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ fontWeight: 900 }}>AÚN NO HAY SCRIPTS DISPONIBLES</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
