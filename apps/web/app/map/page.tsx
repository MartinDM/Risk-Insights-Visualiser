'use client';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, lazy, useEffect, useState } from 'react';
import { usePeople } from '@/contexts/PeopleContext';
import { type PersonMapLocation } from '@/app/types/person';

const MapLoading = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <MapPin className="size-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);

// IMPORTANT: define LazyMap at module scope so identity is stable across renders
const LazyMap = lazy(() =>
  import('../../components/Multimap/Multimap').then((module) => ({
    default: module.Multimap,
  })),
);

export default function MapPage() {
  const [locationData, setLocationData] = useState<PersonMapLocation[]>();

  const router = useRouter();
  const { selectedPeople } = usePeople();

  useEffect(() => {
    if (!selectedPeople.length) return router.push('../');
    const locationData: PersonMapLocation[] = selectedPeople.map(
      ({ transactionInsights: _transactionInsights, ...rest }) => rest,
    );
    setLocationData(locationData);
  }, [selectedPeople, router]);

  return (
    <div className="w-full h-[90vh] max-h-screen">
      <div className="mb-4 p-4">
        <button
          onClick={() => router.back()}
          className="text-zinc-300 cursor-pointer hover:text-zinc-500 mb-2"
        >
          ← Back to table
        </button>
        <h1 className="text-3xl font-bold mb-3 border-l-amber-400 border-l-2 pl-4">
          {selectedPeople?.length && `Selected ${selectedPeople.length} person(s)`}
        </h1>
      </div>

      <div className="w-full">
        <Suspense fallback={<MapLoading />}>
          {locationData && <LazyMap locationData={locationData} />}
        </Suspense>
      </div>
      {/* <ProfileModal isOpen={openModal} onOpenChange={setOpenModal} personId={personId} /> */}
    </div>
  );
}
