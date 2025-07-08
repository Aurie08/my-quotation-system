// src/components/Layout.tsx

import React from 'react';
import Link from 'next/link'; // Import Link for Next.js navigation

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-rs-dark-navy flex flex-col">
      <header className="bg-rs-dark-navy text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-rs-light-teal">
            Rydberg Starck Quotation System
          </Link>
          <ul className="flex space-x-4">
            <li><Link href="/" className="hover:text-rs-light-teal">Home</Link></li>
            <li><Link href="/invoices" className="hover:text-rs-light-teal">Invoices</Link></li>
            <li><Link href="/receipts" className="hover:text-rs-light-teal">Receipts</Link></li>
          <li><Link href="/quotations" className="hover:text-rs-light-teal">Quotations</Link></li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto p-8 flex-grow">
        {children}
      </main>

      <footer className="bg-gray-200 text-gray-700 p-4 text-center mt-8">
        © {new Date().getFullYear()} Rydberg Starck. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;