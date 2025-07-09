// src/app/receipts/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Import your Receipt type and storage functions
import { ReceiptItem, PaymentMethod } from '@/types/receipts';
import { addReceiptToLocalStorage } from '@/lib/receipt-storage';

export default function CreateNewReceiptPage() {
  const router = useRouter();

  // Form state - Initialize with default or empty values
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
  const [items, setItems] = useState<ReceiptItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(0); // *** Changed to number type for better handling ***
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');

  // Derived state for calculated totals
  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // --- Calculate Totals whenever items or taxRate change ---
  useEffect(() => {
    let currentSubTotal = 0;
    items.forEach(item => {
      currentSubTotal += item.quantity * item.unitPrice;
    });
    setSubTotal(parseFloat(currentSubTotal.toFixed(2)));

    // Use taxRate directly as it's now a number
    const currentTaxAmount = currentSubTotal * taxRate;
    setTaxAmount(parseFloat(currentTaxAmount.toFixed(2)));

    setTotalAmount(parseFloat((currentSubTotal + currentTaxAmount).toFixed(2)));
  }, [items, taxRate]);

  // --- Handle Item Changes ---
  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      // Ensure quantity is a non-negative integer
      item.quantity = Math.max(0, parseInt(value as string) || 0);
    } else if (field === 'unitPrice') {
      // Ensure unitPrice is a non-negative number
      item.unitPrice = parseFloat(value as string) || 0;
    }
    // Recalculate item total directly
    item.total = parseFloat((item.quantity * item.unitPrice).toFixed(2));

    setItems(newItems);
  };

  // --- Add/Remove Items ---
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // --- Handle Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReceipt = addReceiptToLocalStorage({
      vendorName,
      vendorEmail: vendorEmail || undefined, // Store as undefined if empty
      receiptNumber,
      date,
      items,
      taxRate: taxRate, // Use taxRate directly
      paymentMethod,
      notes: notes || undefined, // Store as undefined if empty
    });

    console.log('New Receipt created:', newReceipt);
    router.push('/receipts'); // Redirect to receipts list after creation
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-rs-dark-navy mb-6">Create New Receipt</h1>

      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-rs-dark-navy">New Receipt Details</CardTitle>
          <CardDescription>Enter the information for the new receipt.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="vendorEmail">Vendor Email (Optional)</Label>
                <Input
                  id="vendorEmail"
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Items */}
            <h2 className="text-xl font-bold text-rs-dark-navy mb-3">Items Purchased</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end border p-3 rounded-md bg-gray-50">
                  <div className="md:col-span-3">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Qty</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                    <Input
                      id={`unitPrice-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-6 md:mt-0"
                    >
                      -
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={handleAddItem}>
              Add Item
            </Button>

            <Separator className="my-6" />

            {/* Totals and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={taxRate * 100} // Display as percentage
                  onChange={(e) => {
                    const val = e.target.value;
                    // Convert input value to number, default to 0 if empty or invalid
                    setTaxRate(val === '' ? 0 : parseFloat(val) / 100 || 0);
                  }}
                  min="0"
                />
              </div>
              <div>
                <Label>Subtotal</Label>
                <Input value={`$${subTotal.toFixed(2)}`} readOnly />
              </div>
              <div>
                <Label>Tax Amount</Label>
                <Input value={`$${taxAmount.toFixed(2)}`} readOnly />
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input value={`$${totalAmount.toFixed(2)}`} readOnly className="font-bold text-lg" />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => router.push('/receipts')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
                Create Receipt
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}