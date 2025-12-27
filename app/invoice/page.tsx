'use client';

import { useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import InvoiceHeader from '@/components/InvoiceHeader';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';

export default function InvoicePage() {
  const [formData, setFormData] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    numberOfRooms: 1,
    numberOfGuests: 1,
    pricePerNight: '',
    advanceAmount: '',
    remarks: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const pricePerNight = parseFloat(formData.pricePerNight) || 0;
    return nights * pricePerNight;
  };

  const calculateBalance = () => {
    const total = calculateTotal();
    const advance = parseFloat(formData.advanceAmount) || 0;
    return total - advance;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);

    try {
      // Validate dates
      if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
        setError('Check-out date must be after check-in date');
        setIsGenerating(false);
        return;
      }

      // Prepare data
      const invoiceData = {
        guestName: formData.guestName,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        roomType: formData.roomType,
        numberOfRooms: parseInt(formData.numberOfRooms.toString()),
        numberOfGuests: parseInt(formData.numberOfGuests.toString()),
        pricePerNight: parseFloat(formData.pricePerNight),
        advanceAmount: formData.advanceAmount ? parseFloat(formData.advanceAmount) : 0,
        remarks: formData.remarks,
      };

      // Call API to generate invoice
      const response = await fetch('/api/invoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${formData.guestName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Reset form
      setFormData({
        guestName: '',
        checkIn: '',
        checkOut: '',
        roomType: '',
        numberOfRooms: 1,
        numberOfGuests: 1,
        pricePerNight: '',
        advanceAmount: '',
        remarks: '',
      });

      alert('Invoice generated successfully!');
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  const nights = calculateNights();
  const total = calculateTotal();
  const balance = calculateBalance();

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <InvoiceHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Generate Invoice</h1>
                <p className="text-gray-600">Create a professional invoice for guest bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Guest Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Guest Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter guest name"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Booking Details
                </h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                    Room Type *
                  </label>
                  <select
                    id="roomType"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select room type</option>
                    <option value="Single Bed in Mixed Dormitory Room">Single Bed in Mixed Dormitory Room</option>
                    <option value="Single Bed in Female Dormitory Room">Single Bed in Female Dormitory Room</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rooms *
                  </label>
                  <input
                    type="number"
                    id="numberOfRooms"
                    name="numberOfRooms"
                    value={formData.numberOfRooms}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    name="numberOfGuests"
                    value={formData.numberOfGuests}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Night (₹) *
                  </label>
                  <input
                    type="number"
                    id="pricePerNight"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
          </div>

          {/* Payment Details */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes or remarks"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {nights > 0 && formData.pricePerNight && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Number of Nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Rate per Night:</span>
                  <span className="font-medium">₹{parseFloat(formData.pricePerNight).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-blue-200">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
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
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
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
              {isGenerating ? 'Generating...' : 'Generate Invoice PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
      </div >
    </ProtectedPage >
  );
}

const [formData, setFormData] = useState({
  guestName: '',
  checkIn: '',
  checkOut: '',
  roomType: '',
  numberOfRooms: 1,
  numberOfGuests: 1,
  pricePerNight: '',
  advanceAmount: '',
  remarks: '',
});

const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState('');

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const calculateNights = () => {
  if (formData.checkIn && formData.checkOut) {
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  }
  return 0;
};

const calculateTotal = () => {
  const nights = calculateNights();
  const pricePerNight = parseFloat(formData.pricePerNight) || 0;
  return nights * pricePerNight;
};

const calculateBalance = () => {
  const total = calculateTotal();
  const advance = parseFloat(formData.advanceAmount) || 0;
  return total - advance;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsGenerating(true);

  try {
    // Validate dates
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      setError('Check-out date must be after check-in date');
      setIsGenerating(false);
      return;
    }

    // Prepare data
    const invoiceData = {
      guestName: formData.guestName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      roomType: formData.roomType,
      numberOfRooms: parseInt(formData.numberOfRooms.toString()),
      numberOfGuests: parseInt(formData.numberOfGuests.toString()),
      pricePerNight: parseFloat(formData.pricePerNight),
      advanceAmount: formData.advanceAmount ? parseFloat(formData.advanceAmount) : 0,
      remarks: formData.remarks,
    };

    // Call API to generate invoice
    const response = await fetch('/api/invoice/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate invoice');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${formData.guestName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Reset form
    setFormData({
      guestName: '',
      checkIn: '',
      checkOut: '',
      roomType: '',
      numberOfRooms: 1,
      numberOfGuests: 1,
      pricePerNight: '',
      advanceAmount: '',
      remarks: '',
    });

    alert('Invoice generated successfully!');
  } catch (err) {
    console.error('Error generating invoice:', err);
    setError(err instanceof Error ? err.message : 'Failed to generate invoice');
  } finally {
    setIsGenerating(false);
  }
};

const nights = calculateNights();
const total = calculateTotal();
const balance = calculateBalance();

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <InvoiceHeader />
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <FileText className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generate Invoice</h1>
            <p className="text-gray-600">Create a professional invoice for guest bookings</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Guest Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              Guest Information
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name *
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={formData.guestName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter guest name"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date *
                </label>
                <input
                  type="date"
                  id="checkIn"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Date *
                </label>
                <input
                  type="date"
                  id="checkOut"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type *
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select room type</option>
                  <option value="Single Bed in Mixed Dormitory Room">Single Bed in Mixed Dormitory Room</option>
                  <option value="Single Bed in Female Dormitory Room">Single Bed in Female Dormitory Room</option>
                </select>
              </div>

              <div>
                <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rooms *
                </label>
                <input
                  type="number"
                  id="numberOfRooms"
                  name="numberOfRooms"
                  value={formData.numberOfRooms}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  id="numberOfGuests"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Night (₹) *
                </label>
                <input
                  type="number"
                  id="pricePerNight"
                  name="pricePerNight"
                  value={formData.pricePerNight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes or remarks"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {nights > 0 && formData.pricePerNight && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Number of Nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Rate per Night:</span>
                  <span className="font-medium">₹{parseFloat(formData.pricePerNight).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-blue-200">
                  <span>Total Amount:</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
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
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
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
              {isGenerating ? 'Generating...' : 'Generate Invoice PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}
