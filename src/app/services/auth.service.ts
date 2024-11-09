import { Injectable } from '@angular/core';
import { UserService,User } from './user.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(private userService: UserService, private storage: StorageService) {
    this.loadCurrentUser(); 
  }

  // Espera a que los usuarios se carguen
  async waitForUsers() {
    // Asegúrate de que los usuarios estén cargados en el UserService
    if (this.userService.getUsers().length === 0) {
      await this.userService.loadUsers();
    }
  }

  // Autentica al usuario usando `UserService`
  async authenticate(username: string, password: string): Promise<User | null> {
    await this.waitForUsers();
    await this.userService.loadUsers().toPromise(); 
    const user = this.userService.getUserByUsername(username);

    // Verificar si el usuario existe y la contraseña es correcta
    if (user && user.password === password) {
      this.currentUser = user;
      await this.storage.saveCurrentUser(user);  // Guardar usuario en almacenamiento local
      return user;
    }
    return null;
  }

  // Cargar el usuario desde almacenamiento local 
  async loadCurrentUser(): Promise<void> {
    const user = await this.storage.getCurrentUser();
    if (user) {
      this.currentUser = user;
    } else {
      console.log('No se encontraron usuarios');
    }
  }

// Función para cerrar sesión
  async logout(){
    await this.storage.clearCurrentUser();  // Limpiar el usuario en almacenamiento local
    this.currentUser = null;
  }

  //Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Obtener el rol del usuario actual
  getCurrentUserRole(): number | null {
    return this.currentUser ? this.currentUser.role : null;
  }

  // Método para recuperar usuario por su nombre de usuario
  async passwordRecovery(username: string): Promise<User | null> {
    const user = this.userService.getUserByUsername(username);
    return user || null;  
  }

  //Método para actualizar la contraseña del usuario
  async updatePassword(username: string, newPassword: string): Promise<boolean> {
    const user = this.userService.getUserByUsername(username);
    if (user) {
      user.password = newPassword;
      await this.userService.updateUser(user); // Actualizar en StorageService y UserService
      if (this.currentUser?.username === username) {
        await this.storage.saveCurrentUser(user);  // Actualizar el usuario autenticado en local
      }
      return true;
    }
  return false;
  }
}
