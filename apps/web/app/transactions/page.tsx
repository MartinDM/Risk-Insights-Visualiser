'use client';

import { useState } from 'react';
import { CreditCardTransaction } from '../types/person';

// Mock transaction data - replace with your actual data fetching
const mockTransactions: CreditCardTransaction[] = [
  {
    id: '1',
    timestamp: new Date('2024-10-12T14:30:00'),
    amount: 45.67,
    currency: 'USD',
    merchantName: 'Coffee Shop Downtown',
    merchantCategory: 'restaurant',
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      coords: { lat: 37.7749, lng: -122.4194 },
      address: '123 Main St',
    },
    cardLastFour: '1234',
    transactionType: 'purchase',
    isOnline: false,
    status: 'completed',
  },
  {
    id: '2',
    timestamp: new Date('2024-10-11T09:15:00'),
    amount: 89.99,
    currency: 'USD',
    merchantName: 'Amazon',
    merchantCategory: 'retail',
    cardLastFour: '1234',
    transactionType: 'purchase',
    isOnline: true,
    status: 'completed',
  },
  {
    id: '3',
    timestamp: new Date('2024-10-10T18:45:00'),
    amount: 125.5,
    currency: 'USD',
    merchantName: 'Gas Station',
    merchantCategory: 'gas',
    location: {
      city: 'Oakland',
      state: 'CA',
      country: 'USA',
      coords: { lat: 37.8044, lng: -122.2711 },
    },
    cardLastFour: '5678',
    transactionType: 'purchase',
    isOnline: false,
    status: 'completed',
  },
];

function TransactionCard({ transaction }: { transaction: CreditCardTransaction }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    declined: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{transaction.merchantName}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}
        >
          {transaction.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Amount</p>
          <p className="font-medium">
            {transaction.currency} ${transaction.amount.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium">{transaction.timestamp.toLocaleDateString()}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Category</p>
          <p className="font-medium capitalize">{transaction.merchantCategory}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Card</p>
          <p className="font-medium">****{transaction.cardLastFour}</p>
        </div>

        {transaction.location && (
          <div className="col-span-2">
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium">
              {transaction.location.city}
              {transaction.location.state && `, ${transaction.location.state}`},{' '}
              {transaction.location.country}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t">
        <span
          className={`px-2 py-1 rounded-full text-xs ${transaction.isOnline ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {transaction.isOnline ? 'Online' : 'In-Store'}
        </span>
        <span className="text-xs text-muted-foreground">
          {transaction.transactionType}
        </span>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [transactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.merchantCategory === filter;
  });

  const categories = [
    'all',
    ...Array.from(new Set(transactions.map((t) => t.merchantCategory))),
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage your credit card transactions
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category === 'all'
                ? 'All'
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
          <p className="text-2xl font-bold">
            ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-muted-foreground">
            Online vs In-Store
          </h3>
          <p className="text-2xl font-bold">
            {filteredTransactions.filter((t) => t.isOnline).length} /{' '}
            {filteredTransactions.filter((t) => !t.isOnline).length}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No transactions found for the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
