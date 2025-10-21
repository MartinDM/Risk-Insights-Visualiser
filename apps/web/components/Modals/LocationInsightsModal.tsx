'use client';
import { TriangleAlert } from 'lucide-react';
import { TransactionInsights, type Person } from '../../app/types/person';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { fetchPersonById, formatCurrency } from '@/utils/helpers';
import { usePeople } from '@/contexts/PeopleContext';

interface LocationInsightsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
}

interface FrequentMerchant {
  merchantName: string;
  totalSpent: number;
  transactionCount: number;
}

export function LocationInsightsModal({
  isOpen,
  onOpenChange,
  personId,
}: LocationInsightsModalProps) {
  const { people } = usePeople();
  if (!isOpen) return null;

  const person: Person | undefined = fetchPersonById(people, personId);
  const { unusualLocations, frequentMerchants } = person?.transactionInsights
    ?.riskIndicators ?? { unusualLocations: [], frequentMerchants: [] };
  type UnusualLocation =
    TransactionInsights['riskIndicators']['unusualLocations'][number];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5" />
            Risk Indicators for {person ? person.name : 'this person'}.
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {person && (
            <div className="space-y-6">
              {person.locationInsights?.currentLocation?.coords?.lat && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"></h3>

                  {/* Location Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium  text-amber-400">
                        Unusual Transactions
                      </label>
                      {unusualLocations.map((location: UnusualLocation) => (
                        <div key={location.location} className="mb-2">
                          <h4>{location.location}</h4>
                          <p className="text-sm">${location.amount}</p>
                          <p className="text-sm">
                            {new Date(location.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <strong>Risk:</strong> {location.riskScore}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Avg. Stay Duration across{' '}
                        {person.locationInsights?.locationHistory?.length} locations
                      </label>
                      <p className="text-lg font-semibold">
                        {person.locationInsights?.locationHistory?.length > 0
                          ? Math.round(
                              person.locationInsights.locationHistory.reduce(
                                (acc, loc) => acc + (loc.duration || 0),
                                0,
                              ) / person.locationInsights.locationHistory.length,
                            )
                          : 0}{' '}
                        days
                      </p>
                      <div className="mt-4">
                        <label className="text-md font-medium text-amber-400">
                          Frequent merchants
                        </label>
                        {frequentMerchants.map((merchant: FrequentMerchant) => (
                          <div className="mb-2" key={merchant.merchantName}>
                            <h4>{merchant.merchantName}</h4>
                            <p className="text-sm">${merchant.totalSpent}</p>
                            <p className="text-sm">
                              <strong>Transactions:</strong> {merchant.transactionCount}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
