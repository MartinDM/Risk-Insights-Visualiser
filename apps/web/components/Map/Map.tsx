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
import { MapOverlay } from '../MapOverlay/MapOverlay';

export function Map({ locationData }: { locationData: LocationInsights }) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const locationDataRef = useRef(locationData);
  const [zoom, setZoom] = useState<number>(8);
  const [center, setCenter] = useState<mapboxgl.LngLat>(
    new mapboxgl.LngLat(
      locationData.currentLocation.coords.lng,
      locationData.currentLocation.coords.lat,
    ),
  );
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isDark, setIsDark] = useState(false);
  const [showResidenceHistory, setShowResidenceHistory] = useState(true);
  const [showLocationHistory, setShowLocationHistory] = useState(true);

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
      zoom,
    });

    const map = mapRef.current;
    addCurrentLocationMarker();
    map.on('move', handleMove);

    return () => {
      map.off('move', handleMove);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

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
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: { ...locationData.currentLocation.coords },
      zoom: 8,
    });
  };

  return (
    <div className={`relative w-full h-screen max-h-[70vh] map`}>
      <div ref={mapContainerRef} className="h-full" />
      <MapOverlay center={center} zoom={zoom} />
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
