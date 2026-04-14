import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UltraShop - E-commerce Intelligence",
  description: "Trải nghiệm mua sắm thông minh tích hợp AI thực thụ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen relative`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Gradients */}
          <div className="fixed inset-0 -z-10 bg-background transition-colors duration-300">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 -right-4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
          </div>

          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>

          {/* AI Assistant Bubble Placeholder */}
          <div className="fixed bottom-8 right-8 z-50">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 cursor-pointer hover:scale-110 transition-transform animate-bounce">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
