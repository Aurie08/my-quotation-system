// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import Layout from '../components/Layout'; // Make sure this path is correct based on your file name (e.g., '../components/Layout' if it's Layout.js)

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rydberg Starck Quotation System',
  description: 'Manage your quotations, invoices, and receipts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}