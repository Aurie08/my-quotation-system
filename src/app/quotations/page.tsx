// src/app/quotations/page.tsx
'use client'; // This page needs client-side interactivity to display dynamic data

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Quotation } from '@/types/quotation';

// Import Shadcn/ui Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// --- TEMPORARY IN-MEMORY STORAGE (re-declared for client-side access) ---
// In a real application, this would be an API call to a backend/database.
// Ensure this matches the declaration in new/page.tsx
declare global {
  var quotations: Quotation[];
}
if (!global.quotations) {
  global.quotations = [];
}
const getQuotationsFromMemory = (): Quotation[] => {
  return global.quotations;
};
// --- END TEMPORARY STORAGE ---


export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Fetch quotations from memory when the component mounts or updates
  useEffect(() => {
    const fetchedQuotations = getQuotationsFromMemory();
    setQuotations(fetchedQuotations);
    console.log('QuotationsPage: Data fetched from memory:', fetchedQuotations); // Diagnostic log
  }, []); // Empty dependency array means this runs once on mount, and on re-mount by router.refresh()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rs-dark-navy">Quotations</h1>
        <Link href="/quotations/new">
          <Button className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
            Create New Quotation
          </Button>
        </Link>
      </div>

      {quotations.length === 0 ? (
        <p className="text-lg text-gray-700 text-center py-10">
          No quotations found. Click "Create New Quotation" to add one!
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                {/* Add more heads for actions like Edit/Delete later */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{quotation.id.substring(0, 8)}...</TableCell>
                  <TableCell>{quotation.customerName}</TableCell>
                  <TableCell>{quotation.itemDescription}</TableCell>
                  <TableCell className="text-right">{quotation.quantity}</TableCell>
                  <TableCell className="text-right">${quotation.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold">${quotation.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{quotation.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${quotation.status === 'approved' ? 'bg-green-100 text-green-800' :
                       quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                       'bg-yellow-100 text-yellow-800'}`}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </span>
                  </TableCell>
                  {/* Add more cells for actions later */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}