/**
 * Mi Catálogo — Ares Redesign v2.2 (Saneamiento Temas)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Minus, DollarSign, ArrowUpCircle, X, CheckCircle2, Zap, Image as ImageIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ServicioBase { id: string; nombre: string; descripcion_base: string; precio_sugerido: number; categoria: string; estado_actual: string; es_iptv_propio: boolean; logo_url?: string; }
interface MiServicio { id: string; servicio_id: string; precio_venta: number; activo: boolean; servicio: ServicioBase; }

export default function CatalogoPage() {
  const { vendor } = useAuth();
  const [serviciosBase, setServiciosBase] = useState<ServicioBase[]>([]);
  const [misServicios, setMisServicios] = useState<MiServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [toast, setToast] = useState('');
  const [precioInput, setPrecioInput] = useState<Record<string, string>>({});

  const load = async () => {
    try {
      const [base, mine] = await Promise.all([api.get('/servicios_base'), api.get('/mis_servicios')]);
      setServiciosBase(base);
      setMisServicios(mine);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  
  const isActive = (svcId: string) => misServicios.some(ms => ms.servicio_id === svcId && ms.activo);
  const getMyService = (svcId: string) => misServicios.find(ms => ms.servicio_id === svcId);
  const activeCount = misServicios.filter(ms => ms.activo).length;

  const handleActivate = async (svc: ServicioBase) => {
    let precio = parseFloat(precioInput[svc.id] || svc.precio_sugerido.toString());
    if (isNaN(precio)) precio = svc.precio_sugerido || 0;
    try {
      await api.post('/mis_servicios', { servicio_id: svc.id, precio_venta: precio });
      showToast(`${svc.nombre} activado ✅`);
      load();
    } catch (err: any) {
      if (err.data?.reason === 'plan_limit_reached') {
        setShowUpgrade(true);
      } else {
        showToast(err.message || 'Error');
      }
    }
  };

  const handleDeactivate = async (svcId: string) => {
    const ms = getMyService(svcId);
    if (!ms) return;
    await api.delete(`/mis_servicios/${ms.id}`);
    showToast('Servicio desactivado');
    load();
  };

  const handleUpdatePrice = async (msId: string, precio: number) => {
    await api.put(`/mis_servicios/${msId}`, { precio_venta: precio });
    showToast('Precio actualizado ✅');
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '8rem' }}>
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 20, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', 
              zIndex: 3000, background: 'var(--surface-raised)', color: 'var(--text-primary)', 
              padding: '1rem 2rem', borderRadius: 'var(--radius-full)',
              border: '2px solid var(--color-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              fontWeight: 800, fontSize: '0.9rem'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', lineHeight: 1, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            MI <span className="text-gradient-primary">CATÁLOGO</span>
            <button 
                onClick={load} 
                className="btn-secondary" 
                style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refrescar Catálogo"
            >
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div className="chip chip-primary">{activeCount} ACTIVOS</div>
            <p style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configura tus servicios y márgenes</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '5rem 0', textAlign: 'center' }}>
          <Zap className="animate-pulse" size={40} color="var(--color-primary)" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {serviciosBase.map((svc, index) => {
            const active = isActive(svc.id);
            const ms = getMyService(svc.id);
            return (
              <motion.div 
                key={svc.id} 
                className="card"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                style={{ 
                  opacity: active ? 1 : 0.6,
                  filter: active ? 'none' : 'grayscale(1)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'var(--surface-raised)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '45px', height: '45px', borderRadius: '12px', 
                      background: 'var(--surface-base)', border: '2px solid #000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{ 
                        position: 'absolute', top: -5, right: -5,
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: svc.estado_actual === 'VERDE' ? '#10B981' : svc.estado_actual === 'AMARILLO' ? '#F59E0B' : '#EF4444', 
                        border: '2px solid #000', zIndex: 10
                      }} />
                      {svc.logo_url ? (
                        <img src={svc.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={svc.nombre} />
                      ) : (
                        <Zap size={20} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1.2 }}>
                        {svc.nombre.toUpperCase()}
                        {active && <CheckCircle2 size={16} color="var(--color-primary)" />}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{svc.categoria}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  {active && ms ? (
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Bs</span>
                      <input 
                        className="input" 
                        type="number" 
                        value={precioInput[svc.id] ?? ms.precio_venta} 
                        onChange={e => setPrecioInput({ ...precioInput, [svc.id]: e.target.value })}
                        onBlur={() => { const p = parseFloat(precioInput[svc.id] || '0'); if (p > 0 && p !== ms.precio_venta) handleUpdatePrice(ms.id, p); }}
                        style={{ width: '100%', height: '40px', paddingLeft: '2.2rem', fontSize: '0.9rem', textAlign: 'center', margin: 0, fontWeight: 900 }} 
                      />
                    </div>
                  ) : (
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, fontSize: '0.8rem', opacity: 0.4, color: 'var(--text-primary)' }}>Bs</span>
                      <input 
                        className="input" 
                        type="number" 
                        placeholder={svc.precio_sugerido.toString()} 
                        value={precioInput[svc.id] || ''}
                        onChange={e => setPrecioInput({ ...precioInput, [svc.id]: e.target.value })}
                        style={{ width: '100%', height: '40px', paddingLeft: '2.2rem', fontSize: '0.8rem', textAlign: 'center', opacity: 0.6, margin: 0, fontWeight: 900 }} 
                      />
                    </div>
                  )}

                  {active && ms ? (
                    <button onClick={() => handleDeactivate(svc.id)} className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)', boxShadow: 'none' }}>
                      <Minus size={20} strokeWidth={3} />
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(svc)} className="btn-primary" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', boxShadow: 'none' }}>
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <div className="modal-overlay">
            <motion.div className="modal-container" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', background: 'var(--surface-raised)', border: '4px solid #000', borderRadius: '32px' }}>
              <div style={{ background: 'var(--color-accent)', width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #000', boxShadow: '8px 8px 0px 0px #000' }}>
                <ArrowUpCircle size={40} color="#000" />
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem', color: 'var(--text-primary)' }}>SUBE DE NIVEL 🚀</h2>
              <p style={{ fontWeight: 800, color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                Has alcanzado el límite de tu plan. Desbloquea el <span className="text-gradient-primary">Plan Galáctico</span> para disfrutar de servicios ilimitados.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <a href="/plan" className="btn-primary" style={{ width: '100%', textDecoration: 'none', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ACTUALIZAR AHORA</a>
                <button className="btn-secondary" onClick={() => setShowUpgrade(false)} style={{ border: 'none', color: 'var(--text-muted)', fontWeight: 800 }}>MÁS TARDE</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
