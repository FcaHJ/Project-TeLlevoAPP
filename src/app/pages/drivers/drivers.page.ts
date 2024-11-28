import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PaymentComponent } from 'src/app/components/payment/payment.component';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.page.html',
  styleUrls: ['./drivers.page.scss'],
})
export class DriversPage implements OnInit {

  drivers: any[] = [];
  activeDrivers: any[] = [];
  showNoDriversMessage = false;
  
  constructor(
    private userService: UserService,
    private storage: StorageService,
    private modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    // Cargar los usuarios correctamente y filtrar conductores
    this.userService.loadUsers().subscribe((users) => {
      console.log('Usuarios cargados:', users);
      this.filterDrivers(users); 
    });

    //Estado del conductor
    const estadoConductor = await this.storage.get('estadoConductor');
  }

  //Funcion para Recuperar contraseña
  async paymentMethod() {
    this.openModal();
  } 

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentComponent
    });
    await modal.present();

    
  }

  showDriversList() {
      this.activeDrivers = this.drivers.filter(driver => driver.isActive === true); // Filtrar conductores activos
  }

    // Función para filtrar los usuarios con rol de "conductor"
  filterDrivers(users: User[]) {
    this.drivers = users.filter(user => user.role === 3); // Rol de conductor
    console.log('Usuarios conductores:', this.drivers);

    this.showDriversList();
}

}
