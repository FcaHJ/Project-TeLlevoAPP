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
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home-driver',
  templateUrl: './home-driver.page.html',
  styleUrls: ['./home-driver.page.scss'],
})
export class HomeDriverPage implements OnInit, AfterViewInit {

  isActive: boolean = false;
  userId: number | null = null; 

  userRole: number | null = null;
  username!: string; 
  selectedHorario!: number;
  selectedSede:  { id: number; name: string; address: string } | null = null ;

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

  horarios = [
    { id: 1, time: '16:00 PM' },
    { id: 2, time: '17:00 PM' },
    { id: 3, time: '18:00 PM' },
    { id: 4, time: '19:00 PM' },
    { id: 5, time: '20:00 PM' },
    { id: 6, time: '21:00 PM' },
    { id: 7, time: '22:00 PM' },
    { id: 8, time: '23:00 PM' }
  ];

  sedes = [
    { id: 1, name: 'Sede Alameda', address: 'DuocUC SeDe Metropolitana, 8, Avenida España, Barrio República, Santiago, Provincia de Santiago, Región Metropolitana de Santiago, 8350708, Chile' },
    { id: 2, name: 'Sede Padre Alonso de Ovalle', address: 'Instituto Profesional Duoc UC Sede Padre Alonso de Ovalle, 1586, Alonso de Ovalle, Barrio Dieciocho, Santiago, Provincia de Santiago, Región Metropolitana de Santiago, 8330180, Chile'},
    { id: 3, name: 'Sede Antonio Varas', address: 'Duoc, 666, Avenida Antonio Varas, Barrio Inés de Suárez, Providencia, Provincia de Santiago, Región Metropolitana de Santiago, 7500000, Chile'},
    { id: 4, name: 'Sede Educación Continua', address: 'Instituto Profesional Duoc UC Sede Educación Continua, 337, Avenida José Miguel Claro, Barrio Triana, Providencia, Provincia de Santiago, Región Metropolitana de Santiago, 7500000, Chile' },
    { id: 5, name: 'Sede Maipú', address: 'Duoc UC, Primera Transversal, Los Renovales, Maipú, Provincia de Santiago, Región Metropolitana de Santiago, 9251819, Chile' },
    { id: 6, name: 'Sede Melipilla', address: 'Duoc UC Sede Melipilla, Los Carreras, Las Margaritas, Melipilla, Provincia de Melipilla, Región Metropolitana de Santiago, 9580000, Chile' },
    { id: 7, name: 'Sede Plaza Norte', address: 'DuocUC Sede Plaza Norte, 1660, Santa Elena de Huechuraba, Barrio Industrial El Parronal, Huechuraba, Provincia de Santiago, Región Metropolitana de Santiago, 8600578, Chile' },
    { id: 8, name: 'Sede Plaza Oeste', address: 'Duoc UC Sede Plaza Oeste, 1501, Avenida Américo Vespucio, Villa Santa Adela, Cerrillos, Provincia de Santiago, Región Metropolitana de Santiago, 9222145, Chile' },
    { id: 9, name: 'Sede Plaza Vespucio', address: 'Duoc UC Plaza Vespucio, 7107, Froilán Roa, Villa Perú, La Florida, Provincia de Santiago, Región Metropolitana de Santiago, 8260183, Chile'},
    { id: 10, name: 'Sede Puente Alto', address: 'DUOC UC Puente Alto, 1340, Avenida Concha y Toro, Condominio Los Otoñales 1, Puente Alto, Provincia de Cordillera, Región Metropolitana de Santiago, 8151746, Chile'},
    { id: 11, name: 'Sede San Bernardo', address: 'Duoc UC (Sede San Bernardo), 857, Ramón Freire, Barrio Esmeralda, San Bernardo, Provincia de Maipo, Región Metropolitana de Santiago, 8059001, Chile'},
    { id: 12, name: 'Sede San Carlos de Apoquindo', address: 'DuocUC SeDe San Carlos de Apoquindo, 12881, Camino El Alba, Condominio Los Algarrobos, Las Condes, Provincia de Santiago, Región Metropolitana de Santiago, 7610685, Chile'},
    { id: 13, name: 'Sede San Joaquín', address: 'DUOC UC San Joaquín, 4917, Avenida Vicuña Mackenna, Villa Eleodoro Gormaz, San Joaquín, Provincia de Santiago, Región Metropolitana de Santiago, 8940000, Chile' },
    { id: 14, name: 'Sede Valparaíso', address: 'DUOC UC Sede Valparaíso, Blanco, Cerro Concepción, Almendral, Valparaíso, Provincia de Valparaíso, Región de Valparaíso, 2362829, Chile' },
    { id: 15, name: 'Sede Viña del Mar', address: 'Duoc UC - Sede Viña del Mar, 2336, Álvarez, Lusitania, Forestal, Viña del Mar, Provincia de Valparaíso, Región de Valparaíso, 2520000, Chile' },
    { id: 16, name: 'Campus Arauco', address: 'Duoc UC, 1060, Ruta P-20, Arauco, Provincia de Arauco, Región del Biobío, Chile' },
    { id: 17, name: 'Campus Nacimiento', address: 'Duoc UC - CMPC, Avenida Julio Hemmelmann, Población Lautaro, Nacimiento, Provincia de Bío-Bío, Región del Biobío, 4550000, Chile' },
    { id: 18, name: 'Sede San Andrés de Concepción', address: 'Duoc UC, Autopista Concepción - Talcahuano, Lomas Verdes, Concepción, Provincia de Concepción, Región del Biobío, 4061735, Chile'},
    { id: 19, name: 'Campus Villarrica', address: 'Duoc UC Campus Villarrica, 51, Anfión Muñoz, Puelche, Villarrica, Provincia de Cautín, Región de la Araucanía, 4930611, Chile'},
    { id: 20, name: 'Sede Puerto Montt', address: 'DuocUC Sede Puerto Montt, 651, Egaña, Población Miramar, Puerto Montt, Provincia de Llanquihue, Región de Los Lagos, 5507138, Chile'}
  ];


  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private storageService: StorageService, 
    private userService: UserService,
    private http: HttpClient,
    private locationService: LocationService,
    private rateService: RateService,
    private router: Router
    ) { this.storageService.init() }

  userLocationIcon: L.Icon = new L.Icon({
      iconUrl: 'assets/marker.svg', // URL de marcador rojo de Leaflet
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    guardarYRedirigir() {
      // Redirige al componente pasajero con los parámetros de sede y horario
      this.router.navigate(['/home'], {
        queryParams: { sede: this.selectedSede, horario: this.selectedHorario }
      });
    }

    async ngOnInit() {
      this.userRole = this.authService.getCurrentUserRole();
      let logged_user = this.authService.getCurrentUser();
    
      if (logged_user) {
        this.username = logged_user.username;
        console.log("Nombre de usuario:", this.username);

        this.userId = logged_user.id; // Obtener el ID del usuario logeado dinámicamente

      } else {
        logged_user = null;
      }
      
      // Cargar el estado del toggle cuando la página se carga
      const estadoGuardado = await this.storageService.get('estadoConductor');
      if (estadoGuardado !== null) {
        this.isActive = estadoGuardado;
      }

      // Recuperar el horario guardado desde el almacenamiento
      this.selectedHorario = await this.storageService.get('selectedHorario') || null;

      // Recuperar la sede seleccionada desde el almacenamiento
        const savedSede = await this.storageService.get('selectedSede');
        if (savedSede) {
          const sede = this.sedes.find(s => s.id === savedSede.id);
          if (sede) {
            this.selectedSede = sede; // Asegúrate de asignar `selectedSede` también
            this.startLocation = sede.address; // Usa la dirección de la sede
          } else {
            console.warn('La sede guardada no coincide con ninguna sede conocida.');
          }
        } else {
          console.warn('No se encontró ninguna sede guardada en el almacenamiento.');
          this.startLocation = ''; // Valor predeterminado
        }
    
      // Recuperar las ubicaciones almacenadas
      this.endLocation = await this.storageService.get('endLocation') || '';
    
      // Si hay ubicaciones almacenadas, dibuja la ruta automáticamente
      if (this.startLocation && this.endLocation) {
        await this.drawSavedRoute(); 
      }

  }
  
  async ngAfterViewInit() {
    await this.getUserLocation();
    this.loadMap();
  }

  notifications = [
    { message: 'Nuevo mensaje recibido.' }
  ];
  // Función para abrir las notificaciones
  async openNotifications() {
  const alert = await this.alertController.create({
    header: 'Notificaciones',
    message: this.notifications.map(notification => notification.message).join('\n'),
    buttons: ['Cerrar']
  });

  await alert.present();
}

  // Guardar la sede seleccionada
  async saveSelectedSede() {
    if (this.selectedSede) {
      await this.storageService.set('selectedSede', this.selectedSede);
      this.startLocation = this.selectedSede.address
      console.log('Sede guardada:', this.selectedSede);
      console.log('Ubicación de inicio asignada:', this.startLocation);
    }
  }

  // Guardar el horario seleccionado
  async saveSelectedHorario() {
    if (this.selectedHorario) {
      await this.storageService.set('selectedHorario', this.selectedHorario);
      console.log('Horario guardado:', this.selectedHorario);
    }
  }

  async saveSelectedDestino() {
    if (this.endLocation) {
      await this.storageService.set('endLocation', this.endLocation);
      console.log('Destino guardado:', this.endLocation);
    }
  }
    
  async cambiarEstado(event: any) {
    console.log('Estado del toggle:', this.isActive);
    if (this.isActive) {
      console.log('El servicio está activo.');
    } else {
      console.log('El servicio está inactivo.');
    }

    // Guarda el estado en el almacenamiento
    await this.storageService.set('estadoConductor', this.isActive);

    // Verifica que userId esté disponible antes de actualizar el estado
    if (this.userId !== null) {
      try {
        await this.userService.updateConductorStatus(this.userId, this.isActive).toPromise();
        console.log('Estado del conductor actualizado correctamente.');
      } catch (error) {
        console.error('Error al actualizar el estado del conductor:', error);
      }
    } else {
      console.error('No se pudo actualizar el estado: ID del usuario no encontrado.');
    }
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

              this.startLocation = `${this.userLatitude.toFixed(6)}, ${this.userLongitude.toFixed(6)}`;
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

      console.log('Start location response:', startRes);
      console.log('End location response:', endRes);
  
      if (startRes.length > 0 && endRes.length > 0) {
        const startCoords = startRes[0];
        const endCoords = endRes[0];

        console.log('Start coordinates:', startCoords);
        console.log('End coordinates:', endCoords);
  
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

        console.log('Route geometry:', routeResponse.routes[0].geometry);
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
  
      } else{
        console.log('no funciona');

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
      this.routeLayer = L.polyline(routeCoordinates, { color: 'blue', weight: 5, opacity: 0.7 }).addTo(this.map);
  
      // Mostrar detalles
      this.showRouteDetails(distanceKm, durationMin, estimatedPrice);
  
    } catch (error) {
      console.error('Error al trazar la ruta:', error);
      this.showAlert('Error', 'No se pudo trazar la ruta entre los puntos.');
    }
  }

  async saveRoute() {
    if (this.userId !== null) {
      try {
        // Obtener la ubicación actual del usuario
        const coordinates = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = coordinates.coords;
  
        // Guardar la ubicación en el servicio de almacenamiento o en la base de datos
        // Aquí se puede guardar en localStorage, en un servicio o hacer una llamada a la API
        await this.storageService.set(`user_${this.userId}`, { latitude, longitude });
  
        // O, si estás usando un servicio como UserService para guardar en la base de datos:
        await this.userService.saveUserLocation(this.userId, latitude, longitude).toPromise();
  
        // Mostrar un mensaje de éxito
        this.showAlert('Éxito', 'La ubicación ha sido guardada correctamente.');
  
      } catch (error) {
        console.error('Error al guardar la ubicación:', error);
        this.showAlert('Error', 'No se pudo guardar la ubicación.');
      }
    } else {
      console.error('No se encontró el ID del usuario');
      this.showAlert('Error', 'No se encontró el ID del usuario.');
    }
  }

  async drawSavedRoute() {
    // Recuperar las coordenadas guardadas
    const startCoordinates = await this.storageService.get('startCoordinates');
    const endCoordinates = await this.storageService.get('endCoordinates');
  
    if (startCoordinates && endCoordinates) {
      const startLatLng: [number, number] = [startCoordinates.lat, startCoordinates.lng];
      const endLatLng: [number, number] = [endCoordinates.lat, endCoordinates.lng];
  
      // Cargar el mapa
      this.loadMap();
  
      // Llamar a calculateRoute para dibujar la ruta en el mapa
      await this.calculateRoute();
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
    const radius = 100000;  // Radio de búsqueda de 5 km
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
