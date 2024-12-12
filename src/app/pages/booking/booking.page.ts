import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { RateService } from 'src/app/services/rate.service';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserService } from 'src/app/services/user.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { lastValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {

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
  endLocation!: string;

  routeLayer: any;
  searchTerm: string = '';
  suggestions: any[] = [];
  suggestionsStart: any[] = [];
  suggestionsEnd: any[] = [];
  userLatitude!: number;
  userLongitude!: number;
  isAvailable: boolean = true;

  mostrarDiv!: boolean;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController,
    private storage: StorageService,
    private locationService: LocationService,
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
      this.endLocation = await this.storage.get('endLocation');
      
      // Leer el estado de mostrarDiv desde el almacenamiento local
      const mostrarDivState = localStorage.getItem('mostrarDiv');
      this.mostrarDiv = mostrarDivState === 'true'; 
      
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

  async cancelTrip(){
      const alert = await this.alertController.create({
        header: 'Confirmar Cancelación',
        message: '¿Estás seguro de que deseas cancelar el viaje?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Cancelado');
            }
          },
          {
            text: 'Si',
            handler: () => {
              this.mostrarDiv = false; 
              localStorage.setItem('mostrarDiv', String(this.mostrarDiv)); 
            }
          }
        ]
      });
  
      await alert.present(); 
  }

    async showDrivers() {
      const allUsers = await this.userService.getUsers();
      this.drivers = allUsers.filter(user => user.role === 3); 
      this.endLocation = await this.storage.get('endLocation');
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
      this.activeDrivers = this.drivers.filter(driver => driver.isActive);
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

