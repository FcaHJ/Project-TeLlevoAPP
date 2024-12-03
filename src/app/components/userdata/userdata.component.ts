import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private modalCtrl: ModalController, 
    private toastController: ToastController,
    private authService: AuthService
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

  selectPaymentMethod(method: any) {
    this.selectedPaymentMethod = method; // Actualiza el método de pago seleccionado.
    console.log('Método seleccionado:', method);
  }

  confirmReservation() {
    if (this.selectedPaymentMethod) {
      console.log('Reserva confirmada con el método:', this.selectedPaymentMethod);
      // Aquí puedes agregar la lógica para procesar la reserva.
    } else {
      console.log('Por favor, selecciona un método de pago.');
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
  }

}
