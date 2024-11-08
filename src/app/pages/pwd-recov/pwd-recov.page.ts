import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-pwd-recov',
  templateUrl: './pwd-recov.page.html',
  styleUrls: ['./pwd-recov.page.scss'],
})
export class PwdRecovPage implements OnInit {

  //Variables
  username!: string;
  password!: string;

  constructor(
    private toastController: ToastController, 
    private authService: AuthService, 
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  //Funcion para Recuperar contraseña
  async passwordRecovery() {
    const user = await this.authService.passwordRecovery(this.username);
    if (user) {
      this.openModal(user.username);
    } else {
      this.generateMessage('Usuario no encontrado', 'danger');
    }
  } 

  async openModal(username: string) {
    const modal = await this.modalCtrl.create({
      component: ModalComponent,
      componentProps: { username }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.newPassword) {
      const success = await this.authService.updatePassword(username, data.newPassword);
      if (success) {
        this.generateMessage('Contraseña actualizada exitosamente', 'success');
      } else {
        this.generateMessage('Error al actualizar la contraseña', 'danger');
      }
    }
  }

async generateMessage(message: string, color: string){
  const toast = await this.toastController.create({
    /* mensage de error o exito en credenciales */
    message: message,
    duration: 3000 /* en milisegundos */,
    position: 'bottom',
    color: color
  });
  await toast.present();
}
}


