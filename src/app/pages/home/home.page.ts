import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personCircleSharp, logOutOutline, homeSharp, analytics } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  selectedComponent: string = '';  
  userRole: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router, 
    private alertController: AlertController) {
    addIcons({ personCircleSharp, logOutOutline, homeSharp, analytics });  
  }

  ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
    this.setDefaultComponent(); 
  }

  isAdmin() {
    return this.userRole === 1; 
  }

  isPassenger() {
    return this.userRole === 2; 
  }

  isDriver() {
    return this.userRole === 3; 
  }

  // Establecer la página de inicio según el rol
  setDefaultComponent() {
    if (this.userRole === 1) {  // Si es Admin
      this.selectedComponent = 'admin'
    } else if (this.userRole === 2) {  // Si es Usuario
      this.selectedComponent = 'home-comp'
    } else {  // Si es otro rol (puedes agregar más roles si es necesario)
      this.selectedComponent = 'profile'
    }
  }

  setComponent(component: string) {
    this.selectedComponent = component; // Cambia el componente mostrado
  }
  
  // Función para cerrar sesión
  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Cierre de Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          }
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            this.performLogout();
          }
        }
      ]
    });

    await alert.present(); // Muestra la alerta
  }

  // Método que realiza el logout
  async performLogout() {
    try {
      await this.authService.logout();
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error en el cierre de sesión:', error);
    }
  }

}
