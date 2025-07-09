// src/app/invoices/[id]/edit/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// Import your Invoice types and storage functions
import { Invoice, InvoiceItem, InvoiceStatus } from '@/types/invoice';
import { getInvoiceByIdFromLocalStorage, updateInvoiceInLocalStorage } from '@/lib/invoice-storage';

// --- Zod Schema for Invoice Items (same as new page) ---
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
});

// --- Zod Schema for the main Invoice Form (similar to new page, but no 'id' here) ---
const formSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required.'),
  customerEmail: z.string().email('Invalid email address.').optional().or(z.literal('')),
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

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = useParams(); // Get the ID from the route parameters
  const [loading, setLoading] = useState(true);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null); // To store the original invoice (especially for createdAt)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      invoiceNumber: '',
      issueDate: '',
      dueDate: '',
      items: [], // Will be populated by useEffect
      taxRate: 0.0,
      status: 'draft',
      notes: '',
    },
  });

  // --- useFieldArray for dynamic invoice items ---
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // --- Load existing invoice data when the component mounts ---
  useEffect(() => {
    if (typeof id === 'string') {
      const foundInvoice = getInvoiceByIdFromLocalStorage(id);
      if (foundInvoice) {
        setInitialInvoice(foundInvoice); // Store original invoice to preserve `createdAt` and `id`
        form.reset({
          customerName: foundInvoice.customerName,
          customerEmail: foundInvoice.customerEmail,
          invoiceNumber: foundInvoice.invoiceNumber,
          issueDate: foundInvoice.issueDate,
          dueDate: foundInvoice.dueDate,
          // Map items to match the form schema's expected structure if needed,
          // though InvoiceItem and form schema item are identical here.
          items: foundInvoice.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            // total property is not part of form input, will be recalculated
          })),
          taxRate: foundInvoice.taxRate,
          status: foundInvoice.status,
          notes: foundInvoice.notes,
        });
        console.log('EditInvoicePage: Loaded invoice data:', foundInvoice);
      } else {
        console.warn(`EditInvoicePage: Invoice with ID ${id} not found. Redirecting.`);
        router.push('/invoices'); // Redirect if invoice not found
      }
    } else {
      console.warn('EditInvoicePage: No valid ID provided in params. Redirecting.');
      router.push('/invoices'); // Redirect if ID is missing
    }
    setLoading(false);
  }, [id, form, router]); // Depend on id, form instance, and router

  // --- Dynamic Total Calculation (same as new page) ---
  const watchedItems = form.watch('items');
  const watchedTaxRate = form.watch('taxRate');

  const subTotal = watchedItems.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return acc + (quantity * unitPrice);
  }, 0);

  const taxAmount = watchedTaxRate ? (subTotal * watchedTaxRate) : 0;
  const totalAmount = subTotal + taxAmount;

  // If loading, display a loading message
  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center text-lg font-semibold">
        Loading invoice for editing...
      </div>
    );
  }

  // If after loading, no initial invoice was found, don't render the form
  if (!initialInvoice && !loading) {
    return null; // The redirect will handle this.
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!initialInvoice || typeof id !== 'string') {
      console.error("Cannot update: Initial invoice or ID is missing.");
      return;
    }

    // Recalculate totals based on final form values
    const itemsWithTotals = values.items.map(item => ({
      ...item,
      total: parseFloat((item.quantity * item.unitPrice).toFixed(2)),
    }));

    // Create the updated invoice object, ensuring ID and createdAt are preserved
    const updatedInvoice: Invoice = {
      id: initialInvoice.id, // Use the existing ID
      ...values,
      items: itemsWithTotals,
      subTotal: parseFloat(subTotal.toFixed(2)), // Use the calculated subTotal
      taxAmount: parseFloat(taxAmount.toFixed(2)), // Use the calculated taxAmount
      totalAmount: parseFloat(totalAmount.toFixed(2)), // Use the calculated totalAmount
      createdAt: initialInvoice.createdAt, // Preserve original creation date
    };

    console.log('Attempting to update invoice:', updatedInvoice);
    updateInvoiceInLocalStorage(updatedInvoice); // Update in localStorage

    router.refresh(); // Refresh the list page data
    router.push('/invoices'); // Redirect back to the invoices list page
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Edit Invoice</h1>

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
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}