import Link from 'next/link';
import Header from '@/components/Header';
import InvoiceTable from '@/components/InvoiceTable';
import { FileText, IndianRupee } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Invoice, { IInvoice } from '@/lib/models/Invoice';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllInvoices(): Promise<IInvoice[]> {
  try {
    await dbConnect();
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default async function InvoicesPage() {
  const invoices = await getAllInvoices();

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.paymentStatus !== 'paid')
    .reduce((sum, inv) => sum + (inv.balanceAmount || inv.totalAmount), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Invoices</h1>
              <p className="text-gray-600">View and manage all generated invoices</p>
            </div>
            <Link
              href="/invoice"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate New Invoice
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300"
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 border border-gray-300"
            >
              All Bookings
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <IndianRupee className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <IndianRupee className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Yet</h3>
              <p className="text-gray-600 mb-6">Generate your first invoice to get started</p>
              <Link
                href="/invoice"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Generate Invoice
              </Link>
            </div>
          ) : (
            <InvoiceTable invoices={invoices as never[]} />
          )}
        </div>
      </div>
    </div>
  );
}
