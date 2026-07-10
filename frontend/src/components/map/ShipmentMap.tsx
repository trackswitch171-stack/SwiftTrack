import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Globe, Navigation, Satellite, Map } from 'lucide-react';
import { Shipment } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
    shipment: Shipment;
}

// ── Tile layer URLs ──────────────────────────────────────
const TILES = {
    street: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
            '© <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    },
    satellite: {
        // ESRI World Imagery — free, no API key, high-res satellite
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution:
            'Tiles © <a href="https://www.esri.com/">Esri</a> — ' +
            'Source: Esri, Maxar, Earthstar Geographics',
        subdomains: '',
        maxZoom: 19,
    },
    // Label overlay on top of satellite so country/city names show in English
    satelliteLabels: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        attribution: '',
        subdomains: 'abcd',
        maxZoom: 19,
    },
};

// ── Icon helpers ─────────────────────────────────────────
function makeIcon(color: string, label: string) {
    return L.divIcon({
        className: '',
        html: `<div style="width:36px;height:44px">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
                <path d="M18 0C8.059 0 0 8.059 0 18c0 11.25 18 26 18 26S36 29.25 36 18C36 8.059 27.941 0 18 0z" fill="${color}"/>
                <circle cx="18" cy="18" r="9" fill="white"/>
                <text x="18" y="22" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold" font-family="sans-serif">${label}</text>
            </svg></div>`,
        iconSize: [36, 44],
        iconAnchor: [18, 44],
        popupAnchor: [0, -48],
    });
}

function makePackageIcon() {
    return L.divIcon({
        className: '',
        html: `<div style="width:42px;height:50px">
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="50" viewBox="0 0 42 50">
                <path d="M21 0C9.402 0 0 9.402 0 21c0 13.125 21 29 21 29S42 34.125 42 21C42 9.402 32.598 0 21 0z" fill="#F97316"/>
                <circle cx="21" cy="21" r="11" fill="white"/>
                <text x="21" y="26" text-anchor="middle" font-size="16">📦</text>
            </svg></div>`,
        iconSize: [42, 50],
        iconAnchor: [21, 50],
        popupAnchor: [0, -54],
    });
}

// ── Routing helpers ──────────────────────────────────────
async function fetchRoadRoute(
    from: [number, number],
    to: [number, number]
): Promise<[number, number][] | null> {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${from[1]},${from[0]};${to[1]},${to[0]}` +
            `?overview=full&geometries=geojson&steps=false`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes?.[0]) return null;
        return (data.routes[0].geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng]
        );
    } catch { return null; }
}

function greatCircleArc(from: [number, number], to: [number, number], steps = 60): [number, number][] {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;
    const lat1 = toRad(from[0]), lon1 = toRad(from[1]);
    const lat2 = toRad(to[0]), lon2 = toRad(to[1]);
    const d = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin((lat2 - lat1) / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon2 - lon1) / 2), 2)
    ));
    if (d === 0) return [from, to];
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
        const f = i / steps;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        points.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
    }
    return points;
}

function distanceKm(a: [number, number], b: [number, number]): number {
    const R = 6371;
    const dLat = ((b[0] - a[0]) * Math.PI) / 180;
    const dLon = ((b[1] - a[1]) * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function getRouteStyle(mode: string) {
    if (mode === 'air') {
        return { color: '#f97316', weight: 4, opacity: 0.85, dashArray: '8 8', lineCap: 'round' };
    }
    if (mode === 'sea') {
        return { color: '#0ea5e9', weight: 4, opacity: 0.75, dashArray: '4 8', lineCap: 'round' };
    }
    return { color: '#2563EB', weight: 4, opacity: 0.95, dashArray: '0', lineCap: 'round' };
}

function getRouteLabel(mode: string, usedRoads: boolean) {
    if (mode === 'air') return 'Air route';
    if (mode === 'sea') return 'Sea route';
    if (mode === 'rail') return 'Rail route';
    if (mode === 'land') return usedRoads ? 'Road route' : 'Land path';
    return 'Route';
}

// ── Component ────────────────────────────────────────────
export default function ShipmentMap({ shipment }: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const streetLayerRef = useRef<L.TileLayer | null>(null);
    const satLayerRef = useRef<L.TileLayer | null>(null);
    const satLabelsRef = useRef<L.TileLayer | null>(null);

    const [isSatellite, setIsSatellite] = useState(false);
    const [routeType, setRouteType] = useState<string | null>(null);

    // ── Satellite toggle (no map rebuild) ───────────────
    const toggleSatellite = useCallback(() => {
        const map = leafletMap.current;
        if (!map) return;

        setIsSatellite(prev => {
            const goSat = !prev;
            if (goSat) {
                // Switch to satellite
                if (streetLayerRef.current) map.removeLayer(streetLayerRef.current);
                if (!satLayerRef.current) {
                    satLayerRef.current = L.tileLayer(TILES.satellite.url, {
                        attribution: TILES.satellite.attribution,
                        maxZoom: TILES.satellite.maxZoom,
                    });
                }
                if (!satLabelsRef.current) {
                    satLabelsRef.current = L.tileLayer(TILES.satelliteLabels.url, {
                        attribution: '',
                        subdomains: 'abcd',
                        maxZoom: TILES.satelliteLabels.maxZoom,
                        opacity: 1,
                        pane: 'overlayPane',
                    });
                }
                satLayerRef.current.addTo(map);
                satLabelsRef.current.addTo(map);
            } else {
                // Switch back to street
                if (satLayerRef.current) map.removeLayer(satLayerRef.current);
                if (satLabelsRef.current) map.removeLayer(satLabelsRef.current);
                if (streetLayerRef.current) streetLayerRef.current.addTo(map);
            }
            return goSat;
        });
    }, []);

    // ── Build map on shipment change ─────────────────────
    useEffect(() => {
        if (!mapRef.current) return;

        if (leafletMap.current) {
            leafletMap.current.remove();
            leafletMap.current = null;
        }
        streetLayerRef.current = null;
        satLayerRef.current = null;
        satLabelsRef.current = null;
        setIsSatellite(false);
        setRouteType(null);

        // Waypoints
        const waypoints: [number, number][] = [];
        if (shipment.originLat && shipment.originLng)
            waypoints.push([shipment.originLat, shipment.originLng]);
        if (shipment.trackingUpdates) {
            [...shipment.trackingUpdates]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .forEach(u => { if (u.lat && u.lng) waypoints.push([u.lat, u.lng]); });
        }
        if (shipment.destinationLat && shipment.destinationLng)
            waypoints.push([shipment.destinationLat, shipment.destinationLng]);

        const center: [number, number] =
            shipment.currentLat && shipment.currentLng
                ? [shipment.currentLat, shipment.currentLng]
                : waypoints[0] ?? [25.0, 55.0];

        // Create map
        const map = L.map(mapRef.current, { center, zoom: 3, zoomControl: true });
        leafletMap.current = map;

        // Default street layer
        const streetLayer = L.tileLayer(TILES.street.url, {
            attribution: TILES.street.attribution,
            subdomains: TILES.street.subdomains,
            maxZoom: TILES.street.maxZoom,
        }).addTo(map);
        streetLayerRef.current = streetLayer;

        // Markers
        if (shipment.originLat && shipment.originLng)
            L.marker([shipment.originLat, shipment.originLng], { icon: makeIcon('#0B3D91', 'O') })
                .addTo(map)
                .bindPopup(`<b>📍 Origin</b><br/>${shipment.originCity}, ${shipment.originCountry}`);

        if (shipment.currentLat && shipment.currentLng)
            L.marker([shipment.currentLat, shipment.currentLng], { icon: makePackageIcon() })
                .addTo(map)
                .bindPopup(`<b>📦 Current Location</b><br/>${shipment.currentCity}, ${shipment.currentCountry}`);

        if (shipment.destinationLat && shipment.destinationLng)
            L.marker([shipment.destinationLat, shipment.destinationLng], { icon: makeIcon('#16A34A', 'D') })
                .addTo(map)
                .bindPopup(`<b>🏁 Destination</b><br/>${shipment.destinationCity}, ${shipment.destinationCountry}`);

        if (waypoints.length > 0)
            map.fitBounds(L.latLngBounds(waypoints), { padding: [55, 55] });

        if (waypoints.length < 2) return;

        // Route drawing
        let cancelled = false;
        (async () => {
            const allCoords: [number, number][] = [];
            let usedRoads = false;
            const mode = shipment.transportMode || 'land';

            for (let i = 0; i < waypoints.length - 1; i++) {
                const from = waypoints[i], to = waypoints[i + 1];
                let seg: [number, number][] | null = null;
                if (mode === 'land' && distanceKm(from, to) < 2500) {
                    seg = await fetchRoadRoute(from, to);
                    if (seg) usedRoads = true;
                }
                if (!seg) seg = greatCircleArc(from, to);
                if (allCoords.length > 0) seg = seg.slice(1);
                allCoords.push(...seg);
            }

            if (cancelled || !leafletMap.current) return;

            const currentIdx = (() => {
                if (!shipment.currentLat || !shipment.currentLng) return allCoords.length;
                let best = 0, bestDist = Infinity;
                allCoords.forEach(([lat, lng], idx) => {
                    const d = Math.abs(lat - shipment.currentLat!) + Math.abs(lng - shipment.currentLng!);
                    if (d < bestDist) { bestDist = d; best = idx; }
                });
                return best;
            })();

            const travelled = allCoords.slice(0, currentIdx + 1);
            const remaining = allCoords.slice(currentIdx);
            const routeStyle = getRouteStyle(shipment.transportMode || 'land');
            const routeLabel = getRouteLabel(shipment.transportMode || 'land', usedRoads);

            if (remaining.length >= 2)
                L.polyline(remaining, { ...routeStyle, opacity: 0.5 })
                    .addTo(leafletMap.current);

            if (travelled.length >= 2) {
                L.polyline(travelled, routeStyle)
                    .addTo(leafletMap.current);

                const step = Math.max(1, Math.floor(travelled.length / 7));
                for (let i = step; i < travelled.length - 1; i += step) {
                    const [lat1, lng1] = travelled[i];
                    const [lat2, lng2] = travelled[i + 1];
                    const angle = (Math.atan2(lat2 - lat1, lng2 - lng1) * 180) / Math.PI;
                    L.marker([lat1, lng1], {
                        icon: L.divIcon({
                            className: '',
                            html: `<div style="width:16px;height:16px;transform:rotate(${-angle + 90}deg);color:${routeStyle.color};font-size:16px;line-height:1">▲</div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        }),
                        interactive: false,
                    }).addTo(leafletMap.current!);
                }
            }

            if (!cancelled) setRouteType(routeLabel);

                const step = Math.max(1, Math.floor(travelled.length / 7));
                for (let i = step; i < travelled.length - 1; i += step) {
                    const [lat1, lng1] = travelled[i];
                    const [lat2, lng2] = travelled[i + 1];
                    const angle = (Math.atan2(lat2 - lat1, lng2 - lng1) * 180) / Math.PI;
                    L.marker([lat1, lng1], {
                        icon: L.divIcon({
                            className: '',
                            html: `<div style="width:16px;height:16px;transform:rotate(${-angle + 90}deg);color:#2563EB;font-size:16px;line-height:1">▲</div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        }),
                        interactive: false,
                    }).addTo(leafletMap.current!);
                }
            }

            if (!cancelled) setRouteType(usedRoads ? 'road' : 'arc');
        })();

        return () => {
            cancelled = true;
            map.remove();
            leafletMap.current = null;
        };
    }, [shipment]);

    return (
        <div className="card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#0B3D91]" />
                    Live Shipment Route
                </h3>
                <div className="flex items-center gap-3">
                    {routeType && (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{routeType}</span>
                        </div>
                    )}
                    <div className="hidden sm:flex gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0B3D91]" /><span>Origin</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span>Current</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-600" /><span>Destination</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map container — button lives inside so it floats over the map */}
            <div className="relative">
                <div ref={mapRef} style={{ height: '480px', width: '100%' }} />

                {/* Satellite / Street toggle button */}
                <button
                    onClick={toggleSatellite}
                    title={isSatellite ? 'Switch to Street view' : 'Switch to Satellite view'}
                    className={`
                        absolute top-3 right-3 z-[1000]
                        flex items-center gap-2 px-3 py-2 rounded-xl
                        text-xs font-semibold shadow-lg
                        border transition-all duration-200
                        ${isSatellite
                            ? 'bg-white text-[#0B3D91] border-blue-200 hover:bg-blue-50'
                            : 'bg-[#0B3D91] text-white border-[#0B3D91] hover:bg-[#0a2e6e]'
                        }
                    `}
                >
                    {isSatellite
                        ? <><Map className="w-3.5 h-3.5" /> Street View</>
                        : <><Satellite className="w-3.5 h-3.5" /> Satellite</>
                    }
                </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0B3D91]" />
                    <span>
                        {shipment.originCity}, {shipment.originCountry}
                        {shipment.currentCity ? ` → ${shipment.currentCity}, ${shipment.currentCountry}` : ''}
                        {' → '}{shipment.destinationCity}, {shipment.destinationCountry}
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-0.5 bg-[#2563EB]" />
                        <span>Travelled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 border-t-2 border-dashed border-slate-400" />
                        <span>Remaining</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
