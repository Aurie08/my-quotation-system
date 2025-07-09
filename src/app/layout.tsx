// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from "@/components/theme-provider";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rydberg Starck Quotation System',
  description: 'Manage your invoices, receipts, and quotations efficiently.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Added flex, flex-col, min-h-screen to body */}
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Header/Navigation */}
          <header className="bg-rs-dark-navy text-white p-4 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
                <img
                  src="/Logo.png.png"
                  alt="Rydberg Starck Logo"
                  className="h-8 w-auto"
                />
                <span>Rydberg Starck Quotation System</span>
              </Link>
              <div className="space-x-4">
                <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-rs-teal-green hover:text-white")}>
                  Home
                </Link>
                <Link href="/invoices" className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-rs-teal-green hover:text-white")}>
                  Invoices
                </Link>
                <Link href="/receipts" className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-rs-teal-green hover:text-white")}>
                  Receipts
                </Link>
                <Link href="/quotations" className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-rs-teal-green hover:text-white")}>
                  Quotations
                </Link>
              </div>
            </nav>
          </header>

          {/* Main content wrapper - added flex-grow here */}
          <div className="flex-grow">
            {children}
          </div>

          {/* Footer - removed mt-8 */}
          <footer className="bg-rs-dark-navy text-white p-4 text-center">
            <div className="container mx-auto">
              <p>&copy; 2025 Rydberg Starck. All rights reserved.</p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}