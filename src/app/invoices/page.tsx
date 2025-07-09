// src/app/invoices/page.tsx
'use client'; // This page needs client-side interactivity

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Import your Invoice type
import { Invoice } from '@/types/invoice';

// Import the localStorage utility functions for invoices and uuid for seeding
import {
  getInvoicesFromLocalStorage,
  deleteInvoiceFromLocalStorage,
  saveInvoicesToLocalStorage, // Needed for seeding
} from '@/lib/invoice-storage';
import { v4 as uuidv4 } from 'uuid'; // Needed for seeding

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch invoices (now from localStorage)
  const fetchInvoices = () => {
    console.log('InvoicesPage: Attempting to fetch data from localStorage...');
    const storedInvoices = getInvoicesFromLocalStorage();
    setInvoices(storedInvoices);
    setLoading(false);
    console.log('InvoicesPage: Data fetched from localStorage:', storedInvoices);
  };

  useEffect(() => {
    // --- Invoice Seeding Logic ---
    // Only run this once on mount to seed data if localStorage is empty for invoices
    if (typeof window !== 'undefined' && getInvoicesFromLocalStorage().length === 0) {
      console.log("Seeding localStorage with initial invoice data for development from InvoicesPage.");
      const initialInvoices: Invoice[] = [
        {
          id: uuidv4(),
          customerName: 'MegaCorp Solutions',
          customerEmail: 'contact@megacorp.com',
          invoiceNumber: 'INV-2025-001',
          issueDate: '2025-07-01',
          dueDate: '2025-07-31',
          items: [
            { description: 'Web Development Phase 1', quantity: 1, unitPrice: 2500.00, total: 2500.00 },
            { description: 'Hosting Fee (July)', quantity: 1, unitPrice: 50.00, total: 50.00 },
          ],
          subTotal: 2550.00,
          taxRate: 0.08, // 8% tax
          taxAmount: 204.00,
          totalAmount: 2754.00,
          status: 'sent',
          notes: 'Initial project setup and design.',
          createdAt: '2025-07-01',
        },
        {
          id: uuidv4(),
          customerName: 'Tech Innovations Ltd.',
          customerEmail: 'info@techinnovations.com',
          invoiceNumber: 'INV-2025-002',
          issueDate: '2025-06-20',
          dueDate: '2025-07-20',
          items: [
            { description: 'Software License Renewal (Annual)', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
          ],
          subTotal: 1200.00,
          taxRate: 0.08,
          taxAmount: 96.00,
          totalAmount: 1296.00,
          status: 'paid',
          notes: 'Thank you for your prompt payment!',
          createdAt: '2025-06-15',
        },
      ];
      saveInvoicesToLocalStorage(initialInvoices);
    }
    // --- End Invoice Seeding Logic ---

    fetchInvoices(); // Always fetch data when component mounts or after seeding
  }, []); // Empty dependency array means this runs once on mount

  // Placeholder handlers for future functionality
  const handleView = (id: string) => {
    console.log('View invoice clicked for ID:', id);
    router.push(`/invoices/${id}/view`); // Future route
  };

  const handleEdit = (id: string) => {
    console.log('Edit invoice clicked for ID:', id);
    router.push(`/invoices/${id}/edit`); // Future route
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const isDeleted = deleteInvoiceFromLocalStorage(id);
      if (isDeleted) {
        console.log(`Invoice with ID ${id} deleted.`);
        fetchInvoices(); // Re-fetch data to update the list
      } else {
        console.warn(`Invoice with ID ${id} not found for deletion.`);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading invoices...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rs-dark-navy">Invoices</h1>
        <Button onClick={() => router.push('/invoices/new')} className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
          Create New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <p className="text-center text-gray-500">No invoices found. Click "Create New Invoice" to add one.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell>{invoice.issueDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="text-right font-bold">${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                      ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                      ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      ${invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                      ${invoice.status === 'cancelled' ? 'bg-purple-100 text-purple-800' : ''}
                    `}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(invoice.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(invoice.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}