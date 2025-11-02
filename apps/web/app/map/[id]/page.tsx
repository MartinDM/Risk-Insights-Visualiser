'use client';
import { MapPin, ExternalLink } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getAddressFromPos } from '../../utils/helpers';
import { usePeople } from '@/contexts/PeopleContext';
import { type Person } from '@/app/types/person';
import { ProfileModal } from '@/components/Modals/ProfileModal';

const MapLoading = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <MapPin className="size-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);

// IMPORTANT: define LazyMap at module scope so its identity is stable across renders
const LazyMap = lazy(() =>
  import('../../../components/Map/Map').then((module) => ({ default: module.Map })),
);

export default function MapPage() {
  const { id: personId } = useParams() as { id: string };
  const [_loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [locationCoords, setLocationCoords] = useState<{
    latitude?: number;
    longitude?: number;
  }>();

  const [_error, setError] = useState<string | null>();
  const { getPersonById } = usePeople();
  const router = useRouter();
  const person: Person | undefined = getPersonById(personId);

  useEffect(() => {
    if (!person) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!person) {
          setError('Person not found');
        }
        const { lng, lat } = person?.locationInsights?.currentLocation.coords || {
          lng: 0,
          lat: 0,
        };

        const geoCodeResponse = await getAddressFromPos({ lng, lat });
        const feature = geoCodeResponse.features[0];
        const street =
          feature?.properties.context.street?.name ||
          feature?.properties.context.address?.name;
        const postcode = feature?.properties.context.postcode?.name;
        const country = feature?.properties.context.country?.name;
        const addressParts = [street, postcode, country].filter(Boolean);
        setLocationCoords(feature?.properties.coordinates);
        setAddress(addressParts.join(', ') || 'No address available');
        setLoading(false);
      } catch (e) {
        setError(`Failed to load person data: ${e as Error}`);
        setLoading(false);
      }
    })();
  }, [person]);

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
          {person?.name}
        </h1>
        <div className={`grid grid-cols-2 gap-4 border-b-1 pb-4`}>
          <div>
            {person && (
              <span className="flex">
                <button
                  className="flex underline cursor-pointer hover:text-zinc-500 font-bold mb-2"
                  onClick={() => {
                    setOpenModal(!openModal);
                  }}
                >
                  View profile
                  <span className="px-2">
                    <ExternalLink />
                  </span>
                </button>
              </span>
            )}
            {address && <p>{address}</p>}
          </div>
          {locationCoords && (
            <p className="text-right">
              <span>Lat: {locationCoords.latitude ?? 'N/A'}</span>
              <span className="block">Lng: {locationCoords.longitude ?? 'N/A'}</span>
            </p>
          )}
        </div>
      </div>

      <div className="w-full">
        <Suspense fallback={<MapLoading />}>
          {person?.locationInsights && <LazyMap locationData={person.locationInsights} />}
        </Suspense>
      </div>
      <ProfileModal isOpen={openModal} onOpenChange={setOpenModal} personId={personId} />
    </div>
  );
}
