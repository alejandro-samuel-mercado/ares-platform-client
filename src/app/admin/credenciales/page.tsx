/**
 * Admin: Gestión de Credenciales — Ares v3
 * CRUD de cuentas (usuario/contraseña) por servicio.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Search, Trash2, Edit3, CheckCircle2, XCircle, Loader2, RefreshCw, Unlock, User, Eye, EyeOff, X, Copy, Link as LinkIcon } from 'lucide-react';

interface ServicioBase { id: string; nombre: string; logo_url: string; precio_admin: number; }
interface Credencial {
  id: string; servicio_id: string; usuario: string; password: string;
  perfil: string | null; notas: string | null; disponible: boolean;
  servicio: { nombre: string; logo_url: string };
  vendor: { nombre: string; alias: string } | null;
}

export default function CredencialesAdminPage() {
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [servicios, setServiciosBase] = useState<ServicioBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterServicio, setFilterServicio] = useState('TODOS');
  const [filterDisponible, setFilterDisponible] = useState<string>('TODOS');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ servicio_id: '', usuario: '', password: '', perfil: '', notas: '' });
  const [saving, setSaving] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  
  // States para la asignación manual
  const [vendors, setVendors] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState<{ open: boolean; credencialId: string | null }>({ open: false, credencialId: null });
  const [assignVendorId, setAssignVendorId] = useState('');

  // Delete State
  const [toDelete, setToDelete] = useState<Credencial | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ares-api.unixxtech.online/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('ares_token') : null;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [credRes, svcRes, venRes] = await Promise.all([
        fetch(`${API_BASE}/admin/credenciales`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/servicios`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/vendedores`, { headers }).then(r => r.json()),
      ]);
      setCredenciales(credRes);
      setServiciosBase(svcRes);
      setVendors(venRes);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const togglePassword = (id: string) => {
    const next = new Set(revealedPasswords);
    if (next.has(id)) next.delete(id); else next.add(id);
    setRevealedPasswords(next);
  };

  const handleSave = async () => {
    if (!form.servicio_id || !form.usuario || !form.password) return;
    setSaving(true);
    try {
      if (editingId) {
        await fetch(`${API_BASE}/admin/credenciales/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(form) });
        showToast('CREDENCIAL ACTUALIZADA ✅');
      } else {
        await fetch(`${API_BASE}/admin/credenciales`, { method: 'POST', headers, body: JSON.stringify(form) });
        showToast('CREDENCIAL CREADA ✅');
      }
      setShowModal(false);
      resetForm();
      load();
    } catch { showToast('ERROR AL GUARDAR ❌'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await fetch(`${API_BASE}/admin/credenciales/${toDelete.id}`, { method: 'DELETE', headers });
      showToast('CREDENCIAL ELIMINADA 🗑️');
      setToDelete(null);
      load();
    } catch { showToast('ERROR AL ELIMINAR ❌'); }
  };

  const handleLiberar = async (id: string) => {
    await fetch(`${API_BASE}/admin/credenciales/${id}/liberar`, { method: 'POST', headers });
    showToast('CREDENCIAL LIBERADA ✅');
    load();
  };

  const handleCopy = (c: Credencial) => {
    const text = `📦 *SERVICIO:* ${c.servicio.nombre}\n👤 *USUARIO:* ${c.usuario}\n🔑 *CLAVE:* ${c.password}${c.perfil ? `\n🎬 *PERFIL:* ${c.perfil}` : ''}${c.notas ? `\n📝 *NOTAS:* ${c.notas}` : ''}`;
    navigator.clipboard.writeText(text);
    showToast('CREDENCIALES COPIADAS 📋');
  };

  const handleAssign = async () => {
    if (!assignModal.credencialId || !assignVendorId) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/admin/credenciales/${assignModal.credencialId}/asignar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ vendor_id: assignVendorId })
      });
      showToast('CREDENCIAL ASIGNADA 🔗');
      setAssignModal({ open: false, credencialId: null });
      setAssignVendorId('');
      load();
    } catch {
      showToast('ERROR ASIGNANDO VENDEDOR');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: Credencial) => {
    setForm({ servicio_id: c.servicio_id, usuario: c.usuario, password: c.password, perfil: c.perfil || '', notas: c.notas || '' });
    setEditingId(c.id);
    setShowModal(true);
  };

  const resetForm = () => { setForm({ servicio_id: '', usuario: '', password: '', perfil: '', notas: '' }); setEditingId(null); };

  const filtered = credenciales.filter(c => {
    if (filterServicio !== 'TODOS' && c.servicio_id !== filterServicio) return false;
    if (filterDisponible === 'DISPONIBLE' && !c.disponible) return false;
    if (filterDisponible === 'ASIGNADA' && c.disponible) return false;
    return true;
  });

  const disponiblesCount = credenciales.filter(c => c.disponible).length;
  const asignadasCount = credenciales.filter(c => !c.disponible).length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', paddingBottom: '6rem' }}>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '1rem 2.5rem', borderRadius: '24px', border: '3px solid var(--color-primary)', boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.5)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 color="var(--color-primary)" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            GESTIÓN DE <span className="text-gradient-primary">CREDENCIALES</span>
            <button onClick={load} className="btn-secondary" style={{ padding: '0.75rem', borderRadius: '50%' }}>
              <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            </button>
          </h1>
          <p style={{ fontWeight: 800, opacity: 0.5, color: 'var(--text-muted)' }}>BANCO DE CUENTAS Y ACCESOS DEL SISTEMA</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div className="chip chip-active">{disponiblesCount} LIBRES</div>
            <div className="chip chip-danger">{asignadasCount} ASIGNADAS</div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: '1.25rem 2.5rem' }}>
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
          <option value="ASIGNADA">ASIGNADAS</option>
        </select>
        <button className="btn-secondary" onClick={load} style={{ height: '54px', padding: '0 1.5rem', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> REFRESCAR
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem' }}><Loader2 className="animate-spin" size={48} color="var(--color-primary)" /></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Servicio / Categoría</th>
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
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           {c.servicio.logo_url ? <img src={c.servicio.logo_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Key size={18} />}
                        </div>
                        <div style={{ fontWeight: 900 }}>{c.servicio.nombre.toUpperCase()}</div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 800 }}>{c.usuario}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>
                          {revealedPasswords.has(c.id) ? c.password : '••••••••'}
                        </span>
                        <button onClick={() => togglePassword(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                          {revealedPasswords.has(c.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      {c.perfil && <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)' }}>P: {c.perfil}</div>}
                      <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{c.notas || '-'}</div>
                    </td>
                    <td>
                      <div className={`chip ${c.disponible ? 'chip-active' : 'chip-danger'}`}>
                        {c.disponible ? 'LIBRE' : 'ASIGN'}
                      </div>
                    </td>
                    <td>
                      {c.vendor ? (
                        <div style={{ fontWeight: 900, fontSize: '0.85rem' }}>
                           <span style={{ color: 'var(--color-primary)' }}>@{c.vendor.alias.toUpperCase()}</span>
                        </div>
                      ) : <span style={{ opacity: 0.3 }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button onClick={() => handleCopy(c)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none' }} title="Copiar"><Copy size={18} /></button>
                        {c.disponible && (
                          <button onClick={() => setAssignModal({ open: true, credencialId: c.id })} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: '#3B82F6' }} title="Asignar"><LinkIcon size={18} /></button>
                        )}
                        <button onClick={() => openEdit(c)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none' }} title="Editar"><Edit3 size={18} color="var(--color-primary)" /></button>
                        {!c.disponible && (
                          <button onClick={() => handleLiberar(c.id)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: '#F59E0B' }} title="Liberar"><Unlock size={18} /></button>
                        )}
                        <button onClick={() => setToDelete(c)} className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--color-danger)' }} title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: '5rem', textAlign: 'center', fontWeight: 900, opacity: 0.4 }}>NO HAY RESULTADOS EN ESTA MATRIZ</div>}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="modal-container" style={{ maxWidth: '550px', padding: '3.5rem', border: '5px solid #000', borderRadius: '32px', background: 'var(--surface-overlay)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '2rem' }}>{editingId ? 'EDITAR' : 'NUEVA'} <span className="text-gradient-primary">CREDENCIAL</span></h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">SERVICIO MAESTRO</label>
                  <select className="input" value={form.servicio_id} onChange={e => setForm({ ...form, servicio_id: e.target.value })} disabled={!!editingId} style={{ height: '60px', fontWeight: 800 }}>
                    <option value="">SELECCIONA CATEGORÍA...</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre.toUpperCase()}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="input-label">USUARIO / EMAIL</label>
                        <input className="input" value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} placeholder="vortex@ares.com" style={{ height: '60px' }} />
                    </div>
                    <div>
                        <label className="input-label">CONTRASEÑA (CLAVE)</label>
                        <input className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="MasterKey123" style={{ height: '60px' }} />
                    </div>
                </div>
                <div>
                  <label className="input-label">PERFIL ASIGNADO (PANTALLA)</label>
                  <input className="input" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })} placeholder="Ej: Perfil 4 / PIN: 1234" style={{ height: '60px' }} />
                </div>
                <div>
                  <label className="input-label">NOTAS INTERNAS (SOPORTE)</label>
                  <textarea className="input" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Instrucciones especiales para el vendedor..." rows={3} style={{ padding: '1.2rem' }} />
                </div>
              </div>

              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.servicio_id || !form.usuario || !form.password}
                style={{ width: '100%', marginTop: '2.5rem', height: '70px', fontSize: '1.2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                {saving ? <Loader2 className="animate-spin" size={24} /> : (editingId ? 'ACTUALIZAR NÚCLEO' : 'SUBIR CREDENCIAL AL SISTEMA')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Asignar Vendedor */}
      <AnimatePresence>
        {assignModal.open && (
           <div className="modal-overlay">
           <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
             className="modal-container" style={{ maxWidth: '500px', padding: '3.5rem', border: '5px solid var(--color-primary)', borderRadius: '32px', background: 'var(--surface-overlay)', textAlign: 'center' }}>
             <div style={{ background: 'rgba(var(--color-primary-rgb), 0.1)', width: 100, height: 100, borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-primary)' }}>
                <LinkIcon size={48} color="var(--color-primary)" />
             </div>
             <h2 style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: '1rem' }}>ASIGNAR A VENDEDOR</h2>
             
             <div style={{ marginBottom: '2.5rem' }}>
               <select className="input" value={assignVendorId} onChange={e => setAssignVendorId(e.target.value)} style={{ height: '60px', fontWeight: 900, textAlign: 'center' }}>
                 <option value="">BUSCAR VENDEDOR...</option>
                 {vendors.map(v => (
                   <option key={v.id} value={v.id}>{v.nombre.toUpperCase()} (@{v.alias.toUpperCase()})</option>
                 ))}
               </select>
               <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '1rem', fontWeight: 800 }}>ESTA ACCIÓN VINCULARÁ LA CREDENCIAL PARA AUDITORÍA</p>
             </div>

             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setAssignModal({ open: false, credencialId: null })}>ABORTAR</button>
                <button className="btn-primary" onClick={handleAssign} disabled={saving || !assignVendorId}
                    style={{ flex: 2, height: '60px', background: 'var(--color-primary)', boxShadow: '8px 8px 0px 0px #000' }}>
                    {saving ? <Loader2 className="animate-spin" /> : 'VINCULAR AHORA'}
                </button>
             </div>
           </motion.div>
         </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {toDelete && (
            <div className="modal-overlay">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="modal-container" style={{ maxWidth: 450, textAlign: 'center', padding: '4rem', border: '5px solid var(--color-danger)', borderRadius: 32, background: 'var(--surface-overlay)', boxShadow: '15px 15px 0px 0px rgba(0,0,0,0.5)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: 100, height: 100, borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--color-danger)' }}>
                        <Trash2 size={48} color="var(--color-danger)" />
                    </div>
                    <h2 style={{ fontWeight: 900, marginBottom: '1rem', fontSize: '2rem' }}>¿ELIMINAR CUENTA?</h2>
                    <p style={{ opacity: 0.8, fontWeight: 700, marginBottom: '2.5rem', fontSize: '1rem' }}>
                        Vas a purgar la cuenta <span style={{ color: 'var(--color-danger)' }}>{toDelete.usuario}</span>. Esta acción es irreversible.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <button className="btn-secondary" style={{ flex: 1, border: 'none' }} onClick={() => setToDelete(null)}>CANCELAR</button>
                        <button className="btn-primary" style={{ flex: 1, background: 'var(--color-danger)', boxShadow: '8px 8px 0px 0px #000' }} onClick={handleDelete}>BORRAR</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      <style>{`
        .btn-icon {
            background: rgba(0,0,0,0.05);
            border: 2px solid #000;
            padding: 10px;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.1s;
        }
        .btn-icon:hover { transform: translateY(-2px); }
        .text-gradient-primary {
            background: linear-gradient(135deg, var(--color-primary), #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}
