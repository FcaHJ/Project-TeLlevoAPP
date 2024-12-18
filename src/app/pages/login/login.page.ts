import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { User, UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
 
  username!: string;
  password!: string;
  showPassword: boolean = false;
    
  constructor( 
      private toastController: ToastController, 
      private router: Router, 
      private authService: AuthService, 
  ) {}

  async ngOnInit(){
    
  }

  // Valida los datos del login
  async validateLogin() {
    const user = await this.authService.authenticate(this.username, this.password);
    this.authenticateHandler(user);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;  // Alterna entre visible y no visible
  }
   
  private authenticateHandler(user: User | null) {
      if (user) {
        this.successAuthentication();
        this.clearForm();
      } else {
        this.failedAuthentication();
        this.clearForm();
      }
    }
  
    private failedAuthentication(message: string = 'Datos Incorrectos') {
      this.generateMessage(message, 'danger')
        .then(() => { console.log('Failed login') });
    }
  
    private successAuthentication() {
      
      this.generateMessage('Sesión exitosa', 'success')
        .then(() => {
          console.log('Success login');
          return this.router.navigateByUrl('/loading')
        })
        .then(() => console.log('Navigated to home'));
    }

    clearForm() {
      this.username = '';
      this.password = '';
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
