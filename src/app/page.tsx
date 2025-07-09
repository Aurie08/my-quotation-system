// src/app/page.tsx
'use client'; // This directive makes the component a Client Component, necessary for useRouter

import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button'; // Import your Button component

export default function Home() {
  const router = useRouter();

  const handleGetStartedClick = () => {
    router.push('/invoices'); // Navigate to the Invoices page
  };

  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-24 text-center bg-gray-50">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col">
        <h1 className="text-5xl font-extrabold text-rs-dark-navy mb-4">
          Welcome to Rydberg Starck!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Your next generation quotation system.
        </p>
        <p className="text-md text-gray-600 mb-10">
          Use the navigation above to access invoices and Receipts.
        </p>
        <Button
          onClick={handleGetStartedClick} // Attach the click handler
          className="bg-rs-teal-green hover:bg-rs-light-teal text-white text-lg px-8 py-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
        >
          Get Started
        </Button>
      </div>
    </main>
  );
}