import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Bus as BusIcon, Pencil, Trash2, Users } from 'lucide-react';
import { Bus } from '../types';

interface BusListProps {
  buses: Bus[];
  onUpdateBus: (id: string, bus: Bus) => void;
  onDeleteBus: (id: string) => void;
}

export function BusList({ buses, onUpdateBus, onDeleteBus }: BusListProps) {
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editStatus, setEditStatus] = useState<'en-servicio' | 'fuera-servicio'>('en-servicio');
  const [isOpen, setIsOpen] = useState(false);

  const handleEdit = (bus: Bus) => {
    setEditingBus(bus);
    setEditName(bus.name);
    setEditCapacity(bus.capacity.toString());
    setEditStatus(bus.status);
    setIsOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus || !editName || !editCapacity) return;

    onUpdateBus(editingBus.id, {
      ...editingBus,
      name: editName,
      capacity: parseInt(editCapacity),
      status: editStatus
    });

    setIsOpen(false);
    setEditingBus(null);
  };

  if (buses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <BusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay buses registrados. Agrega tu primer bus arriba.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Buses Registrados ({buses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BusIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-gray-900">{bus.name}</h3>
                  </div>
                  <Badge variant={bus.status === 'en-servicio' ? 'default' : 'destructive'}>
                    {bus.status === 'en-servicio' ? 'En Servicio' : 'Fuera de Servicio'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{bus.capacity} pasajeros</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(bus)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteBus(bus.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Bus</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre/Número del Bus</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacidad</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select value={editStatus} onValueChange={(value: 'en-servicio' | 'fuera-servicio') => setEditStatus(value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-servicio">En Servicio</SelectItem>
                  <SelectItem value="fuera-servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
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