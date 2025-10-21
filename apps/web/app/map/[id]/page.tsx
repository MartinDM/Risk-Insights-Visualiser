'use client';
import { MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Suspense, lazy, useEffect, useState } from 'react';
import { getAddressFromPos } from '../../utils/helpers';
import { usePeople } from '@/contexts/PeopleContext';
import { type Person } from '@/app/types/person';

const MapLoading = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <MapPin className="size-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);

export default function MapPage() {
  const { id: personId } = useParams() as { id: string };
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{
    latitude?: number;
    longitude?: number;
  }>();

  const [error, setError] = useState<string | null>();

  const { getPersonById } = usePeople();
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
        setAddress(addressParts.join(', ') || 'Address not found');
        setLoading(false);
      } catch (e) {
        setError('Failed to load person data');
        setLoading(false);
      }
    })();
  }, [person]);

  const LazyMap = lazy(() =>
    import('../../../components/Map/Map').then((module) => ({ default: module.Map })),
  );

  return (
    <div className="w-full h-[90vh] max-h-screen">
      <div className="mb-4 p-4">
        <h1 className="text-3xl font-bold mb-3">Location Map</h1>
        <div className={`grid grid-cols-2 gap-4 border-b-1 pb-4`}>
          <div>
            {person && (
              <p className="font-bold">
                {' '}
                Last known location of {person ? person.name : 'this person'}
              </p>
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
    </div>
  );
}
