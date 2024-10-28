import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home-comp',
  templateUrl: './home-comp.component.html',
  styleUrls: ['./home-comp.component.scss'],
})
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

  constructor(private authService: AuthService) { }

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