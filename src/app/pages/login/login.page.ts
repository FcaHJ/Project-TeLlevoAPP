import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LoginService } from 'src/app/api/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  //Variables
    username!: string;
    password!: string;
    
    constructor( 
      private toastController: ToastController, 
      private router: Router, 
      private loginService: LoginService //Servicio
    ) {
    }
  ngOnInit(){
  }

  //Valida datos del login
  validateLogin(){
    if (
      this.loginService.validateLogin(this.username, this.password)) {
        this.generateMessage('Datos correctos', 'success');
        let extras: NavigationExtras = {
          state: {user: this.username}
        }
        this.router.navigate(['/loading'], extras);
    }else{
      this.generateMessage('Datos incorrectos', 'danger');
    }
  } 
    async generateMessage(message: string, color: string){
      const toast = await this.toastController.create({
        /* mensage de error o exito en credenciales de inicio de sesion */
        message: message,
        duration: 3000 /* milisegundos */,
        position: 'bottom',
        color: color
      });
      await toast.present();
    }
  }
