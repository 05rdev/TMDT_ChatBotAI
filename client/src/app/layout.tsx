import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

import { ClientWrapper } from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "UltraShop | Neo-Tech E-commerce",
  description: "Trải nghiệm mua sắm thông minh với sức mạnh AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} min-h-screen relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Neo-brutalist Background Pattern */}
          <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300"
               style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          </div>

          <ClientWrapper>
            {children}
          </ClientWrapper>

          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'solid-card',
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '2px solid var(--foreground)',
                boxShadow: '4px 4px 0px 0px var(--foreground)',
                borderRadius: '0px'
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
