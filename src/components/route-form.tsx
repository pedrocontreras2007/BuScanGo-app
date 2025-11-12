import { ChangeEvent, FormEvent, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Plus, Trash2, Navigation } from 'lucide-react';
import { Bus, BusRoute, RouteStop } from '../types';

interface RouteFormProps {
  buses: Bus[];
  onAddRoute: (route: BusRoute) => void;
}

interface GeocodeResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export function RouteForm({ buses, onAddRoute }: RouteFormProps) {
  const [routeName, setRouteName] = useState('');
  const [busId, setBusId] = useState('');
  const [stops, setStops] = useState<RouteStop[]>([
    { id: '1', location: '', arrivalTime: '', departureTime: '' }
  ]);

  // Resultados de geocodificación por parada
  const [geoResults, setGeoResults] = useState<Record<string, GeocodeResult[]>>({});
  const [geoLoading, setGeoLoading] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!routeName || !busId || stops.length < 2) return;
    
    // Validar que todas las paradas tengan datos
    const validStops = stops.filter((stop) => 
      stop.location.trim() !== '' && 
      stop.arrivalTime !== '' && 
      stop.departureTime !== ''
    );
    
    if (validStops.length < 2) {
      alert('Debes agregar al menos 2 paradas completas');
      return;
    }

    const newRoute: BusRoute = {
      id: Date.now().toString(),
      busId,
      routeName,
      stops: validStops
    };

    onAddRoute(newRoute);
    setRouteName('');
    setBusId('');
    setStops([{ id: '1', location: '', arrivalTime: '', departureTime: '' }]);
  };

  const addStop = () => {
    const newStop: RouteStop = {
      id: Date.now().toString(),
      location: '',
      arrivalTime: '',
      departureTime: ''
    };
    setStops([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    if (stops.length > 1) {
      setStops(stops.filter(stop => stop.id !== id));
    }
  };

  // value puede ser string o number (para lat/lng)
  const updateStop = <K extends keyof RouteStop>(id: string, field: K, value: RouteStop[K]) => {
    setStops((prevStops) =>
      prevStops.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
    );
  };

  // Geocodificar usando Nominatim (OpenStreetMap). Guarda resultados en state para permitir selección.
  const geocodeStop = async (id: string, query: string) => {
    if (!query || query.trim() === '') return;
    setGeoLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          // Nominatim requiere un User-Agent or Referer identifying the application; browser will send origin.
          'Accept-Language': 'es'
        }
      });
      const data: GeocodeResult[] = await res.json();
      setGeoResults((prev) => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error('Error geocoding:', err);
      setGeoResults((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setGeoLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const selectGeocodeResult = (stopId: string, result: GeocodeResult) => {
    // result has lat, lon, display_name
    updateStop(stopId, 'location', result.display_name || '');
    updateStop(stopId, 'lat', parseFloat(result.lat));
    updateStop(stopId, 'lng', parseFloat(result.lon));
    setGeoResults((prev) => ({ ...prev, [stopId]: [] }));
  };

  const clearStopCoords = (stopId: string) => {
    updateStop(stopId, 'lat', undefined);
    updateStop(stopId, 'lng', undefined);
  };

  const availableBuses = buses.filter(bus => bus.status === 'en-servicio');

  if (buses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Primero debes agregar buses antes de crear recorridos.</p>
        </CardContent>
      </Card>
    );
  }

  if (availableBuses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay buses en servicio disponibles. Cambia el estado de un bus a "En Servicio" para crear recorridos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Agregar Nuevo Recorrido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Nombre del Recorrido</Label>
              <Input
                id="route-name"
                placeholder="Ej: Ruta Centro"
                value={routeName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setRouteName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-select">Bus Asignado (En Servicio)</Label>
              <Select value={busId} onValueChange={setBusId} required>
                <SelectTrigger id="bus-select">
                  <SelectValue placeholder="Selecciona un bus" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.name} ({bus.capacity} pasajeros)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Paradas del Recorrido (mínimo 2)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStop}>
                <Plus className="w-4 h-4 mr-1" />
                Agregar Parada
              </Button>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Parada {index + 1}</span>
                    {stops.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStop(stop.id)}
                        className="ml-auto"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`location-${stop.id}`}>Ubicación</Label>
                      <div>
                        <Input
                          id={`location-${stop.id}`}
                          placeholder="Ej: Terminal Norte"
                          value={stop.location}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            updateStop(stop.id, 'location', event.target.value)
                          }
                          required
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => geocodeStop(stop.id, stop.location || '')}
                          >
                            Buscar ubicación
                          </Button>
                          {stop.lat !== undefined && stop.lng !== undefined && (
                            <div className="text-sm text-gray-600">
                              {`(${stop.lat.toFixed(5)}, ${stop.lng.toFixed(5)})`}
                              <Button type="button" variant="ghost" size="sm" onClick={() => clearStopCoords(stop.id)} className="ml-2">
                                Quitar ubicación
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Mostrar resultados de geocodificación si existen */}
                        {geoLoading[stop.id] && (
                          <div className="mt-2 text-sm text-gray-500">Buscando...</div>
                        )}
                        {geoResults[stop.id] && geoResults[stop.id].length > 0 && (
                          <div className="mt-2 bg-white border rounded-md p-2 max-h-48 overflow-auto">
                            {geoResults[stop.id].map((result) => (
                              <div key={result.place_id} className="py-1 border-b last:border-b-0">
                                <div className="text-sm text-gray-800">{result.display_name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-xs text-gray-600">{`(${parseFloat(result.lat).toFixed(5)}, ${parseFloat(result.lon).toFixed(5)})`}</div>
                                  <Button type="button" size="sm" variant="outline" onClick={() => selectGeocodeResult(stop.id, result)}>
                                    Seleccionar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`arrival-${stop.id}`}>Hora de Llegada</Label>
                      <Input
                        id={`arrival-${stop.id}`}
                        type="time"
                        value={stop.arrivalTime}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          updateStop(stop.id, 'arrivalTime', event.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`departure-${stop.id}`}>Hora de Salida</Label>
                      <Input
                        id={`departure-${stop.id}`}
                        type="time"
                        value={stop.departureTime}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          updateStop(stop.id, 'departureTime', event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Crear Recorrido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
