// src/app/quotations/page.tsx
'use client'; // This page needs client-side interactivity to display dynamic data

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

// Import your Quotation type
import { Quotation } from '@/types/quotation';

// Import the localStorage utility functions and uuid for seeding
import {
  getQuotationsFromLocalStorage,
  deleteQuotationFromLocalStorage,
  saveQuotationsToLocalStorage, // <--- Add this import
} from '@/lib/quotation-storage';
import { v4 as uuidv4 } from 'uuid'; // <--- Add this import for seeding

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch quotations (now from localStorage)
  const fetchQuotations = () => {
    console.log('QuotationsPage: Attempting to fetch data from localStorage...');
    const storedQuotations = getQuotationsFromLocalStorage();
    setQuotations(storedQuotations);
    setLoading(false);
    console.log('QuotationsPage: Data fetched from localStorage:', storedQuotations);
  };

  useEffect(() => {
    // --- NEW Seeding Logic (moved from quotation-storage.ts) ---
    // Only run this once on mount to seed data if localStorage is empty
    if (typeof window !== 'undefined' && getQuotationsFromLocalStorage().length === 0) {
      console.log("Seeding localStorage with initial quotation data for development from QuotationsPage.");
      const initialQuotations: Quotation[] = [
        {
          id: uuidv4(),
          customerName: 'Acme Corp',
          itemDescription: 'Consulting Services',
          quantity: 1,
          unitPrice: 1500.00,
          totalAmount: 1500.00,
          status: 'approved',
          date: '2025-06-15',
        },
        {
          id: uuidv4(),
          customerName: 'Globex Inc.',
          itemDescription: 'Software License',
          quantity: 5,
          unitPrice: 200.00,
          totalAmount: 1000.00,
          status: 'pending',
          date: '2025-06-20',
        },
        {
          id: uuidv4(),
          customerName: 'Umbrella Corp',
          itemDescription: 'Hardware Installation',
          quantity: 2,
          unitPrice: 750.00,
          totalAmount: 1500.00,
          status: 'rejected',
          date: '2025-06-25',
        },
      ];
      saveQuotationsToLocalStorage(initialQuotations);
    }
    // --- End Seeding Logic ---

    fetchQuotations(); // Always fetch data when component mounts or after seeding
  }, []); // Empty dependency array means this runs once on mount

  // Handler for Edit button click
  const handleEdit = (id: string) => {
    console.log('Edit button clicked for quotation ID:', id);
    router.push(`/quotations/${id}/edit`);
  };

  // Handler for Delete button click
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const isDeleted = deleteQuotationFromLocalStorage(id);
      if (isDeleted) {
        console.log(`Quotation with ID ${id} deleted.`);
        fetchQuotations(); // Re-fetch data to update the list
      } else {
        console.warn(`Quotation with ID ${id} not found for deletion.`);
      }
    }
  };

  // Handler for View button click
  const handleView = (id: string) => {
    console.log('View button clicked for quotation ID:', id);
    router.push(`/quotations/${id}/view`);
  };


  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading quotations...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rs-dark-navy">Quotations</h1>
        <Button onClick={() => router.push('/quotations/new')} className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
          Create New Quotation
        </Button>
      </div>

      {quotations.length === 0 ? (
        <p className="text-center text-gray-500">No quotations found. Click "Create New Quotation" to add one.</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Item Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    {quotation.id ? `${quotation.id.substring(0, 8)}...` : 'N/A'}
                  </TableCell>
                  <TableCell>{quotation.customerName}</TableCell>
                  <TableCell>{quotation.itemDescription}</TableCell>
                  <TableCell>{quotation.quantity}</TableCell>
                  {/* Defensive coding for unitPrice and totalAmount */}
                  <TableCell className="text-right">${(quotation.unitPrice || 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(quotation.totalAmount || 0).toFixed(2)}</TableCell>
                  <TableCell>{quotation.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${quotation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${quotation.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${quotation.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(quotation.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quotation.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quotation.id)}
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