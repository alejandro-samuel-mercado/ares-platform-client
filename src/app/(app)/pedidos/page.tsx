/**
 * Página: Mis Pedidos — App Vendedor Ares v2 (Cartoon-Futurista)
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Package, Plus, Clock, CheckCircle2, AlertCircle, Loader2, Send, MessageSquare, X, Smartphone, Zap, RefreshCw, UploadCloud, File as FileIcon, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pedido {
  id: string;
  servicio_id: string;
  notas: string;
  status: string;
  respuesta_admin: string | null;
  respondido_en: string | null;
  creado_en: string;
}

export default function PedidosVendorPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(true); 
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [tasaCambio, setTasaCambio] = useState(6.96);

  // Form state
  const [newPedido, setNewPedido] = useState<{ 
    notas: string; 
    servicio_id: string; 
    cantidad: number; 
    comprobante: File | null; 
    comprobante_url: string;
    providerPagos: any | null;
  }>({ 
    notas: '', 
    servicio_id: '', 
    cantidad: 1, 
    comprobante: null, 
    comprobante_url: '',
    providerPagos: null
  });
  const [misServicios, setMisServicios] = useState<any[]>([]);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchData = async () => {
    try {
      const [pedidosData, misServiciosData, ajustes] = await Promise.all([
        api.get('/pedidos'),
        api.get('/mis_servicios'),
        api.get('/ajustes-publicos')
      ]);
      setPedidos(pedidosData);
      setMisServicios(misServiciosData.map((ms: any) => ({
        ...ms.servicio,
        ms_id: ms.id 
      })));
      if (ajustes?.tasa_cambio_bob) setTasaCambio(ajustes.tasa_cambio_bob);
    } catch (error: any) {
      if (error.status === 403) setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPedido.servicio_id) {
       triggerToast('SELECCIONA UN SERVICIO');
       return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('notas', newPedido.notas);
      formData.append('servicio_id', newPedido.servicio_id);
      formData.append('cantidad', newPedido.cantidad.toString());
      if (newPedido.comprobante) formData.append('comprobante', newPedido.comprobante);
      if (newPedido.comprobante_url) formData.append('comprobante_url', newPedido.comprobante_url);

      await api.request('/pedidos', { method: 'POST', body: formData });
      
      await fetchData();
      setIsModalOpen(false);
      setNewPedido({ notas: '', servicio_id: '', cantidad: 1, comprobante: null, comprobante_url: '', providerPagos: null });
      triggerToast('PEDIDO ENVIADO AL EQUIPO');
    } catch (error: any) {
      if (error.status === 403 && error.data?.reason === 'plan_limit_reached') {
        triggerToast(error.data.message || 'TU PLAN NO INCLUYE PEDIDOS');
      } else {
        triggerToast('ERROR AL PROCESAR PEDIDO');
      }
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDIENTE': return { color: 'var(--color-warning)', icon: <Clock size={16} /> };
      case 'EN_PROCESO': return { color: 'var(--color-primary)', icon: <Zap size={16} /> };
      case 'COMPLETADO': return { color: 'var(--color-success)', icon: <CheckCircle2 size={16} /> };
      case 'CANCELADO': return { color: 'var(--color-danger)', icon: <AlertCircle size={16} /> };
      default: return { color: 'var(--color-muted)', icon: <MessageSquare size={16} /> };
    }
  };

  if (!isPro && !loading) {
    return (/* ... omitido por brevedad en el log, pero presente en el archivo final ... */
      <div style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ 
          width: '100px', height: '100px', background: 'var(--surface-raised)', 
          borderRadius: '30px', border: '3px solid #000', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
          boxShadow: '10px 10px 0px 0px #000'
        }}>
          <Package size={48} color="var(--color-primary)" />
        </div>
        <h2 style={{ fontSize: '2rem' }}>ACCESO <span className="text-gradient-primary">PRO EXCLUSIVO</span></h2>
        <p style={{ fontWeight: 700, marginTop: '1rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
          La gestión de pedidos de material personalizado es una ventaja de los usuarios con plan avanzado.
        </p>
        <button 
          onClick={() => window.location.href = '/plan'}
          className="btn-primary"
          style={{ marginTop: '2.5rem', padding: '1.25rem 2.5rem' }}
        >
          MEJORAR MI PLAN AHORA
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 1.5rem 8rem 1.5rem' }}>
      {/* Toast Ares v2 */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
              background: '#000', color: 'white', padding: '1.25rem 2.5rem', width: 'max-content',
              borderRadius: '24px', border: '2px solid var(--color-primary)',
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <Package color="var(--color-primary)" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              MIS <span className="text-gradient-primary">PEDIDOS</span>
            </h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>DISEÑO Y SOPORTE ESPECIAL</p>
          </div>
          <button 
            onClick={fetchData} 
            className="btn-secondary" 
            style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refrescar Pedidos"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ width: '56px', height: '56px', borderRadius: '18px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={28} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        </div>
      ) : pedidos.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <MessageSquare size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem auto' }} />
          <p style={{ fontWeight: 800, fontSize: '0.9rem', opacity: 0.4 }}>SIN ACTIVIDAD RECIENTE</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pedidos.map((p, i) => {
            const config = getStatusConfig(p.status);
            return (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
              >
                <div style={{ 
                  width: '50px', height: '50px', borderRadius: '14px', 
                  background: 'var(--surface-raised)', border: '2px solid #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: config.color, flexShrink: 0
                }}>
                  {config.icon}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div className="chip" style={{ 
                      fontSize: '0.6rem', padding: '0.1rem 0.5rem', 
                      borderColor: config.color, color: config.color, background: 'rgba(0,0,0,0.05)'
                    }}>
                      {p.status}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.4 }}>
                      {new Date(p.creado_en).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notas}
                  </p>
                  {p.respuesta_admin && (
                    <div style={{ 
                      marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px',
                      background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)'
                    }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-success)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>📋 RESPUESTA DEL ADMIN</div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{p.respuesta_admin}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Nuevo Pedido Rediseñado */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, zIndex: 0 }}
            />
            <motion.div 
              initial={{ y: 100, opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 100, opacity: 0 }}
              className="modal-container"
              style={{ padding: '2.5rem', zIndex: 1, width: '90%', maxWidth: '450px', borderWidth: '3px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem' }}>NUEVO <span className="text-gradient-primary">PEDIDO</span></h2>
                <button onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                  <X size={28} color="#000" />
                </button>
              </div>

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="input-label">¿De qué catálogo solicitás?</label>
                  <select 
                    className="input" 
                    value={newPedido.servicio_id}
                    onChange={(e) => {
                      setNewPedido({ ...newPedido, servicio_id: e.target.value, providerPagos: null });
                    }}
                    required
                  >
                     <option value="">Selecciona un servicio...</option>
                     <option value="MATERIAL_CUSTOM">FLYER O DISEÑO PERSONALIZADO</option>
                     {misServicios.map(s => (
                       <option key={s.id} value={s.id}>{s.nombre} - Bs {s.precio_admin || s.precio_sugerido || 0} | ${((s.precio_admin || s.precio_sugerido || 0) / tasaCambio).toFixed(2)} USD</option>
                     ))}
                  </select>
                </div>

                {newPedido.servicio_id && newPedido.servicio_id !== 'MATERIAL_CUSTOM' && (
                   <div style={{ marginTop: '0.5rem' }}>
                      <button 
                        type="button"
                        className="btn-secondary"
                        style={{ width: '100%', gap: '1rem', borderStyle: 'dashed' }}
                        onClick={async () => {
                          const svc = misServicios.find(s => s.id === newPedido.servicio_id);
                          if (!svc) return;
                          
                          if (svc.proveedor_id) {
                            try {
                              const data = await api.get(`/marketplace/proveedor/${svc.proveedor_id}/pagos`);
                              setNewPedido({ ...newPedido, providerPagos: data });
                              if (data.qr_bob) setShowQRModal(data.qr_bob);
                              else if (data.qr_usd) setShowQRModal(data.qr_usd);
                            } catch (e) {
                              triggerToast('ERROR CARGANDO DATOS DE PAGO');
                            }
                          } else {
                            try {
                              const ajustes = await api.get('/ajustes-publicos');
                              setNewPedido({ ...newPedido, providerPagos: {
                                nombre: 'SISTEMA ARES',
                                qr_bob: ajustes.qr_cobro_bob,
                                qr_usd: ajustes.qr_cobro_usd,
                                tigo_money: ajustes.tigo_money_numero
                              }});
                              if (ajustes.qr_cobro_bob) setShowQRModal(ajustes.qr_cobro_bob);
                            } catch (e) {
                              triggerToast('ERROR CARGANDO DATOS DEL ADMIN');
                            }
                          }
                        }}
                      >
                        <QrCode size={20} /> VER QR / DATOS DE PAGO
                      </button>
                      
                      {newPedido.providerPagos && (
                        <div style={{ 
                          marginTop: '0.75rem', padding: '1rem', 
                          background: 'var(--surface-raised)', borderRadius: '14px', 
                          border: '1.5px solid #000', fontSize: '0.8rem' 
                        }}>
                          <p style={{ fontWeight: 900, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                            PAGO A: {newPedido.providerPagos.nombre}
                          </p>
                          {newPedido.providerPagos.tigo_money && (
                            <p style={{ fontWeight: 800 }}>Tigo Money: <span style={{ color: 'var(--color-primary)' }}>{newPedido.providerPagos.tigo_money}</span></p>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {newPedido.providerPagos.qr_bob && <button type="button" onClick={() => setShowQRModal(newPedido.providerPagos.qr_bob)} className="chip" style={{ borderColor: 'var(--color-primary)' }}>QR BS</button>}
                            {newPedido.providerPagos.qr_usd && <button type="button" onClick={() => setShowQRModal(newPedido.providerPagos.qr_usd)} className="chip" style={{ borderColor: 'var(--color-primary)' }}>QR USD</button>}
                          </div>
                        </div>
                      )}
                   </div>
                )}

                {newPedido.servicio_id !== 'MATERIAL_CUSTOM' && newPedido.servicio_id !== '' && (
                  <div>
                    <label className="input-label">Cantidad Cuentas a Pedir</label>
                    <input 
                      type="number"
                      min={1}
                      max={50}
                      className="input"
                      value={newPedido.cantidad}
                      onChange={(e) => setNewPedido({ ...newPedido, cantidad: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                )}
              
                <div>
                  <label className="input-label">Detalles del Requerimiento / Referencia</label>
                  <textarea 
                    placeholder="Ej: Adjunto pago por perfil de pantalla completa Netflix..."
                    className="input"
                    style={{ minHeight: '100px', paddingTop: '1rem', resize: 'none' }}
                    value={newPedido.notas}
                    onChange={(e) => setNewPedido({ ...newPedido, notas: e.target.value })}
                    required
                  />
                </div>

                <div>
                   <label className="input-label">Comprobante de Pago (Enviá a {newPedido.providerPagos?.nombre || 'Admin'})</label>
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                       <div style={{ flex: 1 }}>
                           <input 
                             type="file" 
                             accept="image/*" 
                             style={{ display: 'none' }} 
                             ref={fileInputRef}
                             onChange={(e) => {
                               if (e.target.files && e.target.files[0]) setNewPedido({ ...newPedido, comprobante: e.target.files[0] });
                             }}
                           />
                           <div 
                             onClick={() => fileInputRef.current?.click()}
                             style={{
                               border: '2px dashed var(--color-primary)', borderRadius: '18px', padding: '1.5rem',
                               display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                               cursor: 'pointer', background: 'var(--surface-raised)', transition: 'all 0.2s', opacity: 0.8,
                               height: '100%', justifyContent: 'center'
                             }}
                             className="hover-bright"
                           >
                             {newPedido.comprobante ? (
                                <>
                                  <CheckCircle2 color="var(--color-success)" size={32} />
                                  <span style={{ fontSize: '0.8rem', fontWeight: 900, textAlign: 'center', wordBreak: 'break-all' }}>{newPedido.comprobante.name}</span>
                                </>
                             ) : (
                                <>
                                  <UploadCloud size={32} color="var(--color-primary)" />
                                  <span style={{ fontSize: '0.8rem', fontWeight: 900, textAlign: 'center' }}>Subir de Galería</span>
                                </>
                             )}
                           </div>
                       </div>
                       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>O PEGA UN ENLACE (URL)</span>
                           <input
                               className="input"
                               type="text"
                               placeholder="https://i.ibb.co/..."
                               value={newPedido.comprobante_url}
                               onChange={e => setNewPedido({ ...newPedido, comprobante_url: e.target.value })}
                               style={{ fontSize: '0.85rem' }}
                           />
                       </div>
                   </div>
                </div>

                {newPedido.servicio_id !== 'MATERIAL_CUSTOM' && newPedido.servicio_id !== '' && (
                  <div style={{ background: 'var(--surface-raised)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '18px', border: '2px solid var(--color-primary)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>MONTO TOTAL:</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                        Bs {(() => { const svc = misServicios.find(s => s.id === newPedido.servicio_id); return ((svc?.precio_admin || svc?.precio_sugerido || 0) * newPedido.cantidad); })()}
                      </span>
                      <br />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.5 }}>
                        ${(() => { const svc = misServicios.find(s => s.id === newPedido.servicio_id); return (((svc?.precio_admin || svc?.precio_sugerido || 0) * newPedido.cantidad) / tasaCambio).toFixed(2); })()} USD
                      </span>
                    </div>
                  </div>
                )}

                <div className="card-static" style={{ background: 'var(--surface-raised)', borderWidth: '1.5px', padding: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1.4 }}>
                    PAGÁ DIRECTAMENTE AL {newPedido.providerPagos?.nombre === 'SISTEMA ARES' ? 'ADMIN' : 'PROVEEDOR'} ESCANEANDO EL QR. SI SUBISTE COMPROBANTE CORRECTO, TU CUENTA ESTARÁ LISTA EN SEGUNDOS TRAS LA APROBACIÓN.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="submit"
                    disabled={saving || !newPedido.notas}
                    className="btn-primary"
                    style={{ flex: 1, height: '60px', fontSize: '1rem' }}
                  >
                    {saving ? <Loader2 size={24} className="animate-spin" /> : <><Send size={20} /> ENVIAR PEDIDO</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Visor de QR */}
      <AnimatePresence>
        {showQRModal && (
          <div className="modal-overlay" style={{ zIndex: 20000 }}>
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowQRModal(null)}
               style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }}
             />
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
               className="modal-container"
               style={{ padding: '1rem', width: '90%', maxWidth: '400px', textAlign: 'center' }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <span style={{ fontWeight: 900 }}>ESCANEÁ PARA PAGAR</span>
                   <X size={24} onClick={() => setShowQRModal(null)} style={{ cursor: 'pointer' }} />
                </div>
                <img 
                  src={showQRModal} 
                  style={{ width: '100%', borderRadius: '16px', border: '2px solid #000' }} 
                  alt="QR de Pago" 
                />
                <button 
                  onClick={() => setShowQRModal(null)} 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  LISTO, YA ESCANEÉ
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
