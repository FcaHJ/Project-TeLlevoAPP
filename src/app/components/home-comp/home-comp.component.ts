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
export class HomeCompComponent  implements OnInit {

  username!: string;
  map: any;

  constructor(private authService: AuthService) { }

  

  async ngOnInit() {
    //Muestra el nombre de usuario
    const logged_user: User | null = await this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
  }
  this.loadMap();
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

}
