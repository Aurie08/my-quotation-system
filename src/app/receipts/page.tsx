// src/app/receipts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid'; // For seeding

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Import your Receipt type and storage functions
import { Receipt, PaymentMethod, ReceiptItem } from '@/types/receipts';
import {
  getReceiptsFromLocalStorage,
  saveReceiptsToLocalStorage,
  deleteReceiptFromLocalStorage,
} from '@/lib/receipt-storage';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const router = useRouter();

  // --- Seed Data for Development (Runs once on client-side mount if no receipts exist) ---
  useEffect(() => {
    const existingReceipts = getReceiptsFromLocalStorage();
    if (existingReceipts.length === 0) {
      console.log("Seeding localStorage with initial receipt data for development.");
      const initialReceipts: Receipt[] = [
        {
          id: uuidv4(),
          vendorName: 'Office Depot',
          vendorEmail: 'sales@officedepot.com',
          receiptNumber: 'REC-2025-001',
          date: '2025-07-05',
          items: [
            { description: 'Printer Paper (Case)', quantity: 2, unitPrice: 35.00, total: 70.00 },
            { description: 'Black Ink Cartridge', quantity: 1, unitPrice: 45.00, total: 45.00 },
          ],
          subTotal: 115.00,
          taxRate: 0.05, // 5% tax
          taxAmount: 5.75,
          totalAmount: 120.75,
          paymentMethod: 'card',
          notes: 'For office supplies.',
          createdAt: '2025-07-05',
        },
        {
          id: uuidv4(),
          vendorName: 'Local Cafe',
          receiptNumber: 'REC-2025-002',
          date: '2025-07-03',
          items: [
            { description: 'Coffee (Large)', quantity: 3, unitPrice: 4.50, total: 13.50 },
            { description: 'Pastry', quantity: 2, unitPrice: 3.00, total: 6.00 },
          ],
          subTotal: 19.50,
          taxRate: 0.0, // No tax
          taxAmount: 0.00,
          totalAmount: 19.50,
          paymentMethod: 'cash',
          notes: 'Client meeting refreshments.',
          createdAt: '2025-07-03',
        },
      ];
      saveReceiptsToLocalStorage(initialReceipts);
      setReceipts(initialReceipts); // Update state immediately after seeding
    } else {
      setReceipts(existingReceipts); // Load existing if already present
    }
  }, []); // Empty dependency array means this runs once on mount

  // --- Fetch Receipts (when component mounts or needs refresh) ---
  const fetchReceipts = () => {
    setReceipts(getReceiptsFromLocalStorage());
  };

  useEffect(() => {
    fetchReceipts(); // Initial fetch
  }, []);

  // --- Handle Delete Receipt ---
  const handleDeleteReceipt = (id: string) => {
    if (deleteReceiptFromLocalStorage(id)) {
      console.log(`Receipt with ID ${id} deleted.`);
      fetchReceipts(); // Refresh the list
    } else {
      console.warn(`Receipt with ID ${id} not found for deletion.`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rs-dark-navy">Receipts</h1>
        <Button asChild className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
          <Link href="/receipts/new">Create New Receipt</Link>
        </Button>
      </div>

      {receipts.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No receipts found. Create a new one to get started!</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.vendorName}</TableCell>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell className="font-medium">${receipt.totalAmount.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{receipt.paymentMethod.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button asChild variant="outline" size="sm" className="mr-2">
                      <Link href={`/receipts/${receipt.id}/view`}>View</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="mr-2">
                      <Link href={`/receipts/${receipt.id}/edit`}>Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the receipt and remove its data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteReceipt(receipt.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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