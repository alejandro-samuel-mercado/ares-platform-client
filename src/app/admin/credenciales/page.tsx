/**
 * Admin: Gestión de Credenciales — Ares v3
 * CRUD de cuentas (usuario/contraseña) por servicio.
 */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Search, Trash2, Edit3, CheckCircle2, XCircle, Loader2, RefreshCw, Unlock, User, Eye, EyeOff, X } from 'lucide-react';

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://ares-api.unixxtech.online/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('ares_token') : null;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const [credRes, svcRes] = await Promise.all([
        fetch(`${API_BASE}/admin/credenciales`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/admin/servicios`, { headers }).then(r => r.json()),
      ]);
      setCredenciales(credRes);
      setServiciosBase(svcRes);
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
        showToast('Credencial actualizada ✅');
      } else {
        await fetch(`${API_BASE}/admin/credenciales`, { method: 'POST', headers, body: JSON.stringify(form) });
        showToast('Credencial creada ✅');
      }
      setShowModal(false);
      resetForm();
      load();
    } catch { showToast('Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta credencial?')) return;
    await fetch(`${API_BASE}/admin/credenciales/${id}`, { method: 'DELETE', headers });
    showToast('Credencial eliminada');
    load();
  };

  const handleLiberar = async (id: string) => {
    await fetch(`${API_BASE}/admin/credenciales/${id}/liberar`, { method: 'POST', headers });
    showToast('Credencial liberada ✅');
    load();
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <AnimatePresence>{toast && (
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
          style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: '#000', color: 'white', padding: '1rem 2rem', borderRadius: '16px', border: '2px solid var(--color-primary)', fontWeight: 800 }}>
          {toast}
        </motion.div>
      )}</AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Key size={28} color="var(--color-primary)" /> GESTIÓN DE <span style={{ color: 'var(--color-primary)' }}>CREDENCIALES</span>
          </h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
            <span style={{ color: '#10B981' }}>🟢 {disponiblesCount} disponibles</span>
            <span style={{ color: '#EF4444' }}>🔴 {asignadasCount} asignadas</span>
            <span>📦 {credenciales.length} total</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem' }}>
          <Plus size={18} /> AGREGAR CREDENCIAL
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select value={filterServicio} onChange={e => setFilterServicio(e.target.value)} className="input" style={{ maxWidth: '250px', fontSize: '0.85rem' }}>
          <option value="TODOS">Todos los servicios</option>
          {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select value={filterDisponible} onChange={e => setFilterDisponible(e.target.value)} className="input" style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
          <option value="TODOS">Todos los estados</option>
          <option value="DISPONIBLE">Disponibles</option>
          <option value="ASIGNADA">Asignadas</option>
        </select>
        <button className="btn-secondary" onClick={load} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Refrescar
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={40} color="var(--color-primary)" /></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', opacity: 0.5, textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 1rem' }}>Servicio</th>
                <th style={{ padding: '0.5rem 1rem' }}>Usuario</th>
                <th style={{ padding: '0.5rem 1rem' }}>Contraseña</th>
                <th style={{ padding: '0.5rem 1rem' }}>Perfil</th>
                <th style={{ padding: '0.5rem 1rem' }}>Estado</th>
                <th style={{ padding: '0.5rem 1rem' }}>Asignada a</th>
                <th style={{ padding: '0.5rem 1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ background: 'var(--surface-raised)', borderRadius: '12px' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {c.servicio.logo_url && <img src={c.servicio.logo_url} style={{ width: 28, height: 28, borderRadius: '8px', objectFit: 'cover' }} />}
                      {c.servicio.nombre}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>{c.usuario}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                        {revealedPasswords.has(c.id) ? c.password : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        {revealedPasswords.has(c.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>{c.perfil || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                      background: c.disponible ? '#10B98122' : '#EF444422',
                      color: c.disponible ? '#10B981' : '#EF4444',
                      border: `1.5px solid ${c.disponible ? '#10B98155' : '#EF444455'}`
                    }}>
                      {c.disponible ? 'DISPONIBLE' : 'ASIGNADA'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700 }}>
                    {c.vendor ? `@${c.vendor.alias}` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEdit(c)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 size={16} color="var(--color-primary)" /></button>
                      {!c.disponible && (
                        <button onClick={() => handleLiberar(c.id)} title="Liberar" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Unlock size={16} color="#F59E0B" /></button>
                      )}
                      <button onClick={() => handleDelete(c.id)} title="Eliminar" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#EF4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.5 }}>No hay credenciales con estos filtros</p>}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowModal(false)}>
            <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{ background: 'var(--surface-raised, white)', borderRadius: '24px', border: '3px solid #000', padding: '2rem', maxWidth: '480px', width: '95%', boxShadow: '12px 12px 0px 0px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.2rem' }}>{editingId ? 'EDITAR' : 'NUEVA'} CREDENCIAL</h2>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, display: 'block', marginBottom: '0.3rem' }}>SERVICIO</label>
                  <select className="input" value={form.servicio_id} onChange={e => setForm({ ...form, servicio_id: e.target.value })} disabled={!!editingId}>
                    <option value="">Seleccionar...</option>
                    {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, display: 'block', marginBottom: '0.3rem' }}>USUARIO / EMAIL</label>
                  <input className="input" value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} placeholder="usuario@email.com" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, display: 'block', marginBottom: '0.3rem' }}>CONTRASEÑA</label>
                  <input className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Contraseña de la cuenta" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, display: 'block', marginBottom: '0.3rem' }}>PERFIL (opcional)</label>
                  <input className="input" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })} placeholder="Perfil 1, Pantalla 2..." />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.5, display: 'block', marginBottom: '0.3rem' }}>NOTAS INTERNAS (opcional)</label>
                  <input className="input" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas internas..." />
                </div>
              </div>

              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.servicio_id || !form.usuario || !form.password}
                style={{ width: '100%', marginTop: '1.5rem', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> {editingId ? 'ACTUALIZAR' : 'CREAR CREDENCIAL'}</>}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
