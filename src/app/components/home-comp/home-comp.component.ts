import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';


@Component({
  selector: 'app-home-comp',
  templateUrl: './home-comp.component.html',
  styleUrls: ['./home-comp.component.scss'],
})
<<<<<<< HEAD
export class HomeCompComponent implements OnInit {
  username!: string; // Variable para almacenar el nombre de usuario
  map: any; // Variable para almacenar el mapa
  showPrices: boolean = false; // Controla la visibilidad de la lista de precios
  prices = [ // Array de precios
    { name: 'Viaje de 10 minutos', value: 2.00 },
    { name: 'Viaje de 20 minutos', value: 6.50 },
    { name: 'Viaje de 40 minutos', value: 15.00 },
    { name: 'Viaje de 60 minutos', value: 21.00 },
  ];
=======
export class HomeCompComponent  implements OnInit {

  username!: string;
  map: any;
  startLocation: string = '';
  endLocation: string = '';
  startMarker: any;
  endMarker: any;
  routeLayer: any;
  searchTerm: string = '';
  suggestions: any[] = [];
  suggestionsStart: any[] = [];
  suggestionsEnd: any[] = [];
  userLatitude!: number;
  userLongitude!: number;
>>>>>>> ff894e3751698cb829ea3c80f55b3a593fd8521b

  constructor(
    private authService: AuthService,
    private alertController:AlertController,
    private http: HttpClient,
    private locationService: LocationService,
    ) { this.getUserLocation(); }

  async ngOnInit() {
    // Muestra el nombre de usuario
    const logged_user: User | null = await this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
    }
    this.loadMap(); // Carga el mapa
  }

  async checkPermissions() {
    const permission = await Geolocation.requestPermissions();
    console.log(permission);
  }

  async loadMap() {
<<<<<<< HEAD
    const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    this.map = L.map('mapId').setView([coordinates.coords.latitude, coordinates.coords.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([coordinates.coords.latitude, coordinates.coords.longitude])
      .addTo(this.map)
      .bindPopup('Estás aquí.')
      .openPopup();
  }

  // Método para alternar la visibilidad de la lista de precios
  togglePrices() {
    this.showPrices = !this.showPrices;
  }
}
=======
    try{
      const coordinates = await Geolocation.getCurrentPosition({ 
        enableHighAccuracy: true, 
      timeout: 1000, 
      maximumAge: 0 });

      const { latitude, longitude } = coordinates.coords;

      // Verificación de exactitud
      if (coordinates.coords.accuracy && coordinates.coords.accuracy > 50) { // Ejemplo de precisión mínima
        this.showAlert('Precisión baja', 'La ubicación puede no ser precisa. Intenta en un área con mejor señal.');
      }

      this.map = L.map('mapId').setView([latitude, longitude], 15);
    
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
    
      L.marker([latitude, longitude])
        .addTo(this.map)
        .bindPopup('Estás aquí.')
        .openPopup();
    }catch(error){
      this.showAlert('Error', 'No se pudo obtener la ubicación. Por favor, verifica que los permisos estén activados o intenta de nuevo.');
    }
  }

  async getUserLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.userLatitude = coordinates.coords.latitude;
    this.userLongitude = coordinates.coords.longitude;
  }

  async calculateRoute() {
    if (!this.startLocation || !this.endLocation) {
      this.showAlert('Error', 'Por favor, ingresa tanto el punto de partida como el de llegada.');
      return;
    }

    // Geocodificar la ubicación de inicio y destino
    const startUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.startLocation)}&format=json&limit=1`;
    const endUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.endLocation)}&format=json&limit=1`;

    try {
      const startRes = await lastValueFrom(this.http.get<any[]>(startUrl));
      const endRes = await lastValueFrom(this.http.get<any[]>(endUrl));
    
      if (startRes.length > 0 && endRes.length > 0) {
        const startCoords = startRes[0];
        const endCoords = endRes[0];
    
        const startLatLng: [number, number] = [parseFloat(startCoords.lat), parseFloat(startCoords.lon)];
        const endLatLng: [number, number] = [parseFloat(endCoords.lat), parseFloat(endCoords.lon)];
    
        // Colocar marcadores en el mapa
        if (this.startMarker) this.map.removeLayer(this.startMarker);
        if (this.endMarker) this.map.removeLayer(this.endMarker);
    
        this.startMarker = L.marker(startLatLng).addTo(this.map).bindPopup('Punto de Partida').openPopup();
        this.endMarker = L.marker(endLatLng).addTo(this.map).bindPopup('Punto de Llegada').openPopup();
    
        // Centrar el mapa entre los dos puntos
        const bounds = L.latLngBounds(startLatLng, endLatLng);
        this.map.fitBounds(bounds);
    
        // Trazar ruta entre los puntos
        this.drawRoute(startLatLng, endLatLng);
    
      } else {
        this.showAlert('Ubicación no encontrada', 'No se encontraron las ubicaciones especificadas. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en la búsqueda de ubicaciones:', error);
      this.showAlert('Error', 'Ocurrió un problema al buscar las ubicaciones. Intenta nuevamente.');
    }
  }

  async drawRoute(startLatLng: [number, number], endLatLng: [number, number]) {
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?geometries=geojson`;

    try {
      const routeRes = await this.http.get<any>(routeUrl).toPromise();
      const route = routeRes.routes[0];

      // Eliminar la ruta anterior, si existe
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }

      const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      this.routeLayer = L.polyline(routeCoordinates, { color: 'blue', weight: 5 }).addTo(this.map);

    } catch (error) {
      console.error('Error al trazar la ruta:', error);
      this.showAlert('Error', 'No se pudo trazar la ruta entre los puntos.');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  onSearchChange(event: any, type: string) {
    const query = event.detail.value;
    const radius = 5000; // 5 km de radio, puedes ajustarlo según necesites
  
    if (query.length > 2) {
      this.locationService
        .searchLocation(query, this.userLatitude, this.userLongitude, radius)
        .subscribe((results: any) => {
          if (type === 'start') {
            this.suggestionsStart = results;
          } else {
            this.suggestionsEnd = results;
          }
        });
    } else {
      if (type === 'start') {
        this.suggestionsStart = [];
      } else {
        this.suggestionsEnd = [];
      }
    }
  }
  
  selectSuggestion(suggestion: any, type: string) {
    if (type === 'start') {
      this.startLocation = suggestion.display_name;
      this.suggestionsStart = [];
    } else {
      this.endLocation = suggestion.display_name;
      this.suggestionsEnd = [];
    }
  }
}
>>>>>>> ff894e3751698cb829ea3c80f55b3a593fd8521b
