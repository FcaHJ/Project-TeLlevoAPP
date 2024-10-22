import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

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
      private authService: AuthService //Servicio
    ) {
    }
  ngOnInit(){
  }

  //Valida datos del login
  validateLogin(){
    console.log("Executing login validation")
    this.authService
      .authenticate(this.username, this.password)
      .then(user => {
        this.authenticateHandler(user);
      })
      .catch(err => {
        console.log('Error on login: ', err)
        this.failedAuthentication();
      });
    }

    private authenticateHandler(user: User | null) {
      user ? this.successAuthentication() : this.failedAuthentication()
    }
  
    private failedAuthentication(message: string = 'Failed login') {
      this.generateMessage(message, 'danger')
        .then(() => { console.log('Failed login') });
    }
  
    private successAuthentication() {
      this.generateMessage('Success login', 'success')
        .then(() => {
          console.log('Success login');
          return this.router.navigateByUrl('/home')
        })
        .then(() => console.log('Navigated to home'));
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
