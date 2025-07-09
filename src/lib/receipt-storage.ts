// src/lib/receipt-storage.ts
import { Receipt } from '@/types/receipts';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid

const RECEIPTS_STORAGE_KEY = 'receipts';

// --- Utility Functions for Local Storage ---

// Function to get all receipts from localStorage
export const getReceiptsFromLocalStorage = (): Receipt[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedReceipts = localStorage.getItem(RECEIPTS_STORAGE_KEY);
  return storedReceipts ? JSON.parse(storedReceipts) : [];
};

// Function to save all receipts to localStorage
export const saveReceiptsToLocalStorage = (receipts: Receipt[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  }
};

// Function to calculate receipt totals
const calculateReceiptTotals = (receiptData: Omit<Receipt, 'id' | 'totalAmount' | 'taxAmount' | 'subTotal' | 'createdAt'>):
  { subTotal: number; taxAmount: number; totalAmount: number } => {
  let subTotal = 0;
  receiptData.items.forEach(item => {
    subTotal += item.quantity * item.unitPrice;
  });

  const taxAmount = receiptData.taxRate ? subTotal * receiptData.taxRate : 0;
  const totalAmount = subTotal + taxAmount;

  return {
    subTotal: parseFloat(subTotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

// Function to add a new receipt
export const addReceiptToLocalStorage = (
  newReceiptData: Omit<Receipt, 'id' | 'totalAmount' | 'taxAmount' | 'subTotal' | 'createdAt'>
): Receipt => {
  const existingReceipts = getReceiptsFromLocalStorage();
  const createdAt = new Date().toISOString().split('T')[0]; // Current date 'YYYY-MM-DD'

  const { subTotal, taxAmount, totalAmount } = calculateReceiptTotals(newReceiptData);

  const newReceipt: Receipt = {
    id: uuidv4(), // Generate unique ID
    ...newReceiptData,
    subTotal: subTotal,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    createdAt: createdAt,
  };

  existingReceipts.push(newReceipt);
  saveReceiptsToLocalStorage(existingReceipts);
  return newReceipt;
};

// Function to get a single receipt by ID
export const getReceiptByIdFromLocalStorage = (id: string): Receipt | undefined => {
  const receipts = getReceiptsFromLocalStorage();
  return receipts.find(rec => rec.id === id);
};

// Function to update an existing receipt
export const updateReceiptInLocalStorage = (updatedReceiptData: Receipt): Receipt | undefined => {
  const existingReceipts = getReceiptsFromLocalStorage();
  const index = existingReceipts.findIndex(rec => rec.id === updatedReceiptData.id);

  if (index !== -1) {
    // Recalculate totals to ensure consistency if items/prices/taxRate changed
    const { subTotal, taxAmount, totalAmount } = calculateReceiptTotals(updatedReceiptData);

    const updatedReceipt: Receipt = {
      ...updatedReceiptData,
      subTotal: subTotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
    };

    existingReceipts[index] = updatedReceipt;
    saveReceiptsToLocalStorage(existingReceipts);
    return updatedReceipt;
  }
  return undefined; // Receipt not found
};

// Function to delete a receipt by ID
export const deleteReceiptFromLocalStorage = (id: string): boolean => {
  const existingReceipts = getReceiptsFromLocalStorage();
  const initialLength = existingReceipts.length;
  const filteredReceipts = existingReceipts.filter(rec => rec.id !== id);

  if (filteredReceipts.length < initialLength) {
    saveReceiptsToLocalStorage(filteredReceipts);
    return true; // Deleted successfully
  }
  return false; // Receipt not found
};

