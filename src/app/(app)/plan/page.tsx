/**
 * Página: Gestión de Suscripción (Mi Plan) — App Vendedor Ares v2
 * 
 * Interfaz de "Power Meter" para el estado de la cuenta.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Upload, Clock, Zap, CheckCircle2, AlertTriangle, ShieldCheck, QrCode, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function PlanPage() {
  const { vendor } = useAuth();
  const [ajustes, setAjustes] = useState<any>(null);
  const [pagos, setPagos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Reload payments
  const fetchPagos = () => {
    api.get('/pagos').then(setPagos).catch(console.error);
  };

  useEffect(() => { 
    api.get('/ajustes-publicos', true)
      .then(setAjustes)
      .catch(console.error);
    fetchPagos();
  }, []);

  const hasPending = pagos.some(p => p.status === 'PENDIENTE');

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const daysLeft = vendor ? Math.max(0, Math.ceil((new Date(vendor.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const totalDays = 30; // Base para la barra
  const progress = Math.min(100, (daysLeft / totalDays) * 100);
  const isDanger = daysLeft <= 5;

  const [file, setFile] = useState<File | null>(null);

  const handleSendReceipt = async () => {
    if (!file) {
      alert('Por favor selecciona una imagen de tu comprobante');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('monto', '70'); // Esto se podría hacer dinámico según el plan
      formData.append('plan_id', vendor?.plan_id || '');
      formData.append('comprobante', file);

      const token = localStorage.getItem('ares_token');
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      const res = await fetch(`${base}/pagos/comprobante`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Error al subir');
      
      triggerToast();
      setFile(null);
      fetchPagos(); // Reload payments to show the "Pending" state
    } catch (err) { 
      console.error(err);
      alert('Error al enviar el comprobante. Reintenta pronto.');
    }
    setUploading(false);
  };

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
              background: '#000', color: 'white', padding: '1rem 2rem', width: 'max-content',
              borderRadius: '24px', border: '2px solid var(--color-primary)',
              boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)',
              fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem'
            }}
          >
            <CheckCircle2 color="var(--color-primary)" />
            COMPROBANTE ENVIADO A REVISIÓN
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              GESTIÓN DE <span className="text-gradient-primary">PLAN</span>
            </h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>PANEL DE SUSCRIPCIÓN POWER-ARES</p>
          </div>
          <button 
                onClick={fetchPagos} 
                className="btn-secondary" 
                style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Refrescar Estado"
            >
                <RefreshCw size={24} />
            </button>
        </div>
      </div>

      {/* Main Stats Card (Power Meter) */}
      <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <Zap size={24} color={isDanger ? 'var(--color-secondary)' : 'var(--color-primary)'} className={!isDanger ? 'animate-pulse' : ''} />
        </div>

        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1, marginBottom: '0.5rem' }}>
          {vendor?.plan ? `PLAN ${vendor.plan.toUpperCase()}` : 'SIN PLAN'}
        </h2>
        
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isDanger ? 'var(--color-secondary)' : 'var(--color-primary)', marginBottom: '1.5rem' }}>
          {daysLeft} DÍAS RESTANTES
        </div>

        {/* Custom Progress Bar Ares v2 */}
        <div style={{ 
          height: '16px', background: '#000', borderRadius: '10px', padding: '3px',
          border: '1.5px solid #000', marginBottom: '1.5rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            style={{ 
              height: '100%', 
              background: isDanger ? 'var(--color-secondary)' : 'var(--color-primary)', 
              borderRadius: '6px',
              boxShadow: `0 0 15px ${isDanger ? 'var(--color-secondary)' : 'var(--color-primary)'}`
            }} 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', opacity: 0.5, fontSize: '0.75rem', fontWeight: 800 }}>
          <Clock size={14} />
          VENCE EL {vendor ? new Date(vendor.fecha_vencimiento).toLocaleDateString('es-BO', { day: '2-digit', month: 'long' }) : '--/--'}
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', background: 'var(--surface-raised)', 
          padding: '1rem', borderRadius: '20px', border: '2px solid #000',
          marginBottom: '1.5rem', boxShadow: '5px 5px 0px 0px #000'
        }}>
          <CreditCard size={32} />
        </div>
        
        <h3 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '1.5rem' }}>RENOVAR LICENCIA</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '1rem' }}>PASO 1: ESCANEA Y PAGA</p>
          <div style={{ 
            background: 'white', padding: '1rem', borderRadius: '24px', 
            border: '2px solid #000', width: '220px', margin: '0 auto 1.5rem',
            boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.1)'
          }}>
            {ajustes?.qr_cobro_url ? (
              <img src={ajustes.qr_cobro_url} style={{ width: '100%', borderRadius: '12px' }} alt="QR" />
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                <QrCode size={64} />
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>O TRANSFERENCIA A:</p>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#000' }}>
            {ajustes?.tigo_money_numero || 'PENDIENTE'}
          </div>
        </div>

        <div style={{ borderTop: '2px dashed #00000020', paddingTop: '2rem' }}>
          {hasPending ? (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '2px dashed #F59E0B', padding: '1.5rem', borderRadius: '24px' }}>
              <Clock size={40} color="#F59E0B" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontWeight: 900, color: '#F59E0B', fontSize: '1.1rem', marginBottom: '0.5rem' }}>PAGO EN REVISIÓN</h4>
              <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', opacity: 0.8 }}>
                Hemos recibido tu comprobante y estamos validando la transacción. Tu plan se activará en breve.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-primary)', marginBottom: '1rem' }}>PASO 2: SUBE TU COMPROBANTE</p>
              
              <div style={{ position: 'relative', marginBottom: '1.5rem', minHeight: '120px', border: '3px dashed #000', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: 'var(--surface-raised)' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                />
                <div style={{ pointerEvents: 'none' }}>
                  {file ? (
                    <div style={{ color: 'var(--color-primary)', fontWeight: 900 }}>
                       <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                       {file.name}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.4 }}>
                      <Upload size={32} style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontWeight: 900, fontSize: '0.7rem' }}>CLIC AQUÍ PARA SELECCIONAR IMAGEN</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleSendReceipt} 
                disabled={uploading || !file} 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', height: '60px', opacity: !file ? 0.5 : 1 }}
              >
                {uploading ? 'ENVIANDO...' : (
                  <>
                    <Zap size={18} /> ENVIAR COMPROBANTE
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div style={{ 
        marginTop: '2rem', padding: '1.25rem', background: 'var(--surface-raised)',
        borderRadius: '20px', border: '2px solid #000', display: 'flex', gap: '1rem', alignItems: 'center'
      }}>
        <div style={{ background: '#000', color: 'var(--color-primary)', padding: '0.5rem', borderRadius: '12px' }}>
          <ShieldCheck size={20} />
        </div>
        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          Los pagos son validados manualmente por el equipo de soporte de Ares. Tu plan se activará en un lapso de 5 a 15 minutos.
        </p>
      </div>
    </div>
  );
}
