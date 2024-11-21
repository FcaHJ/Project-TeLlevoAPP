import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import * as L from 'leaflet';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { RateService } from 'src/app/services/rate.service';
import { StorageService } from 'src/app/services/storage.service';


@Component({
  selector: 'app-home-driver',
  templateUrl: './home-driver.page.html',
  styleUrls: ['./home-driver.page.scss'],
})
export class HomeDriverPage implements OnInit {

  enServicio: boolean = false;

  userRole: number | null = null;
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
  userMarker!: L.Marker;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private storageService: StorageService, // Añadimos el servicio Storage
    private http: HttpClient,
    private locationService: LocationService,
    private rateService: RateService
    ) { }

  userLocationIcon: L.Icon = new L.Icon({
      iconUrl: 'assets/marker.svg', // URL de marcador rojo de Leaflet
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    async ngOnInit() {
      this.userRole = this.authService.getCurrentUserRole();
      let logged_user = this.authService.getCurrentUser();
    
      if (logged_user) {
        this.username = logged_user.username;
        console.log("Nombre de usuario:", this.username);
      } else {
        logged_user = null;
      }
    
      // Recuperar las ubicaciones almacenadas
      this.startLocation = await this.storageService.get('startLocation') || '';
      this.endLocation = await this.storageService.get('endLocation') || '';
    
      // Si hay ubicaciones almacenadas, dibuja la ruta automáticamente
      if (this.startLocation && this.endLocation) {
        this.calculateRoute(); 
      }
    
      this.getUserLocation();
      this.loadMap();
    }
    

  cambiarEstado(event: any) {
    console.log('Estado del toggle:', this.enServicio);
    if (this.enServicio) {
      // Acciones cuando el toggle está activado
      console.log('El servicio está activo.');
    } else {
      // Acciones cuando el toggle está desactivado
      console.log('El servicio está inactivo.');
    }
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
        timeout: 5000, 
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

  recenterMap() {
    this.map.setView([this.userLatitude, this.userLongitude], 15);
  }

  clearRoute() {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
      this.routeLayer = null;
    }
    if (this.startMarker) {
      this.map.removeLayer(this.startMarker);
      this.startMarker = null;
    }
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
      this.endMarker = null;
    }
    this.startLocation = '';
    this.endLocation = '';
    this.routeDetails = null; // Limpiar los detalles
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
        
        /*********/
        // Calcular la ruta usando OSRM
        const routeResponse = await lastValueFrom(this.rateService.calcularRuta(startLatLng, endLatLng));

        const distanceKm = routeResponse.routes[0].legs[0].distance / 1000;
        const durationMin = routeResponse.routes[0].legs[0].duration / 60;

        // Calcular la tarifa
        const estimatedPrice = this.rateService.calcularTarifa(distanceKm, durationMin);

        this.showRouteDetails(distanceKm, durationMin, estimatedPrice);

        // Dibujar la ruta en el mapa
        if (this.routeLayer) {
          this.map.removeLayer(this.routeLayer);
        }

        this.routeLayer = L.geoJSON(routeResponse.routes[0].geometry).addTo(this.map);

        /************/
  
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
  
      } 
    } catch (error) {
      console.error('Error en la búsqueda de ubicaciones:', error);
      this.showAlert('Error', 'Ocurrió un problema al buscar las ubicaciones. Intenta nuevamente.');
    }
  }

  async drawRoute(startLatLng: [number, number], endLatLng: [number, number]) {
    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startLatLng[1]},${startLatLng[0]};${endLatLng[1]},${endLatLng[0]}?overview=full&geometries=geojson&steps=true`;
  
    try {
      const routeRes = await this.http.get<any>(routeUrl).toPromise();
      const route = routeRes.routes[0];
  
      if (!route) {
        this.showAlert('Error', 'No se encontró una ruta válida.');
        return;
      }
  
      // Detalles de la ruta
      const distanceKm = route.distance / 1000; 
      const durationMin = route.duration / 60; 
      const estimatedPrice = this.calculatePrice(distanceKm, durationMin);
  
      // Eliminar la ruta anterior, si existe
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }
  
      const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      this.routeLayer = L.polyline(routeCoordinates, { color: 'blue', weight: 5 }).addTo(this.map);
  
      // Mostrar detalles
      this.showRouteDetails(distanceKm, durationMin, estimatedPrice);
  
    } catch (error) {
      console.error('Error al trazar la ruta:', error);
      this.showAlert('Error', 'No se pudo trazar la ruta entre los puntos.');
    }
  }

  calculatePrice(distanceKm: number, durationMin: number): number {
    const baseRate = 50; 
    const perKmRate = 10; 
    const perMinRate = 2;
  
    return baseRate + (distanceKm * perKmRate) + (durationMin * perMinRate);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  }

  routeDetails: {
    distanceKm: number;
    durationMin: number;
    estimatedPrice: number;
    formattedPrice: string;
  } | null = null;

  showRouteDetails(distanceKm: number, durationMin: number, estimatedPrice: number) {
    this.routeDetails = {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMin: parseFloat(durationMin.toFixed(0)),
      estimatedPrice: estimatedPrice, 
      formattedPrice: this.formatCurrency(estimatedPrice), 
    };
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
    const radius = 5000;  // Radio de búsqueda de 5 km
    if (query.length > 2) {
      this.locationService
        .searchLocation(query, this.userLatitude, this.userLongitude, radius)
        .subscribe((results: any) => {
          console.log(results);  
          if (type === 'start') {
            this.suggestionsStart = results; 
          } else {
            this.suggestionsEnd = results;
          }
        }, error => {
          console.error('Error al obtener los resultados de Nominatim:', error);  
        });
    } else {
      if (type === 'start') {
        this.suggestionsStart = [];
      } else {
        this.suggestionsEnd = [];
      }
    }
  }
  
  async selectSuggestion(suggestion: any, type: string) {
    if (type === 'start') {
      this.startLocation = suggestion.display_name;
      this.suggestionsStart = [];
      await this.storageService.set('startLocation', this.startLocation); // Guardar inicio
    } else {
      this.endLocation = suggestion.display_name;
      this.suggestionsEnd = [];
      await this.storageService.set('endLocation', this.endLocation); // Guardar destino
    }
  }
  

}
