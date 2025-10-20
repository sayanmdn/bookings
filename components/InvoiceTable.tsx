'use client';

import { useRouter } from 'next/navigation';
import { FileText, Calendar, User } from 'lucide-react';
import { IInvoice } from '@/lib/models/Invoice';

interface InvoiceTableProps {
  invoices: IInvoice[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'partial':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();

  const handleRowClick = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Guest Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stay Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr
              key={invoice._id?.toString()}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleRowClick(invoice._id?.toString() || '')}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{invoice.guestName}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-900">
                    {formatDate(invoice.checkIn)} - {formatDate(invoice.checkOut)}
                    <span className="text-xs text-gray-500 ml-2">
                      ({invoice.numberOfNights} night{invoice.numberOfNights > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {invoice.roomType}
                  <span className="text-xs text-gray-500 block">
                    {invoice.numberOfRooms} room{invoice.numberOfRooms > 1 ? 's' : ''} · {invoice.numberOfGuests} guest{invoice.numberOfGuests > 1 ? 's' : ''}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(invoice.totalAmount)}
                </div>
                {invoice.advanceAmount !== undefined && invoice.advanceAmount > 0 && (
                  <div className="text-xs text-gray-500">
                    Advance: {formatCurrency(invoice.advanceAmount)}
                  </div>
                )}
                {invoice.balanceAmount !== undefined && invoice.balanceAmount > 0 && (
                  <div className="text-xs text-orange-600 font-medium">
                    Balance: {formatCurrency(invoice.balanceAmount)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                  {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.createdAt ? formatDate(invoice.createdAt) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
