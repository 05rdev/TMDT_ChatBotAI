'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, Compass, MapPinOff } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md card-elevated p-10 rounded-[var(--radius-xl)] text-center space-y-6 animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
          <MapPinOff className="w-8 h-8 text-danger" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-heading text-5xl text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">Lạc đường rồi!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Con đường bạn đang tìm kiếm dường như không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button className="w-full flex justify-center items-center gap-2">
              <Home className="w-4 h-4" /> Về nhà
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full flex justify-center items-center gap-2">
              <Compass className="w-4 h-4" /> Khám phá
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
