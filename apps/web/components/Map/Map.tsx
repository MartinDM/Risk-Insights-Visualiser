'use client';
import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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

import styles from './map.module.scss';

import { Lightbulb, LightbulbOff } from 'lucide-react';

export function Map({ locationData }: { locationData: LocationInsights }) {
  const { lat, lng } = locationData?.currentLocation?.coords || { lat: 0, lng: 0 };

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(11);
  const [center, setCenter] = useState<[number, number]>([lng, lat]);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isDark, setIsDark] = useState(false);

  const [showResidenceHistory, setShowResidenceHistory] = useState(true);
  const [showLocationHistory, setShowLocationHistory] = useState(true);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    console.error('Missing Mapbox token');
    return;
  }
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

  const addResidenceMarkers = useCallback(() => {
    if (!mapRef.current || !locationData?.residenceHistory) () => {};

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
  }, [locationData?.residenceHistory, showResidenceHistory]);

  const addLocationMarkers = useCallback(() => {
    if (!mapRef.current) () => {};

    const markers: mapboxgl.Marker[] = [];

    if (showLocationHistory) {
      locationData.locationHistory.forEach((location) => {
        const { lng, lat } = location.location.coords;
        const markerEl = generateLocationMarker();
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          createLocationPopupHTML(location),
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
  }, [locationData?.locationHistory, showLocationHistory]);

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
          .addTo(mapRef.current!);
      }
      return () => {
        mapRef.current?.remove();
      };
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center,
      zoom,
    });

    const handleMove = () => {
      const c = mapRef.current!.getCenter();
      setCenter([c.lng, c.lat]);
      setZoom(mapRef.current!.getZoom());
    };
    mapRef.current.on('move', handleMove);

    addCurrentLocationMarker();

    return () => {
      mapRef.current?.off('move', handleMove);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cleanupLocation = addLocationMarkers();
    const cleanupResidence = addResidenceMarkers();
    return () => {
      cleanupLocation();
      cleanupResidence();
    };
  }, [addLocationMarkers, addResidenceMarkers]);

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
        center: [lng, lat],
        zoom,
      });
    }
  };

  return (
    <div
      className={`relative w-full h-screen max-h-[70vh] ${styles.map} ${isDark ? styles.mapDark : ''}`}
    >
      <div ref={mapContainerRef} className="h-full" />
      <div className="absolute top-0 left-0 m-3 px-3 py-1.5 bg-slate-700/90 text-white font-mono rounded z-10">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom:{' '}
        {zoom.toFixed(2)}
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
