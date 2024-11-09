import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

interface MenuItem {
  title: string;
  url: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {

  @Input() userRole: number | null = null;
  username: string | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    /*
    if (this.userRole === 1) {  // Admin
      this.menuItems = [
        { title: 'Usuarios', url: '/users' },
        { title: 'Inicio', url: '/home' },
      ];
    } else if (this.userRole === 2) {  // Pasajero
      this.menuItems = [
        { title: 'Inicio', url: '/home' },
        { title: 'Perfil', url: '/profile' },
      ];
    } else if (this.userRole === 3) {  // Conductor
      this.menuItems = [
        { title: 'Inicio', url: '/home' },
        { title: 'Perfil', url: '/profile' },
      ];
    } else {  // Usuario no autenticado
      this.menuItems = [
        { title: 'Inicio', url: '/home' },
      ];
    }*/
  }
  

  

 /* isAdmin() {
    return this.userRole === 1; 
  }

  isPassenger() {
    return this.userRole === 2; 
  }

  isDriver() {
    return this.userRole === 3; 
  }

  // Método para mostrar el menú según el rol
  getMenuItems() {
    if (this.isAdmin()) {
      return [
        { title: 'Usuarios', url: '/users' },
        //{ title: 'Actividad', url: '/users-act' },
      ];
    } else if (this.isPassenger()) {
      return [
        { title: 'Inicio', url: '/home' },
        { title: 'Perfil', url: '/profile' },
        // Otros ítems de pasajero
      ];
    }else if (this.isDriver()) {
      return [
        { title: 'Inicio', url: '/home' },
        { title: 'Perfil', url: '/profile' },
        // Otros ítems de conductor
      ];
    } else {
      return [
        { title: 'Inicio', url: '/home' },
        // Menú para usuarios no autenticados 
      ];
    }
  }*/

  navigateTo(url: string) {
    this.router.navigateByUrl(url);  // Redirige a la URL especificada
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
      this.userRole = null;
      this.username = '';
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error en el cierre de sesión:', error);
    }
  }
}
