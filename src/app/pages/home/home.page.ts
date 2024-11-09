import { Component, OnInit, AfterViewInit } from '@angular/core';
import { User } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, MenuController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { Capacitor } from '@capacitor/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit  {

  userRole: number | null = null;
  username!: string; 
  map: any; 
  showPrices: boolean = false;
  prices = [ 
    { name: 'Viaje de 10 minutos', value: 2000 },
    { name: 'Viaje de 20 minutos', value: 6500 },
    { name: 'Viaje de 40 minutos', value: 9500 },
    { name: 'Viaje de 60 minutos', value: 15000 },
  ];
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
  userMarker!: L.Marker;
  constructor(
    private authService: AuthService,
    private alertController:AlertController,
    private http: HttpClient,
    private locationService: LocationService,
    ) { this.getUserLocation(); }

  userLocationIcon: L.Icon = new L.Icon({
    iconUrl: 'assets/marker.svg', // URL de marcador rojo de Leaflet
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  async ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
    //Muestra el nombre de usuario
    let logged_user = this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
      console.log("Nombre de usuario:", this.username); // Verificar que el nombre de usuario esté presente
      await this.getUserLocation();
    }else{
      logged_user = null;
    }
    this.getUserLocation();
    this.loadMap();
  }

  ngAfterViewInit() {
    this.loadMap();
  }

  async checkPermissions() {
    const permission = await Geolocation.requestPermissions();
    console.log(permission);
  }


  async loadMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({ 
        enableHighAccuracy: true, 
        timeout: 1000, 
        maximumAge: 0 
      });
  
      const { latitude, longitude } = coordinates.coords;
  
      this.map = L.map('mapId').setView([latitude, longitude], 15);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);
  
      // Añadir marcador con el icono rojo para la ubicación del usuario
      L.marker([latitude, longitude], { icon: this.userLocationIcon })
        .addTo(this.map)
        .bindPopup('Estás aquí.')
        .openPopup();
    } catch (error) {
      this.showAlert('Error', 'No se pudo obtener la ubicación. Por favor, verifica que los permisos estén activados o intenta de nuevo.');
    }
  }

 /* async getUserLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.userLatitude = coordinates.coords.latitude;
    this.userLongitude = coordinates.coords.longitude;
  }*/

  recenterMap() {
    this.map.setView([this.userLatitude, this.userLongitude], 15);
  }

  clearRoute() {
    // Eliminar la ruta si existe
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null; // Reinicia la referencia a la ruta
    }
  
    // Eliminar el marcador de inicio si existe
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null; // Reinicia la referencia al marcador de inicio
    }
  
    // Eliminar el marcador de destino si existe
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null; // Reinicia la referencia al marcador de destino
    }
  
    // Limpiar los campos de búsqueda de ubicación
    this.startLocation = '';
    this.endLocation = '';
  }

  async getUserLocation() {
    try {
      if (Capacitor.isNativePlatform()) {
        // Si es una plataforma nativa (Android/iOS), usa Capacitor Geolocation
        const coordinates = await Geolocation.getCurrentPosition();
        this.userLatitude = coordinates.coords.latitude;
        this.userLongitude = coordinates.coords.longitude;
      } else {
        // Si es la web, usa la API estándar de geolocalización
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLatitude = position.coords.latitude;
              this.userLongitude = position.coords.longitude;
              console.log('Latitud:', this.userLatitude, 'Longitud:', this.userLongitude);
            },
            (error) => {
              this.showAlert('Error', 'No se pudo obtener la ubicación en la web.');
            }
          );
        } else {
          this.showAlert('Error', 'Geolocalización no soportada en este navegador.');
        }
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.showAlert('Error', 'No se pudo obtener la ubicación.');
    }
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
  
        // Este es el marcador de destino que queremos arrastrar
        this.endMarker = L.marker(endLatLng, { draggable: true })
          .addTo(this.map)
          .bindPopup('Punto de Llegada')
          .openPopup();
  
        // Evento para manejar el cambio de posición al arrastrar el marcador
        this.endMarker.on('dragend', async (event: L.LeafletEvent) => {
          const marker = event.target;
          const position = marker.getLatLng();
          
          // Actualiza el punto de destino con las nuevas coordenadas
          this.endLocation = `${position.lat},${position.lng}`;
          
          // Realizar geocodificación inversa para obtener la dirección
          const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`;
          try {
            const res = await this.http.get<any>(geocodeUrl).toPromise();
            if (res && res.display_name) {
              this.endLocation = res.display_name; // Muestra la dirección en el buscador
            } else {
              this.endLocation = `${position.lat},${position.lng}`; // Si falla, usa las coordenadas
            }
          } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            this.endLocation = `${position.lat},${position.lng}`; // Usa las coordenadas si hay error
          }
        
          // Recalcula la ruta con las nuevas coordenadas del destino
          this.drawRoute(startLatLng, [position.lat, position.lng]);
        });
  
        // Centrar el mapa entre los dos puntos
        const bounds = L.latLngBounds(startLatLng, endLatLng);
        this.map.fitBounds(bounds);
  
        // Trazar la ruta inicial
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


  togglePrices() {
    this.showPrices = !this.showPrices;
  }
}