'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { type PersonMapLocation } from '@/app/types/person';
import {
  createCurrentLocationPopupHTML,
  generateCurrentLocationMarker,
} from '../Map/helpers';

import { Lightbulb, LightbulbOff } from 'lucide-react';

export function Multimap({ locationData }: { locationData: PersonMapLocation[] }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState<number>(8);
  const [center, setCenter] = useState<mapboxgl.LngLat>(
    new mapboxgl.LngLat(-0.1278, 51.5074),
  );
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isDark, setIsDark] = useState(false);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const addCurrentLocationMarkers = () => {
    const map = mapRef.current;
    if (!map || !locationData.length) return;
    locationData.forEach((record: PersonMapLocation) => {
      const currentLocation = record.locationInsights?.currentLocation;
      if (!currentLocation) return;
      const { lng, lat } = currentLocation.coords;
      const markerEl = generateCurrentLocationMarker();
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        createCurrentLocationPopupHTML(currentLocation),
      );
      new mapboxgl.Marker(markerEl).setLngLat([lng, lat]).setPopup(popup).addTo(map);
    });
  };

  const handleMove = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    setCenter(c);
    setZoom(map.getZoom() ?? 8);
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    mapRef.current = new mapboxgl.Map({
      container,
      style: mapStyle,
      center,
      prefetchZoomDelta: 0,
      zoom,
    });

    const map = mapRef.current;
    addCurrentLocationMarkers();
    map.on('move', handleMove);

    return () => {
      map.off('move', handleMove);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStyle = () => {
    const newStyle = isDark
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/navigation-night-v1';

    setIsDark(!isDark);
    const map = mapRef.current;
    if (!map) return;
    setMapStyle(newStyle);
    map.setStyle(newStyle);
  };

  const handleReset = () => {
    const map = mapRef.current;
    if (!map) return;
    const coords = locationData[0]?.locationInsights?.currentLocation?.coords;
    if (coords) {
      map.flyTo({
        center: coords,
        zoom: 8,
      });
    }
  };

  return (
    <div className={`relative w-full h-screen max-h-[70vh] map`}>
      <div ref={mapContainerRef} className="h-full" />
      <div className="absolute top-0 left-0 m-3 px-3 py-1.5 bg-slate-700/90 text-white font-mono rounded z-10">
        Longitude: {center?.lng?.toFixed(4) ?? '...'} | Latitude:{' '}
        {center.lat?.toFixed(4) ?? '...'} | Zoom: {zoom?.toFixed(2) ?? '...'}
      </div>
      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-between items-end p-4 z-10">
        <div className="flex gap-2">
          <button
            className="bg-gray-800 py-2 px-4 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="bg-gray-800 py-2 px-4 text-white rounded hover:bg-gray-700 transition-colors"
            onClick={toggleStyle}
          >
            {isDark ? <LightbulbOff /> : <Lightbulb />}
          </button>
        </div>
      </div>
    </div>
  );
}
