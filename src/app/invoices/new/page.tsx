// src/app/invoices/new/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form'; // Import useFieldArray
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
import { Textarea } from '@/components/ui/textarea'; // Assuming you have this
import { Separator } from '@/components/ui/separator'; // Assuming you have this, for visual separation
import { Label } from '@/components/ui/label';
// Import your Invoice types and storage functions
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { addInvoiceToLocalStorage } from '@/lib/invoice-storage';

// --- Zod Schema for Invoice Items ---
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required.'),
  quantity: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(1, 'Quantity must be at least 1.')
  ),
  unitPrice: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0.01, 'Unit price must be greater than 0.')
  ),
  // total will be calculated, not directly input, but included for type inference if needed
  // total: z.number().optional(),
});

// --- Zod Schema for the main Invoice Form ---
const formSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required.'),
  customerEmail: z.string().email('Invalid email address.').optional().or(z.literal('')), // Make optional and handle empty string
  invoiceNumber: z.string().min(3, 'Invoice number is required.'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Issue Date must be YYYY-MM-DD.'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due Date must be YYYY-MM-DD.'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  taxRate: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Tax rate cannot be negative.').max(1, 'Tax rate cannot exceed 100% (e.g., 0.15 for 15%).').optional()
  ),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled'], {
    message: 'Please select a valid status.',
  }),
  notes: z.string().optional(),
});

export default function NewInvoicePage() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Auto-generate simple invoice number
      issueDate: new Date().toISOString().split('T')[0], // Current date YYYY-MM-DD
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      items: [{ description: '', quantity: 1, unitPrice: 0.01 }], // Start with one empty item
      taxRate: 0.0, // Default 0% tax
      status: 'draft',
      notes: '',
    },
  });

  // --- useFieldArray for dynamic invoice items ---
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // --- Dynamic Total Calculation ---
  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('taxRate');

  const subTotal = watchedItems.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return acc + (quantity * unitPrice);
  }, 0);

  const taxAmount = watchedTaxRate ? (subTotal * watchedTaxRate) : 0;
  const totalAmount = subTotal + taxAmount;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Before saving, ensure each item also has its own calculated total
    const itemsWithTotals = values.items.map(item => ({
      ...item,
      total: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
    }));

    const newInvoice: Omit<Invoice, 'id' | 'totalAmount' | 'taxAmount' | 'subTotal' | 'createdAt'> = {
      ...values,
      items: itemsWithTotals,
      // subTotal, taxAmount, totalAmount will be calculated again in addInvoiceToLocalStorage
      // but we pass `items` which is all it needs to re-calculate
    };

    console.log('Attempting to create new invoice:', newInvoice);
    addInvoiceToLocalStorage(newInvoice);

    router.refresh(); // Refresh the list page data
    router.push('/invoices'); // Redirect to the invoices list page
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Create New Invoice</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
          {/* Invoice Details Section */}
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
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter customer email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., INV-2025-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                        <SelectValue placeholder="Select invoice status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-8" />

          {/* Invoice Items Section */}
          <h2 className="text-2xl font-bold text-rs-dark-navy mb-4">Invoice Items</h2>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md relative">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Item description" {...itemField} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...itemField}
                        value={itemField.value ?? ''}
                        onChange={(e) => itemField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field: itemField }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...itemField}
                        value={itemField.value ?? ''}
                        onChange={(e) => itemField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mt-6 md:mt-0"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0.01 })}
            className="mt-4"
          >
            Add Item
          </Button>

          <Separator className="my-8" />

          {/* Totals and Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (e.g., 0.08 for 8%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Display calculated totals */}
            <div>
              <Label className="text-gray-600">Subtotal</Label>
              <Input value={`$${subTotal.toFixed(2)}`} readOnly className="font-bold bg-gray-50 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-gray-600">Tax Amount</Label>
              <Input value={`$${taxAmount.toFixed(2)}`} readOnly className="font-bold bg-gray-50 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-gray-600">Total Amount</Label>
              <Input value={`$${totalAmount.toFixed(2)}`} readOnly className="text-lg font-bold bg-gray-50 cursor-not-allowed" />
            </div>
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional notes for the invoice..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.push('/invoices')}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
              Create Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}