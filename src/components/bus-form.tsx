import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Bus as BusIcon, Plus } from 'lucide-react';
import { Bus } from '../types';

interface BusFormProps {
  onAddBus: (bus: Bus) => void;
}

export function BusForm({ onAddBus }: BusFormProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<'en-servicio' | 'fuera-servicio'>('en-servicio');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !capacity) return;

    const newBus: Bus = {
      id: Date.now().toString(),
      name,
      capacity: parseInt(capacity),
      status
    };

    onAddBus(newBus);
    setName('');
    setCapacity('');
    setStatus('en-servicio');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BusIcon className="w-5 h-5" />
          Agregar Nuevo Bus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bus-name">Nombre/Número del Bus</Label>
              <Input
                id="bus-name"
                placeholder="Ej: Bus 101"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-capacity">Capacidad</Label>
              <Input
                id="bus-capacity"
                type="number"
                min="1"
                placeholder="Ej: 45"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus-status">Estado</Label>
              <Select value={status} onValueChange={(value: 'en-servicio' | 'fuera-servicio') => setStatus(value)}>
                <SelectTrigger id="bus-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-servicio">En Servicio</SelectItem>
                  <SelectItem value="fuera-servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Bus
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}