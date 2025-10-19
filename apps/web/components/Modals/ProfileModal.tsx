'use client';
import { useTable } from '@/contexts/TableContext';
import { Badge } from '@workspace/ui/components/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
import { CreditCard, Loader2, MapPin, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Person } from '../../app/types/person';

import { fetchPersonById } from '../../app/utils/helpers';
interface ProfileModaProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
}

export function ProfileModal({ isOpen, onOpenChange, personId }: ProfileModaProps) {
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { table } = useTable();

  useEffect(() => {
    if (isOpen && personId && fetchPersonById) {
      setLoading(true);
      setError(null);

      try {
        const personData = fetchPersonById(
          table.getCoreRowModel().rows.map((r) => r.original),
          personId,
        );
        setPerson(personData || null);
        if (!personData) {
          setError('Person not found');
        }
        setLoading(false);
      } catch (_err) {
        setError('Failed to load person data');
        setLoading(false);
      }
    }
  }, [isOpen, personId, fetchPersonById]);

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') return date;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {loading
              ? 'Loading Person Insights...'
              : person
                ? `${person.name} - Insights`
                : 'Person Insights'}
          </DialogTitle>
          <DialogDescription>
            Comprehensive insights including location history, transactions, and personal
            details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading person data...
            </div>
          )}

          {error && <div className="text-destructive text-center py-4">{error}</div>}

          {person && !loading && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="text-sm">{person.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Date of Birth
                    </label>
                    <p className="text-sm">{person.dob}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Account Number
                    </label>
                    <p className="text-sm font-mono">{person.accountNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Risk Score
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          person.risk < 33
                            ? 'default'
                            : person.risk < 66
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {person.risk}/100
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Salary
                    </label>
                    <p className="text-sm">{formatCurrency(person.salary)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Current Location
                    </label>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {person.location.city}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="text-sm text-muted-foreground mt-1">{person.bio}</p>
                </div>
              </section>

              <Separator />

              {/* Location Insights */}
              {person.locationInsights && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location History
                  </h3>

                  {/* Current Location */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Current Location</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">
                        {person.locationInsights.currentLocation.city},{' '}
                        {person.locationInsights.currentLocation.country}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Since: {formatDate(person.locationInsights.currentLocation.since)}
                      </p>
                    </div>
                  </div>

                  {/* Travel Patterns */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Travel Patterns</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mobility Score</p>
                        <p className="text-lg font-semibold">
                          {person.locationInsights.travelPatterns.mobilityScore}
                          /100
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Avg Stay Duration</p>
                        <p className="text-lg font-semibold">
                          {person.locationInsights.travelPatterns.averageStayDuration}{' '}
                          days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Locations */}
                  {person.locationInsights.locationHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Locations</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {person.locationInsights.locationHistory
                          .slice(0, 5)
                          .map((location) => (
                            <div
                              key={location.id}
                              className="flex justify-between items-center p-2 bg-muted/30 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {location.location.city}, {location.location.country}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {location.locationType}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(location.timestamp)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {location.confidence}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              <Separator />

              {/* Transaction Insights */}
              {person.transactionInsights && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Financial Overview
                  </h3>

                  {/* Spending Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Total Spent (6 months)
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          person.transactionInsights.spendingPatterns.totalSpent,
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Average Transaction</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          person.transactionInsights.spendingPatterns.averageTransaction,
                        )}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Transaction Count</p>
                      <p className="text-lg font-semibold">
                        {person.transactionInsights.spendingPatterns.transactionCount}
                      </p>
                    </div>
                  </div>

                  {/* Top Spending Categories */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Top Spending Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        person.transactionInsights.spendingPatterns.categoryBreakdown,
                      )
                        .sort(([, a], [, b]) => b.amount - a.amount)
                        .slice(0, 5)
                        .map(([category, data]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm capitalize">{category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatCurrency(data.amount)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {data.percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  {person.transactionInsights.recentTransactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {person.transactionInsights.recentTransactions
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp).getTime() -
                              new Date(a.timestamp).getTime(),
                          )
                          .slice(0, 10)
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex justify-between items-center p-2 bg-muted/30 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {transaction.merchantName}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {transaction.merchantCategory}
                                  {transaction.location &&
                                    ` • ${transaction.location.city}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatCurrency(
                                    transaction.amount,
                                    transaction.currency,
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(transaction.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
