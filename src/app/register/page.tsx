/**
 * Pantalla de Registro — Ares Redesign v2.2 (Nuclear Polish & Theme Sync)
 * 
 * Permite a nuevos vendedores registrarse y obtener 7 días de acceso gratuito.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, Zap, Globe, Cpu, Phone, AtSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({ nombre, alias, telefono, password });
      router.push('/home');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al registrarse. Intenta con otro alias o teléfono.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <style>{`
        .auth-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 480px;
          background: var(--surface-base);
          padding: 1.5rem;
          gap: 1.5rem;
          overflow: hidden;
        }
        .auth-decorative { display: flex; }
        @media (max-width: 1024px) {
          .auth-layout { grid-template-columns: 1fr !important; }
          .auth-decorative { display: none !important; }
          .auth-form-card { padding: 1.5rem !important; border-radius: 24px !important; }
          .auth-form-card h2 { font-size: 1.8rem !important; }
          .auth-input-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Lado Decorativo — Futurismo Hard Cartoon */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="card auth-decorative" 
        style={{
          background: 'linear-gradient(135deg, var(--color-accent) 0%, #000 100%)',
          color: 'white',
          border: '4px solid #000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorative Element */}
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', opacity: 0.1, color: 'white' }}>
          <Cpu size={500} strokeWidth={1} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ 
              display: 'inline-flex', 
              background: 'white', 
              padding: '1.25rem', 
              borderRadius: '24px', 
              border: '4px solid #000',
              boxShadow: '8px 8px 0px 0px #000',
              marginBottom: '3rem'
            }}
          >
            <img src="/images/logo.png" alt="Ares Logo" style={{ width: '120px', height: 'auto' }} />
          </motion.div>
          
          <h1 style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '2rem', fontFamily: 'var(--font-display)', fontWeight: 900, textShadow: '4px 4px 0px #000' }}>
            ÚNETE AL <br />
            <span style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>EQUIPO ARES</span>
          </h1>
          
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', maxWidth: '500px', lineHeight: 1.4 }}>
            OBTÉN 7 DÍAS <span style={{ color: 'var(--color-primary)' }}>GRATIS</span> DE ACCESO TOTAL.
          </p>

          <div style={{ marginTop: '5rem' }}>
             <div className="card-static" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', padding: '2rem' }}>
                <p style={{ fontWeight: 900, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>PROTOCOLO GUEST ACTIVADO</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Prueba todas las herramientas de gestión sin pagar nada el primer mes.</p>
             </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
          <Globe size={16} />
          <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.2em' }}>SCALING GLOBAL COMMERCE</span>
        </div>
      </motion.div>

      {/* Lado del Formulario — Minimalismo Hard Cartoon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card auth-form-card" 
          style={{ width: '100%', padding: '3rem', background: 'var(--surface-raised)', maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--color-accent)', borderRadius: '3px', boxShadow: '0 0 10px var(--color-accent)' }} />
              <p style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.2rem', color: 'var(--color-accent)' }}>REGISTRO DE VENDEDOR</p>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>Toma el Control</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="input-label" style={{ color: 'var(--text-primary)' }}>NOMBRE COMPLETO</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Tu nombre real" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={{ paddingLeft: '3.5rem', height: '56px' }}
                  required
                />
              </div>
            </div>

            <div className="auth-input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label" style={{ color: 'var(--text-primary)' }}>ALIAS / USER</label>
                  <div style={{ position: 'relative' }}>
                    <AtSign size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="@alias" 
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      style={{ paddingLeft: '3.5rem', height: '56px' }}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label" style={{ color: 'var(--text-primary)' }}>CELULAR</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="78912345" 
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      style={{ paddingLeft: '3.5rem', height: '56px' }}
                      required
                    />
                  </div>
                </div>
            </div>

            <div>
              <label className="input-label" style={{ color: 'var(--text-primary)' }}>CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                <input 
                  type="password" 
                  className="input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '3.5rem', height: '56px' }}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: 'var(--color-danger)', 
                  padding: '1.5rem', 
                  borderRadius: '20px', 
                  border: '2px solid var(--color-danger)',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  textAlign: 'center'
                }}>
                ⚠️ {error.toUpperCase()}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', height: '64px', fontSize: '1.1rem', background: 'var(--color-accent)', color: 'white' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Zap size={24} className="animate-pulse" /> CREANDO ACCESO...
                </div>
              ) : (
                <>
                  OBTENER MIS 7 DÍAS <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              ¿Ya tienes cuenta? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 900, textDecoration: 'none' }}>INGRESAR AQUÍ</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
