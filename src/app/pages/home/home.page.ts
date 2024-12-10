import { Component, OnInit, AfterViewInit } from '@angular/core';
import { User } from 'src/app/services/user.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, ModalController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { LocationService } from 'src/app/services/location.service';
import { Capacitor } from '@capacitor/core';
import { RateService } from 'src/app/services/rate.service';
import { UserService } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { UserdataComponent } from 'src/app/components/userdata/userdata.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  sedes = [
    { id: 1, name: 'Alameda' },
    { id: 2, name: 'Padre Alonso de Ovalle' },
    { id: 3, name: 'Antonio Varas' },
    { id: 4, name: 'Educación Continua' },
    { id: 5, name: 'Maipú' },
    { id: 6, name: 'Melipilla' },
    { id: 7, name: 'Plaza Norte' },
    { id: 8, name: 'Plaza Oeste' },
    { id: 9, name: 'Plaza Vespucio' },
    { id: 10, name: 'Puente Alto' },
    { id: 11, name: 'San Bernardo' },
    { id: 12, name: 'San Carlos de Apoquindo' },
    { id: 13, name: 'San Joaquín' },
    { id: 14, name: 'Valparaíso' },
    { id: 15, name: 'Viña del Mar' },
    { id: 16, name: 'Campus Arauco' },
    { id: 17, name: 'Campus Nacimiento' },
    { id: 18, name: 'San Andrés de Concepción' },
    { id: 19, name: 'Campus Villarrica' },
    { id: 20, name: 'Puerto Montt' }
  ];
  
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

  userRole: number | null = null;
  username!: string; 

  map: any; 
  drivers: any[] = [];
  activeDrivers: any[] = []; // Conductores activos 
  filteredDrivers: any[] = [];  
  showDriverList: boolean = false;
  sede: any = null;
  selectedSede: any = null;
  selectedHorario: any = null;
  horario: any = null;
  noFilteredDrivers: boolean = false;

  startLocation: string = '';

  routeLayer: any;
  searchTerm: string = '';
  suggestions: any[] = [];
  suggestionsStart: any[] = [];
  suggestionsEnd: any[] = [];
  userLatitude!: number;
  userLongitude!: number;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storage: StorageService,
    //private storage: Storage, // Añadimos el servicio Storage
    private http: HttpClient,
    private locationService: LocationService,
    private rateService: RateService,
    private router: Router,
    private modalCtrl: ModalController,
    private location: Location
    ) { this.storage.init(); }

    async ngOnInit() {
      this.userRole = this.authService.getCurrentUserRole();

      // Muestra el nombre de usuario
      let logged_user = this.authService.getCurrentUser();
      if (logged_user) {
        this.username = logged_user.username;
        console.log("Nombre de usuario:", this.username);
      } else {
        logged_user = null;
      }

      // Recuperar los datos del state de la navegación
      const navigation = this.location.getState() as { sede: string, horario: string };
      if (navigation) {
        this.sede = navigation.sede || 'No seleccionada';
        this.horario = navigation.horario || 'No seleccionado';
      }
    
      // Cargar los usuarios correctamente
      try {
        const users = await lastValueFrom(this.userService.loadUsers());
        this.filterDrivers(users);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }

      //Estado del conductor
      const estadoConductor = await this.storage.get('estadoConductor');
      
    }

    ngAfterViewInit() {
      this.getUserLocation();
      //this.loadMap();
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

    async userData() {
      this.openModal();
    } 

    async openModal() {
      const modal = await this.modalCtrl.create({
        component: UserdataComponent
      });
      await modal.present();
    }

    async showDrivers() {
      const allUsers = await this.userService.getUsers();
      this.drivers = allUsers.filter(user => user.role === 3); 
    }

    // Función que se llama al presionar el botón de 'Buscar'
    onSearch() {
      // Filtrar los conductores según los filtros aplicados
      this.filteredDrivers = this.filterDriversBasedOnCriteria();
      
      // Verificar si no hay conductores que coincidan con los filtros
      this.noFilteredDrivers = this.filteredDrivers.length === 0;
    }

    // Esta función filtra los conductores según los filtros aplicados
    filterDriversBasedOnCriteria() {
      let driversToShow = this.activeDrivers;

      // Si ambos filtros están seleccionados, aplica un OR lógico
      driversToShow = driversToShow.filter(driver => {
        const sedeMatches = this.selectedSede 
          ? driver.sede === this.sedes.find(s => s.id === this.selectedSede)?.name
          : true; // Si no hay sede seleccionada, acepta todos los conductores.

        const horarioMatches = this.selectedHorario 
          ? driver.horario === this.horarios.find(h => h.id === this.selectedHorario)?.time
          : true; // Si no hay horario seleccionado, acepta todos los conductores.

        // Retorna true si al menos uno de los filtros coincide
        return sedeMatches || horarioMatches;
      });

      if (this.searchTerm && this.searchTerm.trim() !== '') {
        driversToShow = driversToShow.filter(driver => driver.sede.toLowerCase().includes(this.searchTerm.toLowerCase()));
      }

      return driversToShow;
    }

    // Función para limpiar los filtros
    resetFilters() {
      this.selectedSede = null;
      this.selectedHorario = null;
      this.suggestionsStart = [];
      this.noFilteredDrivers = false;
    }

    // Función para filtrar los usuarios con rol de "conductor"
    filterDrivers(users: User[]) {
      this.drivers = users.filter(user => user.role === 3); // Rol de conductor 
      console.log('Usuarios conductores:', this.drivers);

      // Asignar datos simulados de sede y horario
      this.drivers.forEach((driver, index) => {
        driver.sede = this.sedes[index % this.sedes.length].name; // Asignar sede de forma cíclica
        driver.horario = this.horarios[index % this.horarios.length].time; // Asignar horario de forma cíclica
      });

      this.activeDrivers = this.drivers.filter(driver => driver.isActive === true);
      console.log('Conductores activos:', this.activeDrivers);
  }

  // Filtrar horarios según la sede seleccionada
  filterBySede() {
    console.log('Sede seleccionada:', this.selectedSede);

  }

  // Filtrar horarios según el horario seleccionado
  filterByHorario() {
    console.log('Horario seleccionado:', this.selectedHorario);
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
  
  selectSuggestion(suggestion: any, type: string) {
    if (type === 'start') {
      this.startLocation = suggestion.display_name;
      this.suggestionsStart = [];
    } 
  }
}
