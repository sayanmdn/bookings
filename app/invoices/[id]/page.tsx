'use client';

import { useState, useEffect } from 'react';
import InvoiceHeader from '@/components/InvoiceHeader';
import Link from 'next/link';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  numberOfRooms: number;
  numberOfGuests: number;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus: string;
  remarks?: string;
  createdAt: string;
}

export default function InvoiceEditPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [formData, setFormData] = useState({
    roomType: '',
    numberOfRooms: '',
    numberOfGuests: '',
    pricePerNight: '',
    numberOfNights: '',
    advanceAmount: '',
    remarks: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      setInvoice(data);
      setInvoice(data);
      setFormData({
        roomType: data.roomType,
        numberOfRooms: data.numberOfRooms.toString(),
        numberOfGuests: data.numberOfGuests.toString(),
        pricePerNight: data.pricePerNight.toString(),
        numberOfNights: data.numberOfNights.toString(),
        advanceAmount: data.advanceAmount?.toString() || '',
        remarks: data.remarks || '',
      });
    } catch (err) {
      console.error('Error fetching invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.pricePerNight) || 0;
    const nights = parseFloat(formData.numberOfNights) || 0;
    const rooms = parseFloat(formData.numberOfRooms) || 0;
    return price * nights * rooms;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const advance = parseFloat(formData.advanceAmount) || 0;
    return total - advance;
  };

  const handleRegeneratePDF = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      if (!invoice) return;

      // Update invoice data
      const updateData = {
        roomType: formData.roomType,
        numberOfRooms: parseInt(formData.numberOfRooms),
        numberOfGuests: parseInt(formData.numberOfGuests),
        pricePerNight: parseFloat(formData.pricePerNight),
        numberOfNights: parseInt(formData.numberOfNights),
        advanceAmount: formData.advanceAmount ? parseFloat(formData.advanceAmount) : 0,
        remarks: formData.remarks,
      };

      const updateResponse = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      // Generate PDF with updated data
      const pdfData = {
        invoiceNumber: invoice.invoiceNumber,
        guestName: invoice.guestName,
        checkIn: invoice.checkIn,
        checkOut: invoice.checkOut,
        roomType: updateData.roomType,
        numberOfRooms: updateData.numberOfRooms,
        numberOfGuests: updateData.numberOfGuests,
        pricePerNight: updateData.pricePerNight,
        numberOfNights: updateData.numberOfNights,
        totalAmount: updateData.pricePerNight * updateData.numberOfNights * updateData.numberOfRooms,
        advanceAmount: updateData.advanceAmount,
        balanceAmount: (updateData.pricePerNight * updateData.numberOfNights * updateData.numberOfRooms) - updateData.advanceAmount,
        remarks: updateData.remarks,
      };

      const pdfResponse = await fetch('/api/invoice/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Download the PDF
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Refresh invoice data
      await fetchInvoice();

      alert('PDF regenerated successfully!');
    } catch (err) {
      console.error('Error regenerating PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <InvoiceHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <InvoiceHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/invoices" className="text-blue-600 hover:text-blue-800">
              ← Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const balance = calculateBalance();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <InvoiceHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/invoices"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-gray-600">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleRegeneratePDF}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Guest Information - READ ONLY */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Guest Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    value={invoice.guestName}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Booking Details - READ ONLY */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Booking Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="text"
                    value={formatDate(invoice.checkIn)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="text"
                    value={formatDate(invoice.checkOut)}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type
                  </label>
                  <input
                    type="text"
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms
                  </label>
                  <input
                    type="number"
                    id="numberOfRooms"
                    name="numberOfRooms"
                    value={formData.numberOfRooms}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Night (₹)
                  </label>
                  <input
                    type="number"
                    id="pricePerNight"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfNights" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Nights
                  </label>
                  <input
                    type="number"
                    id="numberOfNights"
                    name="numberOfNights"
                    value={formData.numberOfNights}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details - EDITABLE */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Payment Details
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="advanceAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    id="advanceAmount"
                    name="advanceAmount"
                    value={formData.advanceAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the amount received from guest</p>
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Any additional notes or remarks"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Number of Nights:</span>
                  <span className="font-medium">{formData.numberOfNights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Rate per Night:</span>
                  <span className="font-medium">₹{parseFloat(formData.pricePerNight).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-blue-200">
                  <span>Total Amount:</span>
                  <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
                {formData.advanceAmount && parseFloat(formData.advanceAmount) > 0 && (
                  <>
                    <div className="flex justify-between text-green-700">
                      <span>Amount Paid:</span>
                      <span>- ₹{parseFloat(formData.advanceAmount).toLocaleString('en-IN')}</span>
                    </div>
                    {balance > 0 ? (
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200 text-orange-600">
                        <span>Balance Due:</span>
                        <span>₹{balance.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200 text-green-600">
                        <span>Payment Status:</span>
                        <span>PAID IN FULL</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Link
                href="/invoices"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Update & Regenerate PDF'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
