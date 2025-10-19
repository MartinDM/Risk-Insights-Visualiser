import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { LocationInsights } from '../../app/types/person';
import { Legend } from './components/Legend';
import {
  createCurrentLocationPopupHTML,
  createLocationPopupHTML,
  createResidencePopupHTML,
  generateCurrentLocationMarker,
  generateLocationMarker,
  generateResidenceMarker,
} from './helpers';

import { Lightbulb, LightbulbOff } from 'lucide-react';

export function Map({ locationData }: { locationData?: LocationInsights }) {

  if (!locationData) return;

  const { lat, lng } = locationData?.currentLocation?.coords || { lat: 0, lng: 0 };

  const mapRef = useRef<mapboxgl.Map | undefined>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(14.5);
  const [center, setCenter] = useState<[number, number]>([lng, lat]);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isDark, setIsDark] = useState(false);

  const [showResidenceHistory, setShowResidenceHistory] = useState(true);
  const [showLocationHistory, setShowLocationHistory] = useState(true);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const addCurrentLocationMarker = () => {
    // Add current location marker (always visible)
    if (locationData?.currentLocation) {
      const { lng, lat } = locationData.currentLocation.coords;
      const markerEl = generateCurrentLocationMarker();
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        createCurrentLocationPopupHTML(locationData.currentLocation),
      );

      if (mapRef.current) {

        new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        mapRef.current.on('move', () => {
          if (mapRef.current) {
            const mapCenter = mapRef.current.getCenter();
            const mapZoom = mapRef.current.getZoom();
            setCenter([mapCenter.lng, mapCenter.lat]);
            setZoom(mapZoom);
          }
        });
      }
      return () => {
        mapRef.current?.remove();
      };
    }
  }

  const addResidenceMarkers = () => {
    if (!mapRef.current || !locationData?.residenceHistory) return;

    const markers: mapboxgl.Marker[] = [];

    if (showResidenceHistory) {
      locationData.residenceHistory.forEach((residence) => {
        const { lng, lat } = residence.location.coords;
        const markerEl = generateResidenceMarker(!residence.endDate);
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          createResidencePopupHTML(residence),
        );
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current!);
        markers.push(marker);
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }

  const addLocationMarkers = () => {
    if (!mapRef.current) return;

    const markers: mapboxgl.Marker[] = [];

    if (showLocationHistory) {
      console.log('Adding location history markers');
      locationData.locationHistory.forEach((location) => {
        const { lng, lat } = location.location.coords;
        const markerEl = generateLocationMarker();
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          createLocationPopupHTML(location),
        );
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current);
        markers.push(marker);
      });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;

    addCurrentLocationMarker()

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center,
      zoom,
    });

  }, []);


  // Separate effect for managing residence history markers
  useEffect(() => {
    addResidenceMarkers()
  }, [showResidenceHistory, locationData?.residenceHistory]);

  useEffect(() => {
    addLocationMarkers();

  }, [showLocationHistory, locationData?.locationHistory]);

  const changeStyle = (newStyle: string) => {
    if (mapRef.current) {
      setMapStyle(newStyle);
      mapRef.current.setStyle(newStyle);
    }
  };


  mapRef.current.on('style.load', () => {
    // optionally re-add markers if style reset clears them
  });


  const toggleStyle = () => {
    const newStyle = isDark
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/navigation-night-v1';

    setIsDark(!isDark);
    changeStyle(newStyle);
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14.5,
      });
    };
  }

  return (
    <div className={`relative h-full w-full flex-1`}>
      <div ref={mapContainerRef} className={`h-full w-full`} />
      <div
        className={`absolute top-0 left-0 m-3 px-3 py-1.5 bg-slate-700/90 text-white font-mono rounded z-10`}
      >
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom:{' '}
        {zoom.toFixed(2)}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 w-full flex justify-between items-end p-4 z-10`}
      >
        <Legend
          showResidenceHistory={showResidenceHistory}
          showLocationHistory={showLocationHistory}
          setShowResidenceHistoryAction={() => setShowResidenceHistory(!showResidenceHistory)}
          setShowLocationHistoryAction={() => setShowLocationHistory(!showLocationHistory)}
        />
        <div className={`flex gap-2`}>
          <button
            className={`bg-gray-800 py-2 px-4 text-white rounded hover:bg-gray-700 transition-colors`}
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className={`bg-gray-800 py-2 px-4 text-white rounded hover:bg-gray-700 transition-colors`}
            onClick={toggleStyle}
          >
            {isDark ? <LightbulbOff /> : <Lightbulb />}
          </button>
        </div>
      </div>
    </div>
  );
}
