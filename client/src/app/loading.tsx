'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function GlobalLoading() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-base font-semibold text-foreground">UltraShop</h3>
          <p className="text-xs text-muted-foreground">{t('loading.text')}</p>
        </div>
      </div>
    </div>
  );
}
