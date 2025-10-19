'use client';
import { useState } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { ChevronUp, ChevronDown, LocateFixed, Home } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';

type LegendProps = {
  showResidenceHistory: boolean;
  showLocationHistory: boolean;
  setShowResidenceHistoryAction: () => void;
  setShowLocationHistoryAction: () => void;
};

export function Legend({
  showResidenceHistory,
  showLocationHistory,
  setShowResidenceHistoryAction,
  setShowLocationHistoryAction,
}: LegendProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col bg-gray-800 p-1 border-gray-800 opacity-80 rounded-sm border-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-3 mb-2">
            <Checkbox
              id="residence-history"
              checked={showResidenceHistory}
              onCheckedChange={setShowResidenceHistoryAction}
              className="bg-black border-black data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <Label
              htmlFor="residence-history"
              className="flex items-center justify-between flex-1"
            >
              Show Residences
              <Home className="h-4 w-4 text-green-600" />
            </Label>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              id="location-history"
              checked={showLocationHistory}
              onCheckedChange={setShowLocationHistoryAction}
              className="bg-black border-black data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <Label
              htmlFor="location-history"
              className="flex items-center justify-between flex-1"
            >
              Show Location History
              <LocateFixed className="h-4 w-4 text-red-500" />
            </Label>
          </div>
        </CollapsibleContent>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <h4 className="text-sm font-semibold">Markers</h4>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </Collapsible>
    </div>
  );
}
