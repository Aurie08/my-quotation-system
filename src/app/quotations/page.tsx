// src/app/quotations/page.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function QuotationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-rs-dark-navy">Quotations</h1>
        <Link href="/quotations/new">
          <Button className="bg-rs-teal-green hover:bg-rs-light-teal text-white">
            Create New Quotation
          </Button>
        </Link>
      </div>

      <p className="text-lg text-gray-700">
        This page will display a list of your quotations and allow you to create new ones.
      </p>
    </div>
  );
}