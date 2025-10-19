'use client';
import { Globe, MapPin, TriangleAlert } from 'lucide-react';
import { TransactionInsights, type Person } from '../../app/types/person';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Separator } from '@workspace/ui/components/separator';
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
            <Globe className="h-5 w-5" />
            Visualise the data we have for {person ? person.name : 'this person'}.
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {person && (
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
                      {person.location.city} since{' '}
                      {person.locationInsights?.currentLocation?.since
                        ? new Date(
                            person.locationInsights.currentLocation.since,
                          ).toLocaleDateString()
                        : 'unknown'}
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {person.locationInsights?.currentLocation?.coords?.lat && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TriangleAlert className="h-5 w-5" />
                    Risk Indicators
                  </h3>

                  {/* Location Statistics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Unusual Transactions
                      </label>
                      {unusualLocations.map((location: UnusualLocation) => (
                        <div key={location.id} className="mb-2">
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
                        <label className="text-sm font-medium text-muted-foreground">
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
