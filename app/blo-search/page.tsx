import Link from 'next/link';
import Header from '@/components/Header';
import BLOSearchForm from '@/components/BLOSearchForm';

export default function BLOSearchPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BLO Search</h1>
          <p className="text-gray-600">Search for Booth Level Officers using any combination of filters</p>
        </div>

        <div className="mb-6">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Home
          </Link>
        </div>

        <BLOSearchForm />
      </div>
    </div>
  );
}
