// src/types/receipt.ts

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mobile_money' | 'other';

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // calculated per item
}

export interface Receipt {
  id: string;
  vendorName: string;
  vendorEmail?: string; // Optional
  receiptNumber: string; // e.g., REC-2025-001
  date: string; // YYYY-MM-DD
  items: ReceiptItem[];
  subTotal: number;
  taxRate?: number; // e.g., 0.15 for 15%
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string; // Optional
  createdAt: string; // YYYY-MM-DD for tracking when it was created
}