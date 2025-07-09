// src/app/quotations/[id]/view/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Assuming you have a Label component or will create one

// Import your Quotation type
import { Quotation } from '@/types/quotation';

// Import the localStorage utility function to get a single quotation
import { getQuotationByIdFromLocalStorage } from '@/lib/quotation-storage';

export default function ViewQuotationPage() {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the route parameters
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure id is a string before attempting to fetch
    if (typeof id === 'string') {
      const foundQuotation = getQuotationByIdFromLocalStorage(id);
      if (foundQuotation) {
        setQuotation(foundQuotation);
        console.log('ViewQuotationPage: Loaded quotation data:', foundQuotation);
      } else {
        console.warn(`ViewQuotationPage: Quotation with ID ${id} not found. Redirecting to list.`);
        router.push('/quotations'); // Redirect if quotation not found
      }
    } else {
      // If ID is missing or not a string, redirect immediately
      console.warn('ViewQuotationPage: No valid ID provided. Redirecting to list.');
      router.push('/quotations');
    }
    setLoading(false);
  }, [id, router]); // Depend on id and router

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center text-lg font-semibold">
        Loading quotation details...
      </div>
    );
  }

  // If after loading, no quotation was found, the redirect should have already happened.
  // This is a fallback to prevent rendering if for some reason redirect hasn't kicked in.
  if (!quotation) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Quotation Details</h1>

      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-rs-dark-navy">{quotation.customerName}</CardTitle>
          <CardDescription>ID: {quotation.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Item Description</Label>
              <p className="text-lg font-medium">{quotation.itemDescription}</p>
            </div>
            <div>
              <Label className="text-gray-600">Quantity</Label>
              <p className="text-lg font-medium">{quotation.quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Unit Price</Label>
              <p className="text-lg font-medium">${quotation.unitPrice.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-gray-600">Total Amount</Label>
              <p className="text-lg font-bold text-rs-teal-green">${quotation.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">Date</Label>
              <p className="text-lg font-medium">{quotation.date}</p>
            </div>
            <div>
              <Label className="text-gray-600">Status</Label>
              <p className={`text-lg font-medium capitalize
                ${quotation.status === 'pending' ? 'text-yellow-700' : ''}
                ${quotation.status === 'approved' ? 'text-green-700' : ''}
                ${quotation.status === 'rejected' ? 'text-red-700' : ''}
              `}>
                {quotation.status}
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => router.push('/quotations')}>
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}