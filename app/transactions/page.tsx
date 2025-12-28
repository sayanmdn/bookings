'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import ProtectedPage from '@/components/ProtectedPage';
import { ITransaction } from '@/lib/models/Transaction';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<ITransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSync = useCallback(async () => {
        setSyncing(true);
        setError('');
        setSuccessMsg('');
        try {
            const response = await fetch('/api/transactions/sync');

            if (response.status === 401) {
                // Auth required
                window.location.href = '/api/gmail/auth?type=transactions';
                return;
            }

            if (!response.ok) {
                throw new Error('Sync failed');
            }

            const data = await response.json();
            setSuccessMsg(`Synced successfully! Added ${data.added} new transactions.`);
            fetchTransactions(); // Refresh list
        } catch (err) {
            setError('Failed to sync transactions');
            console.error(err);
        } finally {
            setSyncing(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();

        // Check for sync success param
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('gmail_sync') === 'connected') {
            setSuccessMsg('Gmail connected! Syncing transactions...');
            handleSync();
            window.history.replaceState({}, '', '/transactions');
        }
    }, [handleSync]);

    async function fetchTransactions() {
        try {
            const response = await fetch('/api/transactions');
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json();
            setTransactions(data);
        } catch (err) {
            setError('Error loading transactions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }



    return (
        <ProtectedPage allowedRoles={['EDITOR', 'ADMIN']}>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {syncing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
                            )}
                            {syncing ? 'Syncing...' : 'Sync'}
                        </button>
                    </div>

                    {successMsg && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex justify-between items-center">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700">×</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                            No transactions found.
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>


                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.map((transaction, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {transaction.description || '-'}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                    {transaction.paymentMethod.replace('_', ' ')}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                                </td>


                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedPage>
    );
}
