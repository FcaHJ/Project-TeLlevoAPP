import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {

  constructor(private router: Router, private authService: AuthService) { }

  async ngOnInit() {
    setTimeout(async () => {
      // Después de 3 segundos, redirige a la página de inicio
      this.router.navigateByUrl('/home');
      const userRole = await this.authService.getCurrentUserRole();

      // Redirige según el rol del usuario
      if (userRole === 1) {
        this.router.navigateByUrl('/users'); 
      } else if (userRole === 2) {
        this.router.navigateByUrl('/home'); 
      } else if (userRole === 3) {
        this.router.navigateByUrl('/home-driver'); 
      } else {
        this.router.navigateByUrl('/login');
      }
    }, 3000); // Simula una carga de 3 segundos
  }
}
