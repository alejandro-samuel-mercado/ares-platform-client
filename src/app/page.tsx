'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('ares_token');
    const vendor = localStorage.getItem('ares_vendor');
    
    if (token && vendor) {
      const user = JSON.parse(vendor);
      if (user.role === 'SUPERADMIN' || user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/home';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  return null; // O un spinner muy ligero
}
