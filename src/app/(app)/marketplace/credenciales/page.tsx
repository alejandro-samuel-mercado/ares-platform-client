/**
 * Página: Gestión de Credenciales (Proveedor) — Ares Marketplace
 */
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, ShieldCheck, Plus, Search, Filter, Loader2, Key, Mail, User as UserIcon, CheckCircle2, XCircle, Trash2, Clock, Smartphone, MoreVertical, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderCredencialesPage() {
  const [credenciales, setCredenciales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({
    servicio_id: '',
    email: '',
    password: '',
    perfil: '',
    notas: '',
    cantidad_masiva: 1
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [credData, svcData] = await Promise.all([
        api.get('/marketplace/credenciales'),
        api.get('/marketplace/mine')
      ]);
      setCredenciales(credData);
      setServicios(svcData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/marketplace/credenciales', form);
      await fetchData();
      setIsModalOpen(false);
      setForm({ servicio_id: '', email: '', password: '', perfil: '', notas: '', cantidad_masiva: 1 });
    } catch (error) {
      alert('Error al guardar credenciales');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta credencial?')) return;
    try {
      await api.delete(`/admin/credenciales/${id}`); // Reusamos el delete de admin si es posible, o crear uno en marketplace
      setCredenciales(credenciales.filter(c => c.id !== id));
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            MIS <span className="text-gradient-primary">CUENTAS</span>
          </h1>
          <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>INVENTARIO DEL MARKETPLACE</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={fetchData} className="btn-secondary" style={{ padding: '0.8rem', borderRadius: '15px' }}>
              <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btn-primary"
             style={{ padding: '0.8rem 1.5rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             <Plus size={24} /> AGREGAR
           </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : credenciales.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <Key size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.4 }}>TU INVENTARIO ESTÁ VACÍO</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {credenciales.map((c, i) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
              style={{ padding: '1.5rem', position: 'relative' }}
            >
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <img src={c.servicio.logo_url} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #000' }} />
                  <div style={{ flex: 1 }}>
                     <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{c.servicio.nombre}</p>
                     <p style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 800 }}>{c.perfil || 'Sin perfil específico'}</p>
                  </div>
                  <div className={`chip ${c.disponible ? 'chip-success' : 'chip-danger'}`} style={{ fontSize: '0.6rem' }}>
                     {c.disponible ? 'DISPONIBLE' : 'VENDIDA'}
                  </div>
               </div>

               <div style={{ background: 'var(--surface-raised)', padding: '1rem', borderRadius: '12px', border: '1.5px solid #000', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                     <Mail size={14} color="var(--color-primary)" />
                     <span style={{ fontWeight: 700, wordBreak: 'break-all' }}>{c.usuario}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                     <Key size={14} color="var(--color-primary)" />
                     <span style={{ fontWeight: 700 }}>{c.password}</span>
                  </div>
               </div>

               <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.4 }}>
                    {new Date(c.creado_en).toLocaleDateString()}
                  </span>
                  {!c.disponible && c.vendor && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                      Vendido a: @{c.vendor.alias}
                    </span>
                  )}
                  {c.disponible && (
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Agregar Credenciales */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               style={{ position: 'absolute', inset: 0 }}
            />
            <motion.div 
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
               className="modal-container"
               style={{ padding: '2rem', width: '90%', maxWidth: '450px' }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>CARGAR <span className="text-gradient-primary">CUENTAS</span></h2>
                  <X size={24} onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
               </div>

               <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                     <label className="input-label">Servicio</label>
                     <select className="input" value={form.servicio_id} onChange={e => setForm({ ...form, servicio_id: e.target.value })} required>
                        <option value="">Selecciona tu servicio...</option>
                        {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                     </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div>
                        <label className="input-label">Email / User</label>
                        <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                     </div>
                     <div>
                        <label className="input-label">Password</label>
                        <input className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                     </div>
                  </div>

                  <div>
                     <label className="input-label">Perfil (Opcional)</label>
                     <input className="input" placeholder="Ej: Perfil 1 / Pin: 1234" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })} />
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '1rem', height: '55px' }}
                  >
                    {saving ? <Loader2 className="animate-spin" /> : 'GUARDAR EN INVENTARIO'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
