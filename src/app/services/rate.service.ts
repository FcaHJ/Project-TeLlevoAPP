import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RateService {

  constructor(private http: HttpClient) {}

  // Método para calcular la distancia y duración de la ruta
  calcularRuta(startLatLng: [number, number], endLatLng: [number, number]): Observable<any> {
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?overview=full&geometries=geojson&steps=true`;
    return this.http.get<any>(routeUrl);
  }

  // Método para calcular la tarifa
  calcularTarifa(distanceKm: number, durationMin: number): number {
    const baseRate = 50; // Tarifa base
    const perKmRate = 10; // Tarifa por km
    const perMinRate = 2; // Tarifa por minuto

    return baseRate + (distanceKm * perKmRate) + (durationMin * perMinRate);
  }

  // Método para formatear el precio
  formatearPrecio(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  }
}
