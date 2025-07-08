// src/app/layout.tsx
import './globals.css';
import Layout from '../components/Layout';

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
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}