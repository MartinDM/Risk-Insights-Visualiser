'use client';
export function MapOverlay({
  center,
  zoom,
}: {
  center: mapboxgl.LngLat | null;
  zoom: number | null;
}) {
  if (!center) return null;
  return (
    <div className="absolute top-0 left-0 m-3 px-3 py-1.5 bg-slate-700/90 text-white font-mono rounded z-10">
      Longitude: {center?.lng?.toFixed(4) ?? '...'} | Latitude:{' '}
      {center.lat?.toFixed(4) ?? '...'} | Zoom: {zoom?.toFixed(2) ?? '...'}
    </div>
  );
}
