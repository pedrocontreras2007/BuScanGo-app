import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { MapPin, Pencil, Trash2, Clock, Navigation, Plus, Trash } from 'lucide-react';
import { Bus, BusRoute, RouteStop } from '../types';

interface RouteListProps {
  routes: BusRoute[];
  buses: Bus[];
  onUpdateRoute: (id: string, route: BusRoute) => void;
  onDeleteRoute: (id: string) => void;
}

export function RouteList({ routes, buses, onUpdateRoute, onDeleteRoute }: RouteListProps) {
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editBusId, setEditBusId] = useState('');
  const [editStops, setEditStops] = useState<RouteStop[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const getBusName = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    return bus ? bus.name : 'Bus no encontrado';
  };

  const handleEdit = (route: BusRoute) => {
    setEditingRoute(route);
    setEditRouteName(route.routeName);
    setEditBusId(route.busId);
    setEditStops([...route.stops]);
    setIsOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute || !editRouteName || !editBusId || editStops.length < 2) return;

    const validStops = editStops.filter(stop => 
      stop.location.trim() !== '' && 
      stop.arrivalTime !== '' && 
      stop.departureTime !== ''
    );

    if (validStops.length < 2) {
      alert('Debes tener al menos 2 paradas completas');
      return;
    }

    onUpdateRoute(editingRoute.id, {
      ...editingRoute,
      routeName: editRouteName,
      busId: editBusId,
      stops: validStops
    });

    setIsOpen(false);
    setEditingRoute(null);
  };

  const addEditStop = () => {
    const newStop: RouteStop = {
      id: Date.now().toString(),
      location: '',
      arrivalTime: '',
      departureTime: ''
    };
    setEditStops([...editStops, newStop]);
  };

  const removeEditStop = (id: string) => {
    if (editStops.length > 1) {
      setEditStops(editStops.filter(stop => stop.id !== id));
    }
  };

  const updateEditStop = (id: string, field: keyof RouteStop, value: string) => {
    setEditStops(editStops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  if (routes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay recorridos registrados. Agrega tu primer recorrido arriba.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recorridos Registrados ({routes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900">{route.routeName}</h3>
                      <Badge variant="outline" className="text-blue-700 border-blue-300">
                        {getBusName(route.busId)}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{route.stops.length} paradas</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(route)}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteRoute(route.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start gap-3 pl-4 border-l-2 border-blue-300">
                      <div className="flex-shrink-0 mt-1">
                        {index === 0 ? (
                          <MapPin className="w-4 h-4 text-green-600" />
                        ) : index === route.stops.length - 1 ? (
                          <Navigation className="w-4 h-4 text-red-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900">{stop.location}</p>
                        <div className="flex gap-4 text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Llegada: {stop.arrivalTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Salida: {stop.departureTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Recorrido</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-route-name">Nombre del Recorrido</Label>
                <Input
                  id="edit-route-name"
                  value={editRouteName}
                  onChange={(e) => setEditRouteName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bus-select">Bus Asignado</Label>
                <Select value={editBusId} onValueChange={setEditBusId} required>
                  <SelectTrigger id="edit-bus-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.filter(bus => bus.status === 'en-servicio').map((bus) => (
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
                <Label>Paradas del Recorrido</Label>
                <Button type="button" variant="outline" size="sm" onClick={addEditStop}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Parada
                </Button>
              </div>

              <div className="space-y-3">
                {editStops.map((stop, index) => (
                  <div key={stop.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">Parada {index + 1}</span>
                      {editStops.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditStop(stop.id)}
                          className="ml-auto"
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-location-${stop.id}`}>Ubicación</Label>
                        <Input
                          id={`edit-location-${stop.id}`}
                          placeholder="Ej: Terminal Norte"
                          value={stop.location}
                          onChange={(e) => updateEditStop(stop.id, 'location', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-arrival-${stop.id}`}>Hora de Llegada</Label>
                        <Input
                          id={`edit-arrival-${stop.id}`}
                          type="time"
                          value={stop.arrivalTime}
                          onChange={(e) => updateEditStop(stop.id, 'arrivalTime', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-departure-${stop.id}`}>Hora de Salida</Label>
                        <Input
                          id={`edit-departure-${stop.id}`}
                          type="time"
                          value={stop.departureTime}
                          onChange={(e) => updateEditStop(stop.id, 'departureTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
