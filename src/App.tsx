import { useState } from 'react';
import { BusList } from './components/bus-list';
import { RouteList } from './components/route-list';
import { BusForm } from './components/bus-form';
import { RouteForm } from './components/route-form';
import { MapView } from './components/map-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Bus, BusRoute } from './types';

export default function App() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);

  const addBus = (bus: Bus) => {
    setBuses([...buses, bus]);
  };

  const updateBus = (id: string, updatedBus: Bus) => {
    setBuses(buses.map(bus => bus.id === id ? updatedBus : bus));
  };

  const deleteBus = (id: string) => {
    setBuses(buses.filter(bus => bus.id !== id));
    // También eliminar recorridos asociados a este bus
    setRoutes(routes.filter(route => route.busId !== id));
  };

  const addRoute = (route: BusRoute) => {
    setRoutes([...routes, route]);
  };

  const updateRoute = (id: string, updatedRoute: BusRoute) => {
    setRoutes(routes.map(route => route.id === id ? updatedRoute : route));
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-blue-900 mb-2">Sistema de Gestión de Buses</h1>
          <p className="text-gray-600">Administra buses y recorridos</p>
        </div>

        <Tabs defaultValue="buses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="buses">Buses</TabsTrigger>
            <TabsTrigger value="routes">Recorridos</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="buses" className="space-y-6">
            <BusForm onAddBus={addBus} />
            <BusList 
              buses={buses} 
              onUpdateBus={updateBus} 
              onDeleteBus={deleteBus} 
            />
          </TabsContent>

          <TabsContent value="routes" className="space-y-6">
            <RouteForm 
              buses={buses} 
              onAddRoute={addRoute} 
            />
            <RouteList 
              routes={routes} 
              buses={buses}
              onUpdateRoute={updateRoute} 
              onDeleteRoute={deleteRoute} 
            />
          </TabsContent>

          <TabsContent value="map">
            <MapView routes={routes} buses={buses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}