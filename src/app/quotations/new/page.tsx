// src/app/quotations/new/page.tsx
'use client'; // This page needs client-side interactivity

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import your Quotation type
import { Quotation } from '@/types/quotation';
import { addQuotationToLocalStorage } from '@/lib/quotation-storage';

// --- TEMPORARY IN-MEMORY STORAGE ---
// In a real application, this would be an API call to a backend/database.
// We'll simulate it for now.
declare global {
  var quotations: Quotation[];
}
if (!global.quotations) {
  global.quotations = [];
}
const addQuotationToMemory = (quotation: Quotation) => {
  global.quotations.push(quotation);
  console.log('Current Quotations in Memory:', global.quotations);
};
// --- END TEMPORARY STORAGE ---


// Define the form schema using Zod for validation
const formSchema = z.object({
  customerName: z.string().min(2, {
    message: 'Customer name must be at least 2 characters.',
  }),
  itemDescription: z.string().min(5, {
    message: 'Item description must be at least 5 characters.',
  }),
  quantity: z.coerce.number().min(1, {
    message: 'Quantity must be at least 1.',
  }),
  unitPrice: z.coerce.number().min(0.01, {
    message: 'Unit price must be greater than 0.',
  }),
  status: z.enum(['pending', 'approved', 'rejected'], {
    message: 'Please select a valid status.',
  }),
});

export default function NewQuotationPage() {
  const router = useRouter();

  // Initialize the form with zodResolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      itemDescription: '',
      quantity: 1,
      unitPrice: 0.01,
      status: 'pending', // Default status
    },
  });

  // Watch quantity and unitPrice to calculate totalAmount
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unitPrice');
  const totalAmount = (quantity * unitPrice).toFixed(2); // Calculate and format

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Generate a unique ID for the quotation
    const newQuotation: Quotation = {
      id: uuidv4(),
      ...values,
      totalAmount: parseFloat(totalAmount), // Convert back to number
      date: new Date().toISOString().split('T')[0], // Current date 'YYYY-MM-DD'
    };

    console.log('Submitting new quotation:', newQuotation);

    // Simulate API call
    addQuotationToLocalStorage(newQuotation);
 router.refresh();


    // Redirect to the quotations list page
    router.push('/quotations');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Create New Quotation</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input value={totalAmount} readOnly className="font-bold bg-gray-50 cursor-not-allowed" />
              </FormControl>
            </FormItem>
          </div> {/* End grid */}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/quotations')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
              Submit Quotation
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}