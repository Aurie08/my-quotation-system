// src/types/invoice.ts

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // calculated per item
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail?: string; // Optional
  invoiceNumber: string; // e.g., INV-2025-001
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subTotal: number;
  taxRate?: number; // e.g., 0.15 for 15%
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string; // Optional
  createdAt: string; // YYYY-MM-DD for tracking when it was created
}