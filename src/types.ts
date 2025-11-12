export interface Bus {
  id: string;
  name: string;
  capacity: number;
  status: 'en-servicio' | 'fuera-servicio';
}

export interface RouteStop {
  id: string;
  location: string;
  arrivalTime: string;
  departureTime: string;
  // Coordenadas opcionales (latitud, longitud). Si están presentes, se usan para dibujar la parada en el mapa.
  lat?: number;
  lng?: number;
}

export interface BusRoute {
  id: string;
  busId: string;
  routeName: string;
  stops: RouteStop[];
}