import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });

import { ClientWrapper } from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "UltraShop | Mua sắm thông minh",
  description: "Trải nghiệm mua sắm thông minh với sức mạnh AI — Sản phẩm chất lượng, giao hàng nhanh chóng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSerif.variable} font-sans min-h-screen relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientWrapper>
            {children}
          </ClientWrapper>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
