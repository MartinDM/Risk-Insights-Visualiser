'use client';
import { MapPin } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Map } from '../../../components/Map/Map';
import { Person } from '../../types/person';
import { getAddressFromPos } from '../../utils/helpers';
import { usePeople } from '@/contexts/PeopleContext';

const MapLoading = () => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
    <MapPin className="size-8 animate-spin text-muted-foreground" />
    <p className="text-muted-foreground">Loading map...</p>
  </div>
);
export default function MapPage() {
  const { id: personId } = useParams() as { id: string }
  const { getPersonById } = usePeople();

  const personData = getPersonById(personId)
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState<Person>();
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    if (!personId) return;
    (async () => {
      console.log('Person ID from params:', personId);
      setLoading(true);
      setError(null);
      try {

        setPerson(personData);
        console.log(personData);
        if (!personData) {
          setError('Person not found');
        }
        const { lng, lat } = personData?.locationInsights?.currentLocation.coords || {
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
        setAddress(addressParts.join(', ') || 'Address not found');
        setLoading(false);
      } catch (e) {
        console.log(e);
        setError('Failed to load person data');
        setLoading(false);
      }
    })();
  }, [personId]);

  return (
    <div className="h-screen w-full">
      <div className="mb-4 p-4">
        <h1 className="text-3xl font-bold">Location Map</h1>
        {person && <p> Last known location of {person ? person.name : 'this person'}</p>}
        <p className="text-muted-foreground">
          <MapPin />
          View location insights and history
        </p>
      </div>

      <Suspense fallback={<MapLoading />}>
        <div className="h-full w-full">
          {person && !loading && <Map locationData={person.locationInsights} />}{' '}
        </div>
      </Suspense>
    </div>
  );
}
