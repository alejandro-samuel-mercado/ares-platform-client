/**
 * Root Layout — Plataforma Ares
 *
 * Configura Google Fonts (Poppins, Baloo 2, Nunito),
 * fondo oscuro global, y metadata SEO.
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ares — Plataforma de Revendedores',
  description: 'Plataforma SaaS B2B para revendedores de streaming e IPTV en Bolivia',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/icono.png',
    apple: '/images/icono.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B0B0B',
};

import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import PWAInstaller from '@/components/PWAInstaller';
import OneSignalInit from '@/components/OneSignalInit';
import { AuthProvider } from '@/lib/auth';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ThemeToggle />
            <PWAInstaller />
            <OneSignalInit />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

