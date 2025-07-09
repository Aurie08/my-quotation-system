// src/lib/quotation-storage.ts
import { Quotation } from '@/types/quotation';
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid

const QUOTATIONS_STORAGE_KEY = 'quotations';

// --- Utility Functions for Local Storage ---

// Function to get all quotations from localStorage
export const getQuotationsFromLocalStorage = (): Quotation[] => {
  if (typeof window === 'undefined') {
    // Return empty array if not in browser environment
    return [];
  }
  const storedQuotations = localStorage.getItem(QUOTATIONS_STORAGE_KEY);
  return storedQuotations ? JSON.parse(storedQuotations) : [];
};

// Function to save all quotations to localStorage
export const saveQuotationsToLocalStorage = (quotations: Quotation[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(QUOTATIONS_STORAGE_KEY, JSON.stringify(quotations));
  }
};

// Function to add a new quotation
export const addQuotationToLocalStorage = (newQuotationData: Omit<Quotation, 'id' | 'totalAmount' | 'date'>): Quotation => {
  const existingQuotations = getQuotationsFromLocalStorage();
  
  // Calculate totalAmount and set date
  const totalAmount = (newQuotationData.quantity * newQuotationData.unitPrice);
  const date = new Date().toISOString().split('T')[0]; // Current date 'YYYY-MM-DD'

  const newQuotation: Quotation = {
    id: uuidv4(), // Generate unique ID
    ...newQuotationData,
    totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure 2 decimal places and convert to number
    date: date,
  };

  existingQuotations.push(newQuotation);
  saveQuotationsToLocalStorage(existingQuotations);
  return newQuotation;
};

// Function to get a single quotation by ID
export const getQuotationByIdFromLocalStorage = (id: string): Quotation | undefined => {
  const quotations = getQuotationsFromLocalStorage();
  return quotations.find(q => q.id === id);
};

// Function to update an existing quotation
export const updateQuotationInLocalStorage = (updatedQuotation: Quotation): Quotation | undefined => {
  const existingQuotations = getQuotationsFromLocalStorage();
  const index = existingQuotations.findIndex(q => q.id === updatedQuotation.id);

  if (index !== -1) {
    // Ensure totalAmount and date are correctly set/updated here as well if needed,
    // though the form usually calculates totalAmount.
    // For simplicity, we'll assume updatedQuotation has the correct totalAmount and date.
    existingQuotations[index] = updatedQuotation;
    saveQuotationsToLocalStorage(existingQuotations);
    return updatedQuotation;
  }
  return undefined; // Quotation not found
};

// Function to delete a quotation by ID
export const deleteQuotationFromLocalStorage = (id: string): boolean => {
  const existingQuotations = getQuotationsFromLocalStorage();
  const initialLength = existingQuotations.length;
  const filteredQuotations = existingQuotations.filter(q => q.id !== id);

  if (filteredQuotations.length < initialLength) {
    saveQuotationsToLocalStorage(filteredQuotations);
    return true; // Deleted successfully
  }
  return false; // Quotation not found
};

// --- Seed Data for Development (Optional) ---
// This will add some initial data if localStorage is empty
if (getQuotationsFromLocalStorage().length === 0 && typeof window !== 'undefined') {
  console.log("Seeding localStorage with initial quotation data for development.");
  const initialQuotations: Quotation[] = [
    {
      id: uuidv4(),
      customerName: 'Acme Corp',
      itemDescription: 'Consulting Services',
      quantity: 1,
      unitPrice: 1500.00,
      totalAmount: 1500.00,
      status: 'approved',
      date: '2025-06-15',
    },
    {
      id: uuidv4(),
      customerName: 'Globex Inc.',
      itemDescription: 'Software License',
      quantity: 5,
      unitPrice: 200.00,
      totalAmount: 1000.00,
      status: 'pending',
      date: '2025-06-20',
    },
    {
      id: uuidv4(),
      customerName: 'Umbrella Corp',
      itemDescription: 'Hardware Installation',
      quantity: 2,
      unitPrice: 750.00,
      totalAmount: 1500.00,
      status: 'rejected',
      date: '2025-06-25',
    },
  ];
  saveQuotationsToLocalStorage(initialQuotations);
}