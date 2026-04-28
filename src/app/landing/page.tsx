'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, TrendingUp, ShieldCheck, Zap, MonitorPlay, Users, Tv, Smartphone, ArrowRight, ChevronRight, BookOpen } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-layout" style={{ background: 'var(--surface-base)', minHeight: '100vh', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <style>{`
        .glass-nav {
          background: rgba(10, 10, 15, 0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .hero-glow {
          position: absolute;
          width: 100vw;
          max-width: 600px;
          height: 100vw;
          max-height: 600px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, rgba(0,0,0,0) 70%);
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 0;
        }
        .card-premium {
          background: linear-gradient(180deg, rgba(30,30,40,0.8) 0%, rgba(20,20,25,0.9) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .card-premium:hover {
          transform: translateY(-5px);
          border-color: rgba(220, 38, 38, 0.3);
          box-shadow: 0 20px 40px -10px rgba(220, 38, 38, 0.1);
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
        }
        .vendors-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 900px) {
          .vendors-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .vendors-grid ul {
            align-items: center;
          }
        }
        @media (max-width: 600px) {
          .glass-nav-inner {
            flex-direction: column;
            gap: 1rem;
          }
          .glass-nav {
            padding: 1rem !important;
          }
          .hero-section {
            padding-top: 10rem !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1rem 2rem' }}>
        <div className="glass-nav-inner" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--color-primary)', padding: '0.5rem', borderRadius: '12px' }}>
              <Play fill="black" size={24} />
            </div>
            <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 900, letterSpacing: '-0.05em' }}>
              ARES <span style={{ color: 'var(--color-primary)' }}>PLATFORM</span>
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1.5rem)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/docs" style={{ fontWeight: 800, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover:text-white transition">
              <BookOpen size={18} /> <span className="hidden sm:inline">Docs</span>
            </Link>
            <Link href="/login" style={{ fontWeight: 800, color: 'white', textDecoration: 'none' }}>
              Ingresar
            </Link>
            <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem' }}>
              Ser Vendedor
            </Link>
          </div>
        </div>
      </nav>

      <div className="hero-glow"></div>

      {/* Hero Section */}
      <section className="hero-section" style={{ position: 'relative', zIndex: 10, paddingTop: '12rem', paddingBottom: '6rem', paddingLeft: 'clamp(1rem, 5vw, 2rem)', paddingRight: 'clamp(1rem, 5vw, 2rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', padding: '0.5rem 1rem', borderRadius: '100px', marginBottom: '2rem' }}>
              <Zap size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--color-primary)' }}>Nº 1 EN ENTRETENIMIENTO DIGITAL</span>
            </div>
            
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
              CUENTAS PREMIUM.<br/>
              <span className="text-glow" style={{ color: 'var(--color-primary)' }}>PRECIOS INVENCIBLES.</span>
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
              Disfruta de Netflix, Max, Disney+ y los mejores canales IPTV al mejor precio del mercado. ¿Buscas ingresos extra? Únete a nuestra red de distribución.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="#comprar" className="btn-primary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MonitorPlay size={20} /> Comprar Cuenta
              </Link>
              <Link href="#vender" className="btn-secondary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <TrendingUp size={20} /> Quiero Revender
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Showcase (For End Customers) */}
      <section id="comprar" style={{ padding: 'clamp(3rem, 10vw, 6rem) clamp(1rem, 5vw, 2rem)', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, marginBottom: '1rem' }}>EL MEJOR CATÁLOGO</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Todo el entretenimiento en máxima resolución, sin cortes y con garantía.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {/* Service 1 */}
            <motion.div whileHover={{ y: -10 }} className="card-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(229, 9, 20, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(229, 9, 20, 0.3)' }}>
                <Tv size={40} color="#E50914" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Streaming VOD</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Perfiles originales y cuentas completas de Netflix, Disney+, Prime Video y más.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>4K Ultra HD</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>Perfiles Privados</span>
              </div>
            </motion.div>

            {/* Service 2 */}
            <motion.div whileHover={{ y: -10 }} className="card-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <MonitorPlay size={40} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>TV en Vivo (IPTV)</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Miles de canales en vivo, deportes premium (Liga, Champions) y canales para adultos.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>+5000 Canales</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>Anti-Freeze</span>
              </div>
            </motion.div>

            {/* Service 3 */}
            <motion.div whileHover={{ y: -10 }} className="card-premium" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <ShieldCheck size={40} color="#22c55e" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Garantía Total</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Todas nuestras cuentas cuentan con reposición inmediata en caso de caída. Soporte 24/7.</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>Soporte WhatsApp</span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', fontWeight: 800 }}>100% Estable</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Vendors Section */}
      <section id="vender" style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 5vw, 2rem)', position: 'relative' }}>
        <div className="vendors-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              EMPRENDE EN <br/><span style={{ color: 'var(--color-primary)' }}>EL MUNDO DIGITAL</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Ares Platform no es solo un distribuidor, es tu socio tecnológico. Te damos acceso directo a precios mayoristas y una plataforma completa para controlar a tus propios clientes.
            </p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Catálogo público automatizado (ares.com/u/tu-nombre)',
                'Material de marketing, imágenes y flyers actualizados',
                'Cartelera deportiva diaria automatizada',
                'Gestión de cartera de clientes y utilidades'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', fontWeight: 800 }}>
                  <div style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                    <ShieldCheck size={20} color="var(--color-primary)" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/register" className="btn-primary" style={{ padding: '1.2rem 2.5rem', borderRadius: '16px', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              Crear mi Cuenta Gratis <ArrowRight size={20} />
            </Link>
          </motion.div>

          {/* Visual Element for Vendors */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ position: 'relative' }}>
            <div className="card-premium" style={{ position: 'relative', zIndex: 10, background: '#111115' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Users size={24} color="var(--color-primary)" />
                  <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Tu Panel Vendedor</span>
                </div>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 900 }}>
                  EN LÍNEA
                </div>
              </div>

              {/* Mock UI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Costo Netflix</span>
                  <span style={{ fontWeight: 900 }}>25 Bs</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tu Venta Recomendada</span>
                  <span style={{ fontWeight: 900, color: 'var(--color-primary)' }}>40 Bs</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>Tu Ganancia</span>
                  <span style={{ fontSize: '2rem', fontWeight: 900 }}>+15 Bs</span>
                </div>
              </div>
            </div>
            
            {/* Decorator Box */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '200px', height: '100px', background: 'var(--color-primary)', borderRadius: '20px', zIndex: 1, filter: 'blur(40px)', opacity: 0.3 }}></div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem clamp(1rem, 5vw, 2rem)', textAlign: 'center', background: 'rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-primary)', padding: '0.25rem', borderRadius: '8px' }}>
            <Play fill="black" size={16} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.05em' }}>
            ARES <span style={{ color: 'var(--color-primary)' }}>PLATFORM</span>
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          La red tecnológica de distribución de entretenimiento número 1.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Link href="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 800 }}>Documentación</Link>
          <Link href="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 800 }}>Acceso Vendedores</Link>
          <Link href="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 800 }}>Registro</Link>
        </div>
      </footer>
    </div>
  );
}
