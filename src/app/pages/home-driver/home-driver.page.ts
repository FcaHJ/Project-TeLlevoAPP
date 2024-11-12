import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-driver',
  templateUrl: './home-driver.page.html',
  styleUrls: ['./home-driver.page.scss'],
})
export class HomeDriverPage implements OnInit {

  userRole: number | null = null;
  username!: string; 

  constructor(
    private authService: AuthService,
    private alertController:AlertController,) { }

  async ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
    //Muestra el nombre de usuario
    let logged_user = this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
      console.log("Nombre de usuario:", this.username); // Verificar que el nombre de usuario esté presente
    }else{
      logged_user = null;
    }
  }

}
