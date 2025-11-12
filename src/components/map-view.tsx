import { useEffect, useRef, useState } from 'react';
import L, { type LatLngExpression, type LayerGroup, type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, Bus as BusIcon } from 'lucide-react';
import { Bus, BusRoute } from '../types';

interface MapViewProps {
  routes: BusRoute[];
  buses: Bus[];
}

export function MapView({ routes, buses }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const routeLayerGroupRef = useRef<LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const container = mapRef.current;
    if (!container || mapInstanceRef.current) {
      return;
    }

    const map = L.map(container).setView([-29.9533, -71.3394], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Punto destacado: La Serena
    L.marker([-29.9027, -71.2519], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(map).bindPopup('<b>La Serena</b><br>Ciudad principal');

    // Punto destacado: Coquimbo
    L.marker([-29.9533, -71.3394], {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(map).bindPopup('<b>Coquimbo</b><br>Ciudad puerto');

    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    setMapReady(true);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    const invalidateTimeout = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(invalidateTimeout);
      setMapReady(false);
      routeLayerGroupRef.current = null;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayerGroup = routeLayerGroupRef.current;

    if (!map || !routeLayerGroup || !mapReady) {
      return;
    }

    routeLayerGroup.clearLayers();

    if (routes.length === 0) {
      return;
    }

    const referencePoints: Record<string, [number, number]> = {
      'terminal norte': [-29.8900, -71.2450],
      'terminal sur': [-29.9200, -71.2600],
      'centro la serena': [-29.9027, -71.2519],
      'centro coquimbo': [-29.9533, -71.3394],
      'plaza de armas': [-29.9027, -71.2519],
      'puerto': [-29.9600, -71.3450],
      'la herradura': [-29.9700, -71.3500],
      'peñuelas': [-29.9000, -71.3200],
      'estadio': [-29.9100, -71.2400],
      'universidad': [-29.9200, -71.2550]
    };

    const getCoordinates = (pointName: string): [number, number] => {
      const normalizedName = pointName.toLowerCase().trim();

      for (const [key, coords] of Object.entries(referencePoints)) {
        if (normalizedName.includes(key) || key.includes(normalizedName)) {
          return coords;
        }
      }

      const baseLat = -29.9027 + (Math.random() - 0.5) * 0.1;
      const baseLng = -71.2519 + (Math.random() - 0.5) * 0.15;
      return [baseLat, baseLng];
    };

    const routeColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

    routes.forEach((route, index) => {
      const bus = buses.find((candidate) => candidate.id === route.busId);
      const color = routeColors[index % routeColors.length];

      const stopCoordinates: LatLngExpression[] = route.stops.map((stop) => {
        if (typeof stop.lat === 'number' && typeof stop.lng === 'number') {
          return [stop.lat, stop.lng];
        }
        return getCoordinates(stop.location);
      });

      const polyline = L.polyline(stopCoordinates, {
        color,
        weight: 3,
        opacity: 0.7
      }).bindPopup(`
        <b>${route.routeName}</b><br>
        Bus: ${bus?.name || 'N/A'}<br>
        Paradas: ${route.stops.length}
      `);

      routeLayerGroup.addLayer(polyline);

      route.stops.forEach((stop, stopIndex) => {
        const coords = stopCoordinates[stopIndex];
        const isFirst = stopIndex === 0;
        const isLast = stopIndex === route.stops.length - 1;

        let iconHtml: string;

        if (isFirst) {
          iconHtml = `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                       <div style="background-color: white; width: 10px; height: 10px; border-radius: 50%;"></div>
                     </div>`;
        } else if (isLast) {
          iconHtml = `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                         <rect x="3" y="3" width="18" height="18" rx="2"/>
                       </svg>
                     </div>`;
        } else {
          iconHtml = `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`;
        }

        const marker = L.marker(coords, {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: isFirst || isLast ? [28, 28] as [number, number] : [20, 20] as [number, number],
            iconAnchor: isFirst || isLast ? [14, 14] as [number, number] : [10, 10] as [number, number]
          })
        }).bindPopup(`
          <b>${stop.location}</b><br>
          Llegada: ${stop.arrivalTime}<br>
          Salida: ${stop.departureTime}
          ${typeof stop.lat === 'number' && typeof stop.lng === 'number' ? `<br>Coords: (${stop.lat.toFixed(5)}, ${stop.lng.toFixed(5)})` : ''}
        `);

        routeLayerGroup.addLayer(marker);
      });
    });
  }, [mapReady, routes, buses]);

  const getBusName = (busId: string) => {
    const bus = buses.find((candidate) => candidate.id === busId);
    return bus ? bus.name : 'N/A';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa de Recorridos - La Serena y Coquimbo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200"
          />

          {routes.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-gray-600">Recorridos activos:</p>
              <div className="flex flex-wrap gap-2">
                {routes.map((route, index) => {
                  const colors = ['bg-red-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'];
                  const colorClass = colors[index % colors.length];
                  return (
                    <div key={route.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                      <div>
                        <span>{route.routeName}</span>
                        <span className="text-gray-500 ml-2">({getBusName(route.busId)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {routes.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center text-gray-600">
              <BusIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Agrega recorridos para verlos en el mapa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}