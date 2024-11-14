import { Injectable } from '@angular/core';
import { UserService,User } from './user.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | null = null;
  isLogged: boolean = false;

  private readonly logged_user_key = 'logged_user';

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
      console.log("ROL ACTUAL DE USUARIO: ", this.currentUser.role);
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

  async isAuthenticated() {
    
    console.log("Checking if user is authenticated...");
    try {
      // Verifica si hay un usuario en memoria
      if (this.currentUser) {
        console.log('User exists in memory');
        return true;  
      }
  
      // Si no está en memoria, verifica en el almacenamiento
      const user = await this.storage.get(this.logged_user_key);
      
      if (user) {
        console.log('User found in storage, setting currentUser');
        this.isLogged = true;
        this.currentUser = user;
        return true;
      }
  
      console.log('No user found');
      return false;
    } catch (error) {
      console.error("Error checking authentication", error);
      return false; // O manejar el error de manera adecuada
    }
  }

  async logout() { 
    await this.storage.clearCurrentUser();  // Limpiar el usuario en almacenamiento local
    await this.storage.remove(this.logged_user_key);
    this.currentUser = null;
    this.isLogged = false;
  }

  //Obtener el usuario actual
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Obtener el rol del usuario actual
  getCurrentUserRole(): number | null {
    return this.currentUser?.role || null;
    //return this.currentUser ? this.currentUser.role : null;
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
