// src/app/quotations/[id]/edit/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

// --- TEMPORARY IN-MEMORY STORAGE ---
// Make sure this matches the declaration in other pages
declare global {
  var quotations: Quotation[];
}
if (!global.quotations) {
  global.quotations = [];
}
const getQuotationByIdFromMemory = (id: string): Quotation | undefined => {
  return global.quotations.find(q => q.id === id);
};
const updateQuotationInMemory = (updatedQuotation: Quotation) => {
  const index = global.quotations.findIndex(q => q.id === updatedQuotation.id);
  if (index !== -1) {
    global.quotations[index] = updatedQuotation;
  }
  console.log('Quotation updated. Current in-memory:', global.quotations);
};
// --- END TEMPORARY STORAGE ---

// Define the form schema using Zod for validation (same as new/page.tsx)
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

interface EditQuotationPageProps {
  params: {
    id: string; // The ID will come from the dynamic route segment
  };
}

export default function EditQuotationPage({ params }: EditQuotationPageProps) {
  const router = useRouter();
  const quotationId = params.id;

  // Initialize the form with zodResolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      itemDescription: '',
      quantity: 1,
      unitPrice: 0.01,
      status: 'pending',
    },
  });

  // Load existing quotation data when the component mounts
  useEffect(() => {
    const existingQuotation = getQuotationByIdFromMemory(quotationId);
    if (existingQuotation) {
      form.reset({
        customerName: existingQuotation.customerName,
        itemDescription: existingQuotation.itemDescription,
        quantity: existingQuotation.quantity,
        unitPrice: existingQuotation.unitPrice,
        status: existingQuotation.status,
      });
    } else {
      // If quotation not found (e.g., direct navigation or deleted), redirect
      router.push('/quotations');
    }
  }, [quotationId, form, router]); // Depend on id and form instance

  // Watch quantity and unitPrice to calculate totalAmount
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unitPrice');
  const totalAmount = (quantity * unitPrice).toFixed(2);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedQuotation: Quotation = {
      id: quotationId, // Use the existing ID
      ...values,
      totalAmount: parseFloat(totalAmount),
      date: new Date().toISOString().split('T')[0], // Keep current date or reuse original
    };

    console.log('Updating quotation:', updatedQuotation);
    updateQuotationInMemory(updatedQuotation);

    router.refresh(); // Invalidate cache for the list page
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
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value)} />
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
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}