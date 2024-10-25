import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personCircleSharp, logOutOutline, homeSharp } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  selectedSegment: string='home';

  constructor(
    private authService: AuthService,
    private router: Router, 
    private alertController: AlertController) {
    addIcons({ personCircleSharp, logOutOutline, homeSharp });  
  }

  ngOnInit() {
  }
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
            this.authService.logout().then(() => {
              console.log('Sesión cerrada');
              this.router.navigate(['/login']); // Redirige a la página de Login
            }).catch(err => {
              console.error('Error al cerrar sesión:', err);
            });
          }
        }
      ]
    });

    await alert.present(); // Muestra la alerta
  }


  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

}
