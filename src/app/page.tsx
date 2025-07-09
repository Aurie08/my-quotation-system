// src/app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  const handleGetStartedClick = () => {
    router.push('/invoices');
  };

  return (
    // This is the file to add background image classes to the main tag
    <main
      className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-24 text-center
                 bg-[url('/home-background.jpg')] bg-cover bg-center bg-no-repeat"
    >
      {/* Optional: Add an overlay for better text readability, uncomment if needed */}
      <div className="absolute inset-0 bg-black opacity-40"></div> {/* Adjust opacity as desired */}

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col text-white"> {/* Added text-white here for readability */}
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Rydberg Starck!
        </h1>
        <p className="text-xl mb-8">
          Your next generation quotation system.
        </p>
        <p className="text-md mb-10">
          Use the navigation above to access invoices and Receipts.
        </p>
        <Button
          onClick={handleGetStartedClick}
          className="bg-rs-teal-green hover:bg-rs-light-teal text-white text-lg px-8 py-4 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
        >
          Get Started
        </Button>
      </div>
    </main>
  );
}