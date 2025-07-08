// src/types/quotation.ts

export interface Quotation {
  id: string; // Unique identifier for the quotation
  customerName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number; // This will be calculated
  date: string; // Date of the quotation, e.g., 'YYYY-MM-DD'
  status: 'pending' | 'approved' | 'rejected'; // Status of the quotation
}