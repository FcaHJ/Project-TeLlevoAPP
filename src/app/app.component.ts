import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  userRole: number | null = null; // Rol del usuario
  isConductor: boolean = false; // Nueva propiedad para identificar si el usuario es conductor

  constructor(private authService: AuthService, private storage: StorageService, private router: Router) {}

  async ngOnInit() {

    await this.storage.init();

    await this.authService.loadCurrentUser();
    
    // Obtiene el rol del usuario desde el servicio de autenticación
    this.userRole = this.authService.getCurrentUserRole();

    // Configura `isConductor` basado en `userRole`
    this.isConductor = this.userRole === 3; // Asumiendo que el rol de conductor es 3
  }

  // Método para cerrar sesión
  async logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
