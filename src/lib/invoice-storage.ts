// src/lib/invoice-storage.ts
import { Invoice } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid

const INVOICES_STORAGE_KEY = 'invoices';

// --- Utility Functions for Local Storage ---

// Function to get all invoices from localStorage
export const getInvoicesFromLocalStorage = (): Invoice[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
  return storedInvoices ? JSON.parse(storedInvoices) : [];
};

// Function to save all invoices to localStorage
export const saveInvoicesToLocalStorage = (invoices: Invoice[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  }
};

// Function to calculate invoice totals
const calculateInvoiceTotals = (invoiceData: Omit<Invoice, 'id' | 'totalAmount' | 'taxAmount' | 'subTotal' | 'createdAt'>):
  { subTotal: number; taxAmount: number; totalAmount: number } => {
  let subTotal = 0;
  invoiceData.items.forEach(item => {
    subTotal += item.quantity * item.unitPrice;
  });

  const taxAmount = invoiceData.taxRate ? subTotal * invoiceData.taxRate : 0;
  const totalAmount = subTotal + taxAmount;

  return {
    subTotal: parseFloat(subTotal.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
};

// Function to add a new invoice
export const addInvoiceToLocalStorage = (
  newInvoiceData: Omit<Invoice, 'id' | 'totalAmount' | 'taxAmount' | 'subTotal' | 'createdAt'>
): Invoice => {
  const existingInvoices = getInvoicesFromLocalStorage();
  const createdAt = new Date().toISOString().split('T')[0]; // Current date 'YYYY-MM-DD'

  const { subTotal, taxAmount, totalAmount } = calculateInvoiceTotals(newInvoiceData);

  const newInvoice: Invoice = {
    id: uuidv4(), // Generate unique ID
    ...newInvoiceData,
    subTotal: subTotal,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    createdAt: createdAt,
  };

  existingInvoices.push(newInvoice);
  saveInvoicesToLocalStorage(existingInvoices);
  return newInvoice;
};

// Function to get a single invoice by ID
export const getInvoiceByIdFromLocalStorage = (id: string): Invoice | undefined => {
  const invoices = getInvoicesFromLocalStorage();
  return invoices.find(inv => inv.id === id);
};

// Function to update an existing invoice
export const updateInvoiceInLocalStorage = (updatedInvoiceData: Invoice): Invoice | undefined => {
  const existingInvoices = getInvoicesFromLocalStorage();
  const index = existingInvoices.findIndex(inv => inv.id === updatedInvoiceData.id);

  if (index !== -1) {
    // Recalculate totals to ensure consistency if items/prices/taxRate changed
    const { subTotal, taxAmount, totalAmount } = calculateInvoiceTotals(updatedInvoiceData);

    const updatedInvoice: Invoice = {
      ...updatedInvoiceData,
      subTotal: subTotal,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      // createdAt should typically remain the same, but if you want to update it on every edit:
      // createdAt: new Date().toISOString().split('T')[0],
    };

    existingInvoices[index] = updatedInvoice;
    saveInvoicesToLocalStorage(existingInvoices);
    return updatedInvoice;
  }
  return undefined; // Invoice not found
};

// Function to delete an invoice by ID
export const deleteInvoiceFromLocalStorage = (id: string): boolean => {
  const existingInvoices = getInvoicesFromLocalStorage();
  const initialLength = existingInvoices.length;
  const filteredInvoices = existingInvoices.filter(inv => inv.id !== id);

  if (filteredInvoices.length < initialLength) {
    saveInvoicesToLocalStorage(filteredInvoices);
    return true; // Deleted successfully
  }
  return false; // Invoice not found
};

// --- Seed Data for Development (Optional - will be moved to page.tsx later) ---
// This block will be commented out or removed after we set up the page.tsx useEffect
// It's here for now to ensure the structure is correct.
/*
if (getInvoicesFromLocalStorage().length === 0 && typeof window !== 'undefined') {
  console.log("Seeding localStorage with initial invoice data for development.");
  const initialInvoices: Invoice[] = [
    {
      id: uuidv4(),
      customerName: 'MegaCorp Solutions',
      customerEmail: 'contact@megacorp.com',
      invoiceNumber: 'INV-2025-001',
      issueDate: '2025-07-01',
      dueDate: '2025-07-31',
      items: [
        { description: 'Web Development Phase 1', quantity: 1, unitPrice: 2500.00, total: 2500.00 },
        { description: 'Hosting Fee (July)', quantity: 1, unitPrice: 50.00, total: 50.00 },
      ],
      subTotal: 2550.00,
      taxRate: 0.08, // 8% tax
      taxAmount: 204.00,
      totalAmount: 2754.00,
      status: 'sent',
      notes: 'Initial project setup and design.',
      createdAt: '2025-07-01',
    },
    {
      id: uuidv4(),
      customerName: 'Tech Innovations Ltd.',
      customerEmail: 'info@techinnovations.com',
      invoiceNumber: 'INV-2025-002',
      issueDate: '2025-06-20',
      dueDate: '2025-07-20',
      items: [
        { description: 'Software License Renewal (Annual)', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
      ],
      subTotal: 1200.00,
      taxRate: 0.08,
      taxAmount: 96.00,
      totalAmount: 1296.00,
      status: 'paid',
      notes: 'Thank you for your prompt payment!',
      createdAt: '2025-06-15',
    },
  ];
  saveInvoicesToLocalStorage(initialInvoices);
}
*/