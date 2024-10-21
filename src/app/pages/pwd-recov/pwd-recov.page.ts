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
  async passwordRecovery(){
    if(
      await this.authService.passwordRecovery(this.username)) {
        let extras: NavigationExtras = {
          state: {user: this.username}
        }
        this.openModal();
    }else{
      this.generateMessage('Usuario no encontrado', 'danger');
    }
} 

async openModal() {
  const modal = await this.modalCtrl.create({
    component: ModalComponent,
  });
  await modal.present();

  const { data, role } = await modal.onWillDismiss();

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


