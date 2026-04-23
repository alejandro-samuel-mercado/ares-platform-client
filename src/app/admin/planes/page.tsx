/**
 * Página: Gestión de Planes — Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Edit2, X, ShieldCheck, Zap, Globe, ShoppingCart, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface Plan {
  id: string; nombre: string; precio: number; dias: number;
  limite_servicios: number | null; pedidos_automaticos: boolean;
  enlace_publico: boolean; marketplace_proveedor: boolean; activo: boolean;
}

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Partial<Plan> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const loadPlanes = () => {
    setLoading(true);
    api.get('/admin/planes').then(setPlanes).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(loadPlanes, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    try {
      if (editingPlan.id) {
        await api.put(`/admin/planes/${editingPlan.id}`, editingPlan);
      } else {
        await api.post('/admin/planes', editingPlan);
      }
      setShowModal(false);
      setEditingPlan(null);
      triggerToast();
      loadPlanes();
    } catch (err) { console.error(err); }
  };

  const planStyles: Record<string, { color: string, icon: React.ReactNode }> = { 
    'Gratis': { color: 'var(--color-muted)', icon: <Globe size={20} /> }, 
    'Vendedor': { color: 'var(--color-blue)', icon: <ShoppingCart size={20} /> }, 
    'Pro': { color: 'var(--color-accent)', icon: <Zap size={20} /> }, 
    'Proveedor': { color: 'var(--color-primary)', icon: <ShieldCheck size={20} /> } 
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Ares v2 */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px', zIndex: 10000,
              background: '#000', color: 'white', padding: '1.25rem 2.5rem',
              borderRadius: '24px', border: '2px solid var(--color-primary)',
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <CheckCircle2 color="var(--color-primary)" />
            PLAN ACTUALIZADO EXITOSAMENTE
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--color-primary)', padding: '0.8rem', borderRadius: '16px', color: 'white', border: '2px solid #000' }}>
              <CreditCard size={32} />
            </div>
            MEMBRESÍAS <span className="text-gradient-primary">ARES</span>
          </h1>
          <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Configura los tiers de acceso y privilegios de tu red de ventas
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingPlan({ nombre: '', precio: 0, dias: 30, limite_servicios: null, pedidos_automaticos: false, enlace_publico: false, marketplace_proveedor: false, activo: true }); setShowModal(true); }}>
          <Plus size={22} /> CREAR NUEVO PLAN
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {planes.map((plan, i) => {
          const style = planStyles[plan.nombre] || { color: 'var(--color-primary)', icon: <CreditCard size={20} /> };
          return (
            <motion.div 
              key={plan.id} 
              className="card" 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ 
                padding: '0', 
                overflow: 'hidden',
              }}
            >
              {/* Header del Plan */}
              <div style={{ 
                background: style.color, 
                padding: '1.5rem', 
                color: '#000',
                borderBottom: '2px solid #000',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#000', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                    {style.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.nombre}</h3>
                </div>
                <button onClick={() => { setEditingPlan(plan); setShowModal(true); }} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  <Edit2 size={18} />
                </button>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    {plan.precio} <span style={{ fontSize: '0.9rem', opacity: 0.6 }}>Bs / mes</span>
                  </div>
                  <div className="chip" style={{ marginTop: '0.5rem', background: '#000', color: 'white', border: 'none', boxShadow: 'none' }}>
                    {plan.dias} DÍAS DE VIGENCIA
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '2px dashed rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <div style={{ color: 'var(--color-primary)' }}><CheckCircle2 size={16} /></div>
                    {plan.limite_servicios !== null ? `${plan.limite_servicios} Servicios` : 'Servicios Ilimitados'}
                  </div>
                  {plan.pedidos_automaticos && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      <div style={{ color: 'var(--color-primary)' }}><Zap size={16} /></div>
                      Pedidos Automáticos
                    </div>
                  )}
                  {plan.enlace_publico && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      <div style={{ color: 'var(--color-primary)' }}><Globe size={16} /></div>
                      Enlace Público de Venta
                    </div>
                  )}
                  {plan.marketplace_proveedor && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                      <div style={{ color: 'var(--color-primary)' }}><ShoppingCart size={16} /></div>
                      Acceso a Marketplace
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Rediseñado */}
      <AnimatePresence>
        {showModal && editingPlan && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => { setShowModal(false); setEditingPlan(null); }}
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />
            <motion.div 
              className="modal-container" 
              initial={{ scale: 0.85, opacity: 0, rotate: -1 }} 
              animate={{ scale: 1, opacity: 1, rotate: 0 }} 
              exit={{ scale: 0.85, opacity: 0 }}
              style={{ padding: '3rem', zIndex: 1, maxWidth: '600px', borderWidth: '3px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem' }}>{editingPlan.id ? 'EDITAR' : 'CREAR'} <span className="text-gradient-primary">PLAN</span></h2>
                <button onClick={() => { setShowModal(false); setEditingPlan(null); }} className="btn-ghost" style={{ padding: '0.5rem' }}>
                  <X size={32} color="#000" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">Nombre Comercial del Tier</label>
                  <input className="input" value={editingPlan.nombre || ''} onChange={e => setEditingPlan({ ...editingPlan, nombre: e.target.value })} placeholder="Ej: Platinum Elite" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label className="input-label">Precio (Bolivianos)</label>
                    <input className="input" type="number" value={editingPlan.precio || 0} onChange={e => setEditingPlan({ ...editingPlan, precio: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="input-label">Ciclo de Cobro (Días)</label>
                    <input className="input" type="number" value={editingPlan.dias || 30} onChange={e => setEditingPlan({ ...editingPlan, dias: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div>
                  <label className="input-label">Límite de Servicios (0 = Ilimitado)</label>
                  <input className="input" type="number" value={editingPlan.limite_servicios ?? ''} onChange={e => setEditingPlan({ ...editingPlan, limite_servicios: e.target.value ? parseInt(e.target.value) : null })} placeholder="Sin límite" />
                </div>

                <div className="card" style={{ padding: '1.5rem', background: 'var(--surface-raised)', borderWidth: '2px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                    <input type="checkbox" checked={editingPlan.pedidos_automaticos || false} onChange={e => setEditingPlan({ ...editingPlan, pedidos_automaticos: e.target.checked })} />
                    HABILITAR PEDIDOS AUTOMÁTICOS
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                    <input type="checkbox" checked={editingPlan.enlace_publico || false} onChange={e => setEditingPlan({ ...editingPlan, enlace_publico: e.target.checked })} />
                    PUBLICAR ENLACE DE VENTA
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 800 }}>
                    <input type="checkbox" checked={editingPlan.marketplace_proveedor || false} onChange={e => setEditingPlan({ ...editingPlan, marketplace_proveedor: e.target.checked })} />
                    ACCESO AL MARKETPLACE MAESTRO
                  </label>
                </div>

                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', padding: '1.5rem', marginTop: '1rem', fontSize: '1.1rem' }}>
                  <CreditCard size={20} /> GUARDAR CONFIGURACIÓN DE PLAN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
