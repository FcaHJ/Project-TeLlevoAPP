import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { User } from 'src/app/services/user.service';
import { Storage } from '@ionic/storage-angular';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userRole: number | null = null;

  user: User | null = null
  username!: string;
  email!: string;
  password!: string;
  fullname!: string;

  modelo: string | undefined;
  capacidad: number | undefined;
  patente: string | undefined;
  color: string | undefined;

  constructor(
    private storageService: StorageService, 
    private authService: AuthService, 
    private storage: Storage,
    private alertController: AlertController,) { }

  async ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();

    const logged_user: User | null = await this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
      this.email = logged_user.email;
      this.password = logged_user.password;
      this.fullname = logged_user.fullname;
    }
  }

  // Método para guardar la información del vehículo
  async guardarInfoVehiculo() {
    const vehiculoData = {
      modelo: this.modelo,
      capacidad: this.capacidad,
      patente: this.patente,
      color: this.color,
    };

    // Guardar en el almacenamiento local
    await this.storage.set('vehiculoInfo', vehiculoData);

    // Mostrar alerta de confirmación
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Información del vehículo guardada correctamente',
      buttons: ['OK']
    });
    await alert.present();
  }
}
