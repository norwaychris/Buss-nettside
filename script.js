/* =========================================================================
   BussBestill – bestilling av buss med kart, stoppesteder og prisberegning
   Kart: Leaflet + OpenStreetMap · Søk: Nominatim · Ruter: OSRM
   ========================================================================= */

'use strict';

/* ---------- Prismodell (juster fritt) ------------------------------------ */
const PRICING = {
  base: 900,          // grunnpris (kr)
  perKm: 22,          // kr per kjørte km
  perExtraStop: 150,  // kr per stopp utover hentested + reisemål
  perPassenger: 35,   // kr per passasjer utover 10
  freePassengers: 10, // antall passasjerer inkludert i grunnprisen
  vatIncluded: true
};

/* ---------- Tilstand ----------------------------------------------------- */
let stops = [];            // [{ id, lat, lng, label, marker }]
let routeLayer = null;     // Leaflet-lag for tegnet rute
let lastDistanceKm = 0;    // km fra siste ruteberegning
let lastDurationMin = 0;   // minutter fra siste ruteberegning
let routeSeq = 0;          // sekvensnummer for å ignorere utdaterte ruteberegninger

/* ---------- Kart --------------------------------------------------------- */
const map = L.map('map').setView([59.9139, 10.7522], 12); // Oslo som start

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap-bidragsytere'
}).addTo(map);

map.on('click', (e) => {
  addStop(e.latlng.lat, e.latlng.lng);
});

/* ---------- DOM-referanser ---------------------------------------------- */
const el = {
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),
  searchResults: document.getElementById('search-results'),
  stopsList: document.getElementById('stops-list'),
  stopsEmpty: document.getElementById('stops-empty'),
  clearStops: document.getElementById('clear-stops'),
  routeInfo: document.getElementById('route-info'),
  routeDistance: document.getElementById('route-distance'),
  routeDuration: document.getElementById('route-duration'),
  form: document.getElementById('booking-form'),
  bookBtn: document.getElementById('book-btn'),
  passengers: document.getElementById('passengers'),
  returnTrip: document.getElementById('return-trip'),
  // pris
  pBase: document.getElementById('p-base'),
  pDistance: document.getElementById('p-distance'),
  pDistanceLabel: document.getElementById('p-distance-label'),
  pStops: document.getElementById('p-stops'),
  pStopsLabel: document.getElementById('p-stops-label'),
  pPassengers: document.getElementById('p-passengers'),
  pPassengersLabel: document.getElementById('p-passengers-label'),
  pTotal: document.getElementById('p-total'),
  // bekreftelse
  overlay: document.getElementById('confirm-overlay'),
  confirmContact: document.getElementById('confirm-contact'),
  confirmSummary: document.getElementById('confirm-summary'),
  confirmClose: document.getElementById('confirm-close')
};

/* ---------- Hjelpefunksjoner --------------------------------------------- */
const kr = (n) => Math.round(n).toLocaleString('no-NO') + ' kr';

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 +
            Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Sett dagens dato som standard og minimum i datofeltet */
(function initDate() {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  const dateEl = document.getElementById('date');
  dateEl.value = iso;
  dateEl.min = iso;
})();

/* ---------- Stoppesteder ------------------------------------------------- */
function addStop(lat, lng, presetLabel) {
  const id = Date.now() + Math.random();
  const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  const stop = { id, lat, lng, label: presetLabel || 'Henter adresse …', marker };

  marker.on('dragend', () => {
    const p = marker.getLatLng();
    stop.lat = p.lat;
    stop.lng = p.lng;
    stop.label = 'Henter adresse …';
    reverseGeocode(stop);
    renderStops();
    updateRoute();
  });
  marker.on('click', () => removeStop(id));

  stops.push(stop);
  if (!presetLabel) reverseGeocode(stop);
  renderStops();
  updateRoute();
}

function removeStop(id) {
  const idx = stops.findIndex(s => s.id === id);
  if (idx === -1) return;
  map.removeLayer(stops[idx].marker);
  stops.splice(idx, 1);
  renderStops();
  updateRoute();
}

function clearAllStops() {
  stops.forEach(s => map.removeLayer(s.marker));
  stops = [];
  renderStops();
  updateRoute();
}

function renderStops() {
  el.stopsList.innerHTML = '';
  el.stopsEmpty.hidden = stops.length > 0;
  el.clearStops.hidden = stops.length === 0;

  stops.forEach((stop, i) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = stop.id;

    let badgeClass = 'stop-badge';
    let badgeText = i + 1;
    if (i === 0) { badgeClass += ' start'; badgeText = 'A'; }
    else if (i === stops.length - 1 && stops.length > 1) { badgeClass += ' end'; badgeText = 'B'; }

    let role = 'Stopp';
    if (i === 0) role = 'Hentested';
    else if (i === stops.length - 1 && stops.length > 1) role = 'Reisemål';

    li.innerHTML = `
      <span class="${badgeClass}">${badgeText}</span>
      <span class="stop-text"><strong>${role}:</strong> ${escapeHtml(stop.label)}</span>
      <button type="button" class="stop-remove" title="Fjern stopp" aria-label="Fjern stopp">×</button>
    `;
    li.querySelector('.stop-remove').addEventListener('click', () => removeStop(stop.id));

    // Marker-etikett
    stop.marker.bindTooltip(`${badgeText} · ${role}`, { permanent: false });

    // Dra-og-slipp for rekkefølge
    li.addEventListener('dragstart', () => li.classList.add('dragging'));
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      commitOrderFromDom();
    });
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      const dragging = el.stopsList.querySelector('.dragging');
      if (!dragging || dragging === li) return;
      const rect = li.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      el.stopsList.insertBefore(dragging, after ? li.nextSibling : li);
    });

    el.stopsList.appendChild(li);
  });
}

function commitOrderFromDom() {
  const ids = [...el.stopsList.querySelectorAll('li')].map(li => Number(li.dataset.id) || li.dataset.id);
  const byId = new Map(stops.map(s => [String(s.id), s]));
  const reordered = ids.map(id => byId.get(String(id))).filter(Boolean);
  if (reordered.length === stops.length) {
    stops = reordered;
    renderStops();
    updateRoute();
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---------- Adressesøk (Nominatim) --------------------------------------- */
async function searchAddress(query) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=no&q='
              + encodeURIComponent(query);
  const res = await fetch(url, { headers: { 'Accept-Language': 'no' } });
  if (!res.ok) throw new Error('Søk feilet');
  return res.json();
}

async function reverseGeocode(stop) {
  try {
    const url = 'https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&lat='
                + stop.lat + '&lon=' + stop.lng;
    const res = await fetch(url, { headers: { 'Accept-Language': 'no' } });
    const data = await res.json();
    stop.label = shortLabel(data.display_name) || `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`;
  } catch {
    stop.label = `${stop.lat.toFixed(4)}, ${stop.lng.toFixed(4)}`;
  }
  renderStops();
}

function shortLabel(displayName) {
  if (!displayName) return '';
  return displayName.split(',').slice(0, 3).join(',').trim();
}

function showSearchResults(results) {
  el.searchResults.innerHTML = '';
  if (!results.length) {
    el.searchResults.hidden = true;
    return;
  }
  results.forEach(r => {
    const li = document.createElement('li');
    li.textContent = shortLabel(r.display_name);
    li.addEventListener('click', () => {
      const lat = parseFloat(r.lat);
      const lng = parseFloat(r.lon);
      addStop(lat, lng, shortLabel(r.display_name));
      map.setView([lat, lng], 14);
      el.searchResults.hidden = true;
      el.searchInput.value = '';
    });
    el.searchResults.appendChild(li);
  });
  el.searchResults.hidden = false;
}

async function runSearch() {
  const q = el.searchInput.value.trim();
  if (!q) return;
  el.searchBtn.textContent = '…';
  try {
    const results = await searchAddress(q);
    showSearchResults(results);
  } catch {
    alert('Kunne ikke søke akkurat nå. Prøv igjen, eller klikk i kartet.');
  } finally {
    el.searchBtn.textContent = 'Søk';
  }
}

el.searchBtn.addEventListener('click', runSearch);
el.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
});
el.clearStops.addEventListener('click', clearAllStops);

/* ---------- Ruteberegning (OSRM) ----------------------------------------- */
async function updateRoute() {
  const seq = ++routeSeq;

  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }

  if (stops.length < 2) {
    lastDistanceKm = 0;
    lastDurationMin = 0;
    el.routeInfo.hidden = true;
    updatePrice();
    validateForm();
    return;
  }

  const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (seq !== routeSeq) return; // en nyere beregning har startet

    if (data.routes && data.routes.length) {
      const route = data.routes[0];
      lastDistanceKm = route.distance / 1000;
      lastDurationMin = route.duration / 60;

      const latlngs = route.geometry.coordinates.map(c => [c[1], c[0]]);
      routeLayer = L.polyline(latlngs, { color: '#1e6bd6', weight: 5, opacity: 0.75 }).addTo(map);
      map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
    } else {
      throw new Error('Ingen rute');
    }
  } catch {
    if (seq !== routeSeq) return;
    // Fallback: rett linje + luftavstand hvis rutetjenesten ikke svarer
    fallbackStraightLine();
  }

  showRouteInfo();
  updatePrice();
  validateForm();
}

function fallbackStraightLine() {
  let dist = 0;
  for (let i = 1; i < stops.length; i++) {
    dist += haversineKm(stops[i - 1], stops[i]);
  }
  lastDistanceKm = dist * 1.3; // grov korreksjon for veinettet
  lastDurationMin = (lastDistanceKm / 60) * 60; // anta ~60 km/t
  const latlngs = stops.map(s => [s.lat, s.lng]);
  routeLayer = L.polyline(latlngs, {
    color: '#1e6bd6', weight: 4, opacity: 0.6, dashArray: '8 8'
  }).addTo(map);
  map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
}

function showRouteInfo() {
  el.routeDistance.textContent = lastDistanceKm.toFixed(1) + ' km';
  const h = Math.floor(lastDurationMin / 60);
  const m = Math.round(lastDurationMin % 60);
  el.routeDuration.textContent = (h > 0 ? `${h} t ${m} min` : `${m} min`);
  el.routeInfo.hidden = false;
}

/* ---------- Prisberegning ------------------------------------------------ */
function computePrice() {
  const passengers = Math.max(1, parseInt(el.passengers.value, 10) || 1);
  const roundTrip = el.returnTrip.checked;
  const tripMultiplier = roundTrip ? 2 : 1;

  const distanceKm = lastDistanceKm * tripMultiplier;
  const extraStops = Math.max(0, stops.length - 2);
  const extraPassengers = Math.max(0, passengers - PRICING.freePassengers);

  const base = PRICING.base;
  const distanceCost = distanceKm * PRICING.perKm;
  const stopsCost = extraStops * PRICING.perExtraStop;
  const passengerCost = extraPassengers * PRICING.perPassenger;
  const total = base + distanceCost + stopsCost + passengerCost;

  return {
    base, distanceCost, stopsCost, passengerCost, total,
    distanceKm, extraStops, extraPassengers, passengers, roundTrip
  };
}

function updatePrice() {
  if (stops.length < 2) {
    el.pBase.textContent = '–';
    el.pDistance.textContent = '–';
    el.pStops.textContent = '–';
    el.pPassengers.textContent = '–';
    el.pTotal.textContent = '–';
    return;
  }
  const p = computePrice();
  el.pBase.textContent = kr(p.base);
  el.pDistanceLabel.textContent = `Distanse (${p.distanceKm.toFixed(1)} km${p.roundTrip ? ', t/r' : ''})`;
  el.pDistance.textContent = kr(p.distanceCost);
  el.pStopsLabel.textContent = `Ekstra stopp (${p.extraStops})`;
  el.pStops.textContent = kr(p.stopsCost);
  el.pPassengersLabel.textContent = `Passasjertillegg (${p.extraPassengers})`;
  el.pPassengers.textContent = kr(p.passengerCost);
  el.pTotal.textContent = kr(p.total);
}

el.passengers.addEventListener('input', updatePrice);
el.returnTrip.addEventListener('change', () => { updatePrice(); showRouteInfo(); });

/* ---------- Skjemavalidering og bestilling ------------------------------- */
function validateForm() {
  const hasRoute = stops.length >= 2;
  const filled = ['name', 'contact', 'date', 'time', 'passengers']
    .every(id => document.getElementById(id).value.trim() !== '');
  el.bookBtn.disabled = !(hasRoute && filled);
}

el.form.addEventListener('input', validateForm);

el.form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (stops.length < 2) return;

  const p = computePrice();
  const name = document.getElementById('name').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

  const rows = [
    ['Navn', name],
    ['Kontakt', contact],
    ['Dato', `${date} kl. ${time}`],
    ['Passasjerer', String(p.passengers)],
    ['Reise', p.roundTrip ? 'Tur/retur' : 'Én vei'],
    ['Antall stopp', String(stops.length)],
    ['Distanse', `${p.distanceKm.toFixed(1)} km`],
    ['Totalpris', kr(p.total)]
  ];

  el.confirmContact.textContent = contact;
  el.confirmSummary.innerHTML = rows.map(([l, v]) =>
    `<div><span class="label">${escapeHtml(l)}</span><span>${escapeHtml(v)}</span></div>`
  ).join('');
  el.overlay.hidden = false;
});

el.confirmClose.addEventListener('click', () => { el.overlay.hidden = true; });
el.overlay.addEventListener('click', (e) => {
  if (e.target === el.overlay) el.overlay.hidden = true;
});

/* ---------- Oppstart ----------------------------------------------------- */
renderStops();
updatePrice();
validateForm();
