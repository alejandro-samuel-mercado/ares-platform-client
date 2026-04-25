/**
 * Página: Gestión de Credenciales (Proveedor) — Ares Marketplace
 */
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, ShieldCheck, Plus, Search, Filter, Loader2, Key, Mail, User as UserIcon, CheckCircle2, XCircle, Trash2, Clock, Smartphone, MoreVertical, RefreshCw, X, Copy, Eye, EyeOff, Edit2, Link as LinkIcon, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProviderCredencialesPage() {
  const [credenciales, setCredenciales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [toast, setToast] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [filterServicio, setFilterServicio] = useState('TODOS');
  const [filterDisponible, setFilterDisponible] = useState('TODOS');
  const [editing, setEditing] = useState<any | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; credencialId: string | null }>({ open: false, credencialId: null });
  const [assignVendorId, setAssignVendorId] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({
    servicio_id: '',
    email: '',
    password: '',
    perfil: '',
    notas: '',
    cantidad_masiva: 1
  });

  useEffect(() => { 
    fetchData(); 
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await api.get('/marketplace/vendedores');
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/marketplace/credenciales/${editing.id}`, form);
        showToast('CREDENCIAL ACTUALIZADA ✅');
      } else {
        await api.post('/marketplace/credenciales', form);
        showToast('CREDENCIAL REGISTRADA ✅');
      }
      await fetchData();
      setIsModalOpen(false);
      setEditing(null);
      setForm({ servicio_id: '', email: '', password: '', perfil: '', notas: '', cantidad_masiva: 1 });
    } catch (error) {
      showToast('ERROR AL GUARDAR ❌');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCopy = (c: any) => {
    let text = `📦 SERVICIO: ${c.servicio.nombre}\n👤 USUARIO: ${c.usuario}\n🔑 CONTRASEÑA: ${c.password}`;
    if (c.perfil) text += `\n🎬 PERFIL: ${c.perfil}`;
    if (c.notas) text += `\n📝 NOTAS: ${c.notas}`;
    navigator.clipboard.writeText(text);
    showToast('CREDENCIALES COPIADAS ✅');
  };

  const togglePassword = (id: string) => {
    const next = new Set(revealedPasswords);
    if (next.has(id)) next.delete(id); else next.add(id);
    setRevealedPasswords(next);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/marketplace/credenciales/${confirmDelete.id}`);
      setCredenciales(credenciales.filter(c => c.id !== confirmDelete.id));
      showToast('CREDENCIAL ELIMINADA ✅');
      setConfirmDelete(null);
    } catch (error) {
      showToast('ERROR AL ELIMINAR ❌');
    }
  };

  const handleAssign = async () => {
    if (!assignModal.credencialId || !assignVendorId) return;
    setSaving(true);
    try {
      await api.post(`/marketplace/credenciales/${assignModal.credencialId}/asignar`, { vendor_id: assignVendorId });
      showToast('CREDENCIAL ASIGNADA 🔗');
      setAssignModal({ open: false, credencialId: null });
      setAssignVendorId('');
      fetchData();
    } catch (error) {
      showToast('ERROR ASIGNANDO VENDEDOR ❌');
    } finally {
      setSaving(false);
    }
  };

  const handleLiberar = async (id: string) => {
    setLoading(true);
    try {
      await api.post(`/marketplace/credenciales/${id}/liberar`);
      showToast('CREDENCIAL LIBERADA ✅');
      fetchData();
    } catch (error) {
      showToast('ERROR AL LIBERAR ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            GESTIÓN DE <span className="text-gradient-primary">INVENTARIO</span>
            <button onClick={fetchData} className="btn-secondary" style={{ padding: '0.75rem', borderRadius: '50%' }}>
              <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p style={{ fontWeight: 800, opacity: 0.5, color: 'var(--text-muted)' }}>BANCO DE CUENTAS DE TUS SERVICIOS PROPIOS</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div className="chip chip-active">{credenciales.filter(c => c.disponible).length} LIBRES</div>
            <div className="chip chip-danger">{credenciales.filter(c => !c.disponible).length} VENDIDAS</div>
          </div>
        </div>
        <button 
          onClick={() => { setEditing(null); setForm({ servicio_id: '', email: '', password: '', perfil: '', notas: '', cantidad_masiva: 1 }); setIsModalOpen(true); }}
          className="btn-primary"
          style={{ padding: '1.25rem 2.5rem', borderRadius: '15px' }}
        >
          <Plus size={22} /> NUEVA CREDENCIAL
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <select value={filterServicio} onChange={e => setFilterServicio(e.target.value)} className="input" style={{ paddingLeft: '3rem', height: '54px', fontWeight: 800 }}>
            <option value="TODOS">TODOS LOS SERVICIOS</option>
            {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre.toUpperCase()}</option>)}
          </select>
        </div>
        <select value={filterDisponible} onChange={e => setFilterDisponible(e.target.value)} className="input" style={{ width: '220px', height: '54px', fontWeight: 800 }}>
          <option value="TODOS">TODOS LOS ESTADOS</option>
          <option value="DISPONIBLE">DISPONIBLES</option>
          <option value="ASIGNADA">VENDIDAS</option>
        </select>
        <button className="btn-secondary" onClick={fetchData} style={{ height: '54px', padding: '0 1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> REFRESCAR
        </button>
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
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Servicio / Info</th>
              <th>Usuario / Email</th>
              <th>Password</th>
              <th>Perfil / Notas</th>
              <th>Estado</th>
              <th>Asignada A</th>
              <th style={{ textAlign: 'center' }}>Gestión</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {credenciales
                .filter(c => filterServicio === 'TODOS' || c.servicio_id === filterServicio)
                .filter(c => filterDisponible === 'TODOS' || (filterDisponible === 'DISPONIBLE' ? c.disponible : !c.disponible))
                .map((c, i) => (
                <motion.tr 
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={c.servicio.logo_url} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1.5px solid #000', objectFit: 'cover' }} />
                      <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>{c.servicio.nombre.toUpperCase()}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'monospace' }}>{c.usuario}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.85rem', opacity: revealedPasswords.has(c.id) ? 1 : 0.4 }}>
                        {revealedPasswords.has(c.id) ? c.password : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '0.2rem' }}>
                        {revealedPasswords.has(c.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    {c.perfil && <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>P: {c.perfil.toUpperCase()}</div>}
                    <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>{c.notas || '-'}</div>
                  </td>
                  <td>
                    <div className={`chip ${c.disponible ? 'chip-active' : 'chip-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {c.disponible ? 'LIBRE' : 'VENDIDA'}
                    </div>
                  </td>
                  <td>
                    {c.vendor ? (
                      <div style={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        @{c.vendor.alias.toUpperCase()}
                      </div>
                    ) : (
                      <span style={{ opacity: 0.2 }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                       <button onClick={() => handleCopy(c)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none' }} title="Copiar">
                        <Copy size={16} />
                      </button>
                      {c.disponible ? (
                        <button 
                          onClick={() => setAssignModal({ open: true, credencialId: c.id })} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: '#10B981' }} 
                          title="Asignar Vendedor"
                        >
                          <LinkIcon size={16} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLiberar(c.id)} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: '#F59E0B' }} 
                          title="Liberar Cuenta"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => { 
                          setEditing(c); 
                          setForm({ servicio_id: c.servicio_id, email: c.usuario, password: c.password, perfil: c.perfil || '', notas: c.notas || '', cantidad_masiva: 1 });
                          setIsModalOpen(true); 
                        }} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none' }} 
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      {c.disponible && (
                        <button onClick={() => setConfirmDelete(c)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--color-danger)' }} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      )}

      {/* Modal Asignar Vendedor */}
      <AnimatePresence>
        {assignModal.open && (
           <div className="modal-overlay">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
             className="modal-container" style={{ maxWidth: '450px', padding: '3rem', border: '4px solid var(--color-primary)', borderRadius: '32px', background: 'var(--surface-overlay)', textAlign: 'center' }}>
             <div style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid var(--color-primary)' }}>
                <LinkIcon size={36} color="var(--color-primary)" />
             </div>
             <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.5rem' }}>ASIGNAR A VENDEDOR</h2>
             <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem' }}>Selecciona el vendedor al que deseas vincular esta cuenta manualmente.</p>
             
             <div style={{ marginBottom: '2.5rem' }}>
               <select className="input" value={assignVendorId} onChange={e => setAssignVendorId(e.target.value)} style={{ height: '55px', fontWeight: 900, textAlign: 'center' }}>
                 <option value="">SELECCIONA VENDEDOR...</option>
                 {vendors.map(v => (
                   <option key={v.id} value={v.id}>{v.nombre.toUpperCase()} (@{v.alias.toUpperCase()})</option>
                 ))}
               </select>
             </div>

             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setAssignModal({ open: false, credencialId: null })}>CANCELAR</button>
                <button className="btn-primary" onClick={handleAssign} disabled={saving || !assignVendorId}
                    style={{ flex: 2, height: '55px', boxShadow: '8px 8px 0px 0px #000' }}>
                    {saving ? <Loader2 className="animate-spin" /> : 'ASIGNAR VENDEDOR'}
                </button>
             </div>
           </motion.div>
         </div>
        )}
      </AnimatePresence>

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
               onClick={(e) => e.stopPropagation()}
               style={{ padding: '2rem', width: '90%', maxWidth: '450px', position: 'relative', zIndex: 10 }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>{editing ? 'EDITAR' : 'CARGAR'} <span className="text-gradient-primary">CUENTA</span></h2>
                  <X size={24} onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
               </div>

               <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
      {/* Modal Confirmar Eliminación */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-container" style={{ maxWidth: '400px', textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Trash2 size={40} color="var(--color-danger)" />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>¿ELIMINAR CUENTA?</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', fontWeight: 600 }}>
                Se eliminará la cuenta "{confirmDelete.usuario}". Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>CANCELAR</button>
                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--color-danger)' }} onClick={handleDelete}>ELIMINAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Global */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{
              position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
              background: '#000', color: '#fff', padding: '1rem 2rem', borderRadius: '20px',
              border: '2.5px solid var(--color-primary)', fontWeight: 900, zIndex: 10000,
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <CheckCircle2 color="var(--color-primary)" size={20} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
