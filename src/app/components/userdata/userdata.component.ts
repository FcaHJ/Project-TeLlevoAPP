import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.component.html',
  styleUrls: ['./userdata.component.scss'],
})
export class UserdataComponent  implements OnInit {

  // Lista de métodos de pago
  paymentMethods = [
    { name: 'Transferencia Bancaria', icon: 'shuffle' },
    { name: 'Efectivo', icon: 'cash' }
  ];

  total: number = 0;
  name!: string
  selectedPaymentMethod: any = null; 
  passenger: number = 0;
  available: any[] = [];
  drivers: any[] = [];
  userId: number | null = null;


  constructor(
    private modalCtrl: ModalController, 
    private toastController: ToastController,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    // Muestra el nombre de usuario
    let logged_user = this.authService.getCurrentUser();
    if (logged_user) {
      this.name = logged_user.fullname;
      console.log("Nombre de usuario:", this.name);
    } else {
      logged_user = null;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  passengers(){
    this.total = this.passenger*4000
  }

  selectPaymentMethod(method: any) {
    this.selectedPaymentMethod = method; // Actualiza el método de pago seleccionado.
    console.log('Método seleccionado:', method);
  }

  async confirmReservation() {
    if (this.passenger > 0 && this.passenger < 9){
      if (this.selectedPaymentMethod) {
        const messageData = this.generateMessage('Reserva confirmada', 'success');
        this.modalCtrl.dismiss(messageData,'confirm');
        this.router.navigate(['/booking'], { queryParams: { mostrarDiv: true } }); 
      } else {
        console.log('Por favor, selecciona un método de pago.');
      }
    }else{
      this.generateMessage('Ingrese cantidad de pasajeros valida', 'danger');
    }
  }

  async generateMessage(message: string, color: string){
    const toast = await this.toastController.create({
      /* mensage de error o exito en credenciales de inicio de sesion */
      message: message,
      duration: 3000 /* en milisegundos */,
      position: 'bottom',
      color: color
    });
    await toast.present();
    return { message, color };
  }

}
