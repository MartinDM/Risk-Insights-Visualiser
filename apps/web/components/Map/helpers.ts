import type {
  LocationHistory,
  LocationInsights,
  ResidenceHistory,
} from '../../app/types/person';

export function createCurrentLocationPopupHTML(
  location: LocationInsights['currentLocation'],
): string {
  return `
    <div style="padding: 8px;">
      <strong style="font-size: 12px; font-weight: bold; color: #666;">${location.city}, ${location.country}</strong><br/>
      <span style="font-size: 12px; color: #666;">
      Address: ${location.address || 'N/A'}<br/>
      Since: ${new Date(location.since).toLocaleDateString()}
      </span>
    </div>
  `;
}

export function createResidencePopupHTML(residence: ResidenceHistory): string {
  return `
    <div style="padding: 8px;">
      <strong style="font-size: 12px; font-weight: bold; color: #666;">${residence.location.city}, ${residence.location.country}</strong><br/>
      <span style="font-size: 12px; color: #666;">
        Residence Type: ${residence.residenceType}<br/>
        Started: ${new Date(residence.startDate).toLocaleDateString()}
        ${residence.endDate ? `<br/>Ended: ${new Date(residence.endDate).toLocaleDateString()}` : '<br/>Current'}
      </span>
    </div>
  `;
}

export function createLocationPopupHTML(location: LocationHistory): string {
  return `
    <div style="padding: 8px;">
      <strong style="font-size: 12px; font-weight: bold; color: #666;">${location.location.city}, ${location.location.country}</strong><br/>
      <span style="font-size: 12px; color: #666;">
        Confidence: ${location.confidence}<br/>
        Location Type: ${location.locationType}<br/>
        Postcode: ${location.location.postalCode || 'N/A'}<br/>
        Last seen: ${new Date(location.timestamp).toLocaleDateString()}
      </span>
    </div>
  `;
}

export function generateLocationMarker(): HTMLElement {
  const markerEl = document.createElement('div');
  markerEl.style.width = '32px';
  markerEl.style.height = '32px';
  markerEl.style.display = 'flex';
  markerEl.style.alignItems = 'center';
  markerEl.style.justifyContent = 'center';
  markerEl.style.backgroundColor = 'red';
  markerEl.style.borderRadius = '50%';
  markerEl.style.border = '2px solid black';
  markerEl.style.cursor = 'pointer';
  markerEl.innerHTML = `
   <svg xmlns="http://w<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed-icon lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>
  `;
  return markerEl;
}

export function generateResidenceMarker(isCurrent: boolean): HTMLElement {
  // Create a custom marker element with house icon
  const markerEl = document.createElement('div');
  markerEl.style.width = '32px';
  markerEl.style.height = '32px';
  markerEl.style.display = 'flex';
  markerEl.style.alignItems = 'center';
  markerEl.style.justifyContent = 'center';
  markerEl.style.backgroundColor = isCurrent ? 'green' : 'gray';
  markerEl.style.borderRadius = '50%';
  markerEl.style.border = '2px solid white';
  markerEl.style.cursor = 'pointer';
  markerEl.innerHTML = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    </svg>
        `;
  return markerEl;
}

export function generateCurrentLocationMarker(): HTMLElement {
  const markerEl = document.createElement('div');
  markerEl.style.width = '32px';
  markerEl.style.height = '32px';
  markerEl.style.display = 'flex';
  markerEl.style.alignItems = 'center';
  markerEl.style.justifyContent = 'center';
  markerEl.style.backgroundColor = 'cornflowerblue';
  markerEl.style.borderRadius = '50%';
  markerEl.style.border = '2px solid black';
  markerEl.style.cursor = 'pointer';
  markerEl.innerHTML = `
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target-icon lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  `;
  return markerEl;
}
