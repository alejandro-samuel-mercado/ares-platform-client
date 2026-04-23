/**
 * Página: Calculadora de Ganancias — App Vendedor Ares v2.2 (Saneamiento Temas)
 */
'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalculadoraPage() {
  const [costo, setCosto] = useState('');
  const [venta, setVenta] = useState('');
  const [clientes, setClientes] = useState('');

  const gainPerUnit = parseFloat(venta || '0') - parseFloat(costo || '0');
  const monthlyGain = gainPerUnit * parseFloat(clientes || '0');

  return (
    <div style={{ paddingBottom: '8rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'var(--surface-raised)', color: 'var(--color-primary)', padding: '0.6rem', borderRadius: '12px', border: '2px solid #000' }}>
          <Calculator size={24} />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>PROYECCIÓN <span className="text-gradient-primary">GANANCIAS</span></h1>
      </div>

      <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'var(--surface-raised)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <DollarSign size={14} /> COSTO POR CUENTA (BS)
            </label>
            <input className="input" type="number" value={costo} onChange={e => setCosto(e.target.value)} placeholder="0.00" />
          </div>

          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <TrendingUp size={14} /> PRECIO DE VENTA (BS)
            </label>
            <input className="input" type="number" value={venta} onChange={e => setVenta(e.target.value)} placeholder="0.00" />
          </div>

          <div style={{ borderTop: '2px dashed var(--text-muted)', paddingTop: '1.5rem', opacity: 0.8 }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
              <Users size={14} /> CARTERA DE CLIENTES
            </label>
            <input className="input" type="number" value={clientes} onChange={e => setClientes(e.target.value)} placeholder="Ej: 50" />
          </div>
        </div>

        <div style={{ 
          marginTop: '1rem', background: 'var(--surface-base)', borderRadius: '24px', 
          padding: '2.5rem 1.5rem', border: '3px solid var(--color-primary)',
          boxShadow: '10px 10px 0px 0px rgba(0,0,0,0.5)', textAlign: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(235, 12, 12, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
          
          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            Utilidad por Unidad
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
            {gainPerUnit >= 0 ? '+' : ''}{gainPerUnit.toFixed(0)} <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>Bs</span>
          </div>

          {clientes && parseFloat(clientes) > 0 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '20px', border: '2px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-primary)', opacity: 0.6, fontWeight: 800, marginBottom: '0.3rem' }}>FLUJO MENSUAL ESTIMADO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                {monthlyGain >= 0 ? '+' : ''}{monthlyGain.toLocaleString()} <span style={{ fontSize: '1rem' }}>Bs</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface-raised)', borderRadius: '20px', border: '2px solid #000', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Target size={20} color="var(--color-primary)" />
        <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, color: 'var(--text-primary)' }}>PROYECTA TU ÉXITO CON EL MOTOR ARES v2.2</p>
      </div>
    </div>
  );
}
