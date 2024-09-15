import { Component, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/api/login.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent  implements OnInit {

    //Variables
    password!: string;
    password2!: string;

  constructor(
    private modalCtrl: ModalController, 
    private toastController: ToastController,
    private loginService: LoginService
  ) { }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.password === this.password2) {
      // Llama al servicio para cambiar la contraseña
      const success = this.loginService.changePassword(this.password);
      if (success) {
        return this.modalCtrl.dismiss(this.generateMessage('Contraseña cambiada', 'success'), 'confirm');
      }else{
        return this.generateMessage('No se pudo cambiar la contraseña', 'danger');
      }
    }else{
      return this.generateMessage('Las contraseñas no coinciden', 'danger');
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

  ngOnInit() {}

}
