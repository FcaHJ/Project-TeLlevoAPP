import { Injectable } from '@angular/core';
import { UserService,User } from './user.service';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | null = null;
  isLogged: boolean = false;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();


  private readonly logged_user_key = 'logged_user';

  constructor(private userService: UserService, private storage: StorageService) {
    this.loadCurrentUser(); 
  }

  // Método para actualizar el usuario actual
  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.currentUserSubject.next(user);
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    // Autenticación
    const user = await this.userService.getUserByUsername(username);
    if (user && user.password === password) {
      this.setCurrentUser(user);
      await this.storage.saveCurrentUser(user);
      return user;
    }
    return null;
  }

  // Cargar el usuario desde almacenamiento local 
  async loadCurrentUser(): Promise<void> {
    const user = await this.storage.getCurrentUser();
    this.setCurrentUser(user || null);
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
      const user = await this.storage.getCurrentUser();
      
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

  async logout(): Promise<void> {
    await this.storage.clearCurrentUser();
    this.setCurrentUser(null);
    await this.loadCurrentUser();
  }

  //Obtener el usuario actual
  getCurrentUser() {
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
