import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent  implements OnInit {

  // Lista de métodos de pago
  paymentMethods = [
    { name: 'PayPal', icon: 'logo-paypal' },
    { name: 'Transferencia Bancaria', icon: 'shuffle' },
    { name: 'Efectivo', icon: 'cash' }
  ];

  constructor(
    private modalCtrl: ModalController, 
    private toastController: ToastController,
  ) { }

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirm() {
    //Completar
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
