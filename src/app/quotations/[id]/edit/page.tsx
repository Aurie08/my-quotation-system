// src/app/quotations/[id]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react'; // Add useState for loading state
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

// Import the localStorage utility functions
// Make sure this path is correct: src/lib/quotation-storage.ts
import {
  getQuotationByIdFromLocalStorage,
  updateQuotationInLocalStorage,
} from '@/lib/quotation-storage';

// Define the form schema using Zod for validation
// Using z.preprocess to handle number conversions from string inputs
const formSchema = z.object({
  customerName: z.string().min(2, {
    message: 'Customer name must be at least 2 characters.',
  }),
  itemDescription: z.string().min(5, {
    message: 'Item description must be at least 5 characters.',
  }),
  quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)), // Handle empty string to undefined then number
    z.number().min(1, { message: 'Quantity must be at least 1.' })
  ),
  unitPrice: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)), // Handle empty string to undefined then number
    z.number().min(0.01, { message: 'Unit price must be greater than 0.' })
  ),
  status: z.enum(['pending', 'approved', 'rejected'], {
    message: 'Please select a valid status.',
  }),
});

export default function EditQuotationPage() {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the route parameters
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [initialQuotation, setInitialQuotation] = useState<Quotation | null>(null); // Store the fetched quotation

  // Initialize the form with zodResolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      itemDescription: '',
      quantity: 1, // Default for number input
      unitPrice: 0.01, // Default for number input
      status: 'pending',
    },
  });

  // Load existing quotation data when the component mounts
  useEffect(() => {
    // Only attempt to fetch if id is a string (means it's available from useParams)
    if (typeof id === 'string') {
      const foundQuotation = getQuotationByIdFromLocalStorage(id);
      if (foundQuotation) {
        setInitialQuotation(foundQuotation); // Store for totalAmount calculation
        form.reset({
          customerName: foundQuotation.customerName,
          itemDescription: foundQuotation.itemDescription,
          quantity: foundQuotation.quantity,
          unitPrice: foundQuotation.unitPrice,
          status: foundQuotation.status,
        });
        console.log('EditQuotationPage: Loaded quotation data:', foundQuotation);
      } else {
        // If quotation not found, redirect to the list page
        console.warn(`EditQuotationPage: Quotation with ID ${id} not found. Redirecting.`);
        router.push('/quotations');
      }
    } else {
      console.log('EditQuotationPage: ID is not a string (initial render or missing). ID:', id);
      // Optional: You might want to redirect immediately if ID is unexpectedly missing
      // router.push('/quotations');
    }
    setLoading(false); // Set loading to false once data attempt is complete
  }, [id, form, router]); // Depend on id, form instance, and router

  // Watch quantity and unitPrice to calculate totalAmount dynamically
  // Use a stable value for the watch to avoid re-renders if not truly changed
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unitPrice');

  // Calculate totalAmount based on watched values, with a fallback for initial render
  const calculatedTotalAmount = (Number(quantity || 0) * Number(unitPrice || 0));

  // If loading, display a loading message
  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center text-lg font-semibold">
        Loading quotation for editing...
      </div>
    );
  }

  // If after loading, no initial quotation was found, don't render the form
  // The useEffect handles redirection, but this prevents flickering of an empty form
  if (!initialQuotation && !loading) {
    return null; // The redirect will handle this.
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Re-calculate totalAmount based on final form values to ensure accuracy
    const finalTotalAmount = (values.quantity * values.unitPrice);

    const updatedQuotation: Quotation = {
      id: typeof id === 'string' ? id : '', // Use the existing ID, ensure it's a string
      ...values,
      totalAmount: parseFloat(finalTotalAmount.toFixed(2)), // Ensure 2 decimal places and convert to number
      date: initialQuotation?.date || new Date().toISOString().split('T')[0], // Keep original date or use current
    };

    console.log('Attempting to update quotation:', updatedQuotation);
    updateQuotationInLocalStorage(updatedQuotation);

    router.refresh(); // Invalidate cache for the list page if it were a server component
    router.push('/quotations'); // Redirect back to the list
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Edit Quotation</h1>

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
                    {/* field.value should be number, but Input expects string. Convert here. */}
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''} // Ensure input is controlled, handle undefined
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    />
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
                    {/* field.value should be number, but Input expects string. Convert here. */}
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''} // Ensure input is controlled, handle undefined
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    />
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
                <Input value={calculatedTotalAmount.toFixed(2)} readOnly className="font-bold bg-gray-50 cursor-not-allowed" />
              </FormControl>
            </FormItem>
          </div> {/* End grid */}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/quotations')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}