/**
 * Pantalla de Login — Ares Redesign v2.2 (Nuclear Polish & Theme Sync)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.es_colaborador) {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Credenciales incorrectas');
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
        }
      `}</style>
      {/* Lado Decorativo — Futurismo Hard Cartoon */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="card auth-decorative" 
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1A1444 100%)',
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
            animate={{ rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ 
              display: 'inline-flex', 
              background: 'var(--color-accent)', 
              padding: '1.25rem', 
              borderRadius: '24px', 
              border: '3px solid #000',
              boxShadow: '8px 8px 0px 0px #000',
              marginBottom: '3rem',
              color: '#000'
            }}
          >
            <ShieldCheck size={56} />
          </motion.div>
          
          <h1 style={{ fontSize: '5rem', lineHeight: 0.9, marginBottom: '2rem', fontFamily: 'var(--font-display)', fontWeight: 900, textShadow: '4px 4px 0px #000' }}>
            ARES <br />
            <span style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }}>PLATFORM</span>
          </h1>
          
          <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', maxWidth: '500px', lineHeight: 1.4 }}>
            EL MOTOR PARA <span style={{ color: 'var(--color-secondary)' }}>MÁXIMAS VENTAS</span> EN IPTV & STREAMING.
          </p>

          <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="card-static" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', padding: '1.5rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-accent)' }}>+1.5K</p>
              <p style={{ fontWeight: 900, fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.1em' }}>SELLERS ACTIVOS</p>
            </div>
            <div className="card-static" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)', padding: '1.5rem' }}>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-primary)' }}>99.9%</p>
              <p style={{ fontWeight: 900, fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.1em' }}>UPTIME PROTOCOL</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '4rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
          <Globe size={16} />
          <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.2em' }}>BOLIVIA CORE ACCESS</span>
        </div>
      </motion.div>

      {/* Lado del Formulario — Minimalismo Hard Cartoon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card auth-form-card" 
          style={{ width: '100%', padding: '4rem', background: 'var(--surface-raised)' }}
        >
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--color-primary)', borderRadius: '3px', boxShadow: '0 0 10px var(--color-primary)' }} />
              <p style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.2rem', color: 'var(--color-primary)' }}>SISTEMA DE ACCESO</p>
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>BIENVENIDO</h2>
            <p style={{ fontWeight: 800, color: 'var(--text-muted)' }}>Identifícate para entrar al sistema</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label className="input-label" style={{ color: 'var(--text-primary)' }}>USUARIO DE ACCESO (ALIAS)</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Ej: admin" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '3.5rem', height: '64px', fontSize: '1.1rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label" style={{ color: 'var(--text-primary)' }}>CLAVE MAESTRA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, color: 'var(--text-primary)' }} />
                <input 
                  type="password" 
                  className="input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '3.5rem', height: '64px', fontSize: '1.1rem' }}
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
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  boxShadow: '4px 4px 0px 0px rgba(239, 68, 68, 0.2)'
                }}>
                ⚠️ {error.toUpperCase()}
              </motion.div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', height: '70px', fontSize: '1.2rem' }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Zap size={24} className="animate-pulse" /> PROCESANDO...
                </div>
              ) : (
                <>
                  INGRESAR AHORA <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '3.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              ¿No tienes cuenta? <Link href="/register" className="text-gradient-primary" style={{ cursor: 'pointer', fontWeight: 900, textDecoration: 'none' }}>REGÍSTRATE GRATIS</Link>
            </p>
            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '1rem', opacity: 0.5 }}>
              ¿Olvidaste tu acceso? <span style={{ cursor: 'pointer', fontWeight: 900 }}>SOLICITAR AYUDA</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
