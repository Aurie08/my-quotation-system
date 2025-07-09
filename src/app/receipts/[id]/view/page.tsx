// src/app/receipts/[id]/view/page.tsx
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

// Import your Receipt type
import { Receipt } from '@/types/receipts';

// Import the localStorage utility function to get a single receipt
import { getReceiptByIdFromLocalStorage } from '@/lib/receipt-storage';

export default function ViewReceiptPage() {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the route parameters
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure id is a string before attempting to fetch
    if (typeof id === 'string') {
      const foundReceipt = getReceiptByIdFromLocalStorage(id);
      if (foundReceipt) {
        setReceipt(foundReceipt);
        console.log('ViewReceiptPage: Loaded receipt data:', foundReceipt);
      } else {
        console.warn(`ViewReceiptPage: Receipt with ID ${id} not found. Redirecting to list.`);
        router.push('/receipts'); // Redirect if receipt not found
      }
    } else {
      // If ID is missing or not a string, redirect immediately
      console.warn('ViewReceiptPage: No valid ID provided. Redirecting to list.');
      router.push('/receipts');
    }
    setLoading(false);
  }, [id, router]); // Depend on id and router

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center text-lg font-semibold">
        Loading receipt details...
      </div>
    );
  }

  // If after loading, no receipt was found, the redirect should have already happened.
  if (!receipt) {
    return null; // Don't render anything if receipt is not found
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Receipt Details</h1>

      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-rs-dark-navy">Receipt #{receipt.receiptNumber}</CardTitle>
          <CardDescription>Vendor: {receipt.vendorName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Receipt Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Vendor Name</Label>
              <p className="text-lg font-medium">{receipt.vendorName}</p>
            </div>
            {receipt.vendorEmail && (
              <div>
                <Label className="text-gray-600">Vendor Email</Label>
                <p className="text-lg font-medium">{receipt.vendorEmail}</p>
              </div>
            )}
            <div>
              <Label className="text-gray-600">Receipt Number</Label>
              <p className="text-lg font-medium">{receipt.receiptNumber}</p>
            </div>
            <div>
              <Label className="text-gray-600">Date</Label>
              <p className="text-lg font-medium">{receipt.date}</p>
            </div>
            <div>
              <Label className="text-gray-600">Payment Method</Label>
              <p className="text-lg font-medium capitalize">{receipt.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Receipt Items Table */}
          <h2 className="text-xl font-bold text-rs-dark-navy mb-3">Items Purchased</h2>
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
              {receipt.items.map((item, index) => (
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

          {/* Receipt Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Subtotal</Label>
              <p className="text-lg font-medium">${receipt.subTotal.toFixed(2)}</p>
            </div>
            {receipt.taxRate !== undefined && receipt.taxRate > 0 && (
              <div>
                <Label className="text-gray-600">Tax Rate</Label>
                <p className="text-lg font-medium">{(receipt.taxRate * 100).toFixed(2)}%</p>
              </div>
            )}
            <div>
              <Label className="text-gray-600">Tax Amount</Label>
              <p className="text-lg font-medium">${receipt.taxAmount.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-gray-600">Total Amount</Label>
              <p className="text-xl font-bold text-rs-teal-green">${receipt.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {receipt.notes && (
            <div className="mt-6">
              <Label className="text-gray-600">Notes</Label>
              <p className="text-base text-gray-800 bg-gray-50 p-3 rounded-md border">{receipt.notes}</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <Label className="text-gray-600">Created At:</Label> {receipt.createdAt}
          </div>


          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => router.push('/receipts')}>
              Back to List
            </Button>
            <Button onClick={() => window.print()} className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
                Print Receipt
            </Button>
            {/* You can add a Print button here later if desired, similar to Invoice View */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}