'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { isAuthenticated } from '@/lib/auth';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/consultations': 'Consultations',
  '/doctors':       'Doctors',
  '/zones':         'Zones',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  const baseRoute = '/' + (pathname.split('/')[1] ?? '');
  const title = PAGE_TITLES[baseRoute] ?? 'BRAC AISP DMS';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
