// src/app/page.tsx - This is your Home Page
import { Button } from '@/components/ui/button';
export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-rs-dark-navy mb-4">Welcome to Rydberg Starck!</h1>
      <p className="text-lg text-gray-700">Your next generation quotation system.</p>
      <p className="text-gray-600 mt-2">Use the navigation above to access Invoices and Receipts.</p>
    {/* Add the Shadcn/ui Button here */}
      <Button className="mt-8 bg-rs-teal-green hover:bg-rs-light-teal text-white">
        Get Started
      </Button>
    </div>
    
  );
}