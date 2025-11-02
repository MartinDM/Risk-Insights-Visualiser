'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LocationInsights } from '@/app/types/person';
import { Legend } from '../Legend';

import {
  createCurrentLocationPopupHTML,
  createLocationPopupHTML,
  createResidencePopupHTML,
  generateCurrentLocationMarker,
  generateLocationMarker,
  generateResidenceMarker,
} from './helpers';

import { Lightbulb, LightbulbOff } from 'lucide-react';
import { LocationHistory } from '../../app/types/person';

export function Map({ locationData }: { locationData: LocationInsights }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const locationDataRef = useRef(locationData);

  const initialZoomRef = useRef<number>(8);
  const initialCenterRef = useRef<mapboxgl.LngLat>(
    new mapboxgl.LngLat(
      locationData.currentLocation.coords.lng,
      locationData.currentLocation.coords.lat,
    ),
  );
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isDark, setIsDark] = useState(false);

  const [showResidenceHistory, setShowResidenceHistory] = useState(true);
  const [showLocationHistory, setShowLocationHistory] = useState(true);

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Keep locationDataRef in sync without triggering effects
  useEffect(() => {
    locationDataRef.current = locationData;
  }, [locationData]);

  const addCurrentLocationMarker = () => {
    if (!mapRef.current || !locationData?.currentLocation) return;
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
          .addTo(mapRef.current);
      }
    }
  };

  // Track camera without causing rerenders during drag
  const centerRef = useRef(initialCenterRef.current);
  const zoomRef = useRef(initialZoomRef.current);
  const handleMove = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    centerRef.current = map.getCenter();
    zoomRef.current = map.getZoom() ?? 8;
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
    });

    addCurrentLocationMarker();
    mapRef.current.on('move', handleMove);

    return () => {
      mapRef.current?.off('move', handleMove);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Use ref to get current locationData without it being a dependency
    const currentData = locationDataRef.current;

    // Add location markers
    const locationMarkers: mapboxgl.Marker[] = [];
    if (showLocationHistory && currentData.locationHistory) {
      currentData.locationHistory.forEach((entry: LocationHistory) => {
        const { lng, lat } = entry.location.coords;
        const markerEl = generateLocationMarker();
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          createLocationPopupHTML(entry),
        );
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
        locationMarkers.push(marker);
      });
    }

    // Add residence markers
    const residenceMarkers: mapboxgl.Marker[] = [];
    if (showResidenceHistory && currentData.residenceHistory) {
      currentData.residenceHistory.forEach((residence) => {
        const { lng, lat } = residence.location.coords;
        const markerEl = generateResidenceMarker(!residence.endDate);
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          createResidencePopupHTML(residence),
        );
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
        residenceMarkers.push(marker);
      });
    }

    return () => {
      locationMarkers.forEach((marker) => marker.remove());
      residenceMarkers.forEach((marker) => marker.remove());
    };
  }, [showLocationHistory, showResidenceHistory]);

  const changeStyle = (newStyle: string) => {
    if (mapRef.current) {
      setMapStyle(newStyle);
      mapRef.current.setStyle(newStyle);
    }
  };

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
        center: { ...locationData.currentLocation.coords },
        zoom: 8,
      });
    }
  };

  return (
    <div className={`relative w-full h-screen max-h-[70vh] map`}>
      <div ref={mapContainerRef} className="h-full" />
      <div className="pointer-events-none absolute top-0 left-0 m-3 px-3 py-1.5 bg-slate-700/90 text-white font-mono rounded z-10">
        Longitude: {centerRef.current.lng?.toFixed(4) ?? '...'} | Latitude:{' '}
        {centerRef.current.lat?.toFixed(4) ?? '...'} | Zoom:{' '}
        {zoomRef.current?.toFixed(2) ?? '...'}
      </div>
      <div className="absolute bottom-0 left-0 right-0 w-full flex justify-between items-end p-4 z-10">
        <Legend
          showResidenceHistory={showResidenceHistory}
          showLocationHistory={showLocationHistory}
          setShowResidenceHistoryAction={() =>
            setShowResidenceHistory(!showResidenceHistory)
          }
          setShowLocationHistoryAction={() =>
            setShowLocationHistory(!showLocationHistory)
          }
        />
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
