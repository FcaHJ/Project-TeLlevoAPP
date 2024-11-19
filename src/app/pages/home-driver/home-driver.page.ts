import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-home-driver',
  templateUrl: './home-driver.page.html',
  styleUrls: ['./home-driver.page.scss'],
})
export class HomeDriverPage implements OnInit {

  userRole: number | null = null;
  username!: string; 
  modelo: string | undefined;
  capacidad: number | undefined;
  patente: string | undefined;
  color: string | undefined;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private storage: Storage // Añadimos el servicio Storage
  ) { }

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
