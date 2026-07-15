'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { NotificationPopup } from '@/components/NotificationPopup';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import type { Locale } from '@/i18n';

export function ClientWrapper({ children, initialLang }: { children: React.ReactNode, initialLang?: Locale }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const { hasHydrated, isAuthenticated, setUser, resetAuth } = useAuthStore();
  
  // Initialize store synchronously with SSR value to prevent hydration mismatch
  const initialized = React.useRef(false);
  if (!initialized.current && initialLang) {
    useLanguageStore.setState({ locale: initialLang, hydrated: true });
    initialized.current = true;
  }

  useEffect(() => {
    const handleSessionExpired = () => {
      useAuthStore.getState().resetAuth();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    void api.get('/auth/profile')
      .then((res) => {
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        if (!localStorage.getItem('accessToken')) {
          resetAuth();
        }
      });
  }, [hasHydrated, isAuthenticated, resetAuth, setUser]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>

      <Footer />

      {/* Notification Popup for logged-in users */}
      <NotificationPopup />

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/chatbot"
          aria-label="Mở trò chuyện với trợ lý AI"
          title="Trò chuyện với trợ lý AI"
          className="group flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
        </Link>
      </div>
    </>
  );
}
