import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  userRole: number | null = null; // Rol del usuario

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Obtiene el rol del usuario desde el servicio de autenticación
    this.userRole = this.authService.getCurrentUserRole();
  }

  // Método para cerrar sesión
  async logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
