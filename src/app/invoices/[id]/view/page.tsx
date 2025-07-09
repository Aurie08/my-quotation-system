// src/app/invoices/[id]/view/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

// Import the localStorage utility function to get a single invoice
import { getInvoiceByIdFromLocalStorage } from '@/lib/invoice-storage';

export default function ViewInvoicePage() {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the route parameters
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure id is a string before attempting to fetch
    if (typeof id === 'string') {
      const foundInvoice = getInvoiceByIdFromLocalStorage(id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
        console.log('ViewInvoicePage: Loaded invoice data:', foundInvoice);
      } else {
        console.warn(`ViewInvoicePage: Invoice with ID ${id} not found. Redirecting to list.`);
        router.push('/invoices'); // Redirect if invoice not found
      }
    } else {
      // If ID is missing or not a string, redirect immediately
      console.warn('ViewInvoicePage: No valid ID provided. Redirecting to list.');
      router.push('/invoices');
    }
    setLoading(false);
  }, [id, router]); // Depend on id and router

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center text-lg font-semibold">
        Loading invoice details...
      </div>
    );
  }

  // If after loading, no invoice was found, the redirect should have already happened.
  if (!invoice) {
    return null; // Don't render anything if invoice is not found
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Invoice Details</h1>

      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-rs-dark-navy">Invoice #{invoice.invoiceNumber}</CardTitle>
          <CardDescription>Customer: {invoice.customerName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Customer Name</Label>
              <p className="text-lg font-medium">{invoice.customerName}</p>
            </div>
            {invoice.customerEmail && (
              <div>
                <Label className="text-gray-600">Customer Email</Label>
                <p className="text-lg font-medium">{invoice.customerEmail}</p>
              </div>
            )}
            <div>
              <Label className="text-gray-600">Invoice Number</Label>
              <p className="text-lg font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <Label className="text-gray-600">Issue Date</Label>
              <p className="text-lg font-medium">{invoice.issueDate}</p>
            </div>
            <div>
              <Label className="text-gray-600">Due Date</Label>
              <p className="text-lg font-medium">{invoice.dueDate}</p>
            </div>
            <div>
              <Label className="text-gray-600">Status</Label>
              <p className={`text-lg font-medium capitalize
                ${invoice.status === 'draft' ? 'text-gray-700' : ''}
                ${invoice.status === 'sent' ? 'text-blue-700' : ''}
                ${invoice.status === 'paid' ? 'text-green-700' : ''}
                ${invoice.status === 'overdue' ? 'text-red-700' : ''}
                ${invoice.status === 'cancelled' ? 'text-purple-700' : ''}
              `}>
                {invoice.status}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Invoice Items Table */}
          <h2 className="text-xl font-bold text-rs-dark-navy mb-3">Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-6" />

          {/* Invoice Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Subtotal</Label>
              <p className="text-lg font-medium">${invoice.subTotal.toFixed(2)}</p>
            </div>
            {invoice.taxRate !== undefined && invoice.taxRate > 0 && (
              <div>
                <Label className="text-gray-600">Tax Rate</Label>
                <p className="text-lg font-medium">{(invoice.taxRate * 100).toFixed(2)}%</p>
              </div>
            )}
            <div>
              <Label className="text-gray-600">Tax Amount</Label>
              <p className="text-lg font-medium">${invoice.taxAmount.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-gray-600">Total Amount</Label>
              <p className="text-xl font-bold text-rs-teal-green">${invoice.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6">
              <Label className="text-gray-600">Notes</Label>
              <p className="text-base text-gray-800 bg-gray-50 p-3 rounded-md border">{invoice.notes}</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <Label className="text-gray-600">Created At:</Label> {invoice.createdAt}
          </div>


          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => router.push('/invoices')}>
              Back to List
            </Button>
            <Button onClick={() => window.print()} className="bg-rs-dark-navy hover:bg-rs-light-navy text-white"> {/* Add this button */}
              Print Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}