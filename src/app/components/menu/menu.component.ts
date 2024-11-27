import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
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
  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userRole = user?.role || null;
      this.username = user?.username || null;
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
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
