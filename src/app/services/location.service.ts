import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: HttpClient) {}

  searchLocation(query: string, lat: number, lon: number, radius: number) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&viewbox=${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}&bounded=1`;
    return this.http.get(url);
  }
}