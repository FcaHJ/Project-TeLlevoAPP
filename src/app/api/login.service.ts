import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  //Usuarios validos del sistema
  users: User[] = [
    new User('admin', 'admin@ionic.com', '1234'),
    new User('usuario', 'usuario@ionic.com', '4444'),
    new User('other', 'other@ionic.com', '1111'),
  ];
  
  private currentUser: User | null =null //Almacena usuario registrado;

  constructor() { }
/* valida credenciales del login */
  validateLogin(u: string, p:string): boolean {
    const found = this.users.find(user => user.username === u)
    if (found != undefined) {
      this.currentUser = found;
      return found.password === p;
    }
    return false;
  }

  
  passwordRecovery(u: string): boolean {
    const found = this.users.find(user => user.username === u)
    if (found != undefined) {
      this.currentUser = found; // Usuario actualmente autenticado o logueado en el sistema.
      return found.username === u; // Si el nombre de usuario es valido
    }
    return false; // En caso de no encontrar un nombre de usuario valido
  }

  getCurrentUser(): User | null {
    return this.currentUser; // Retorna el usuario autenticado
  }

  // Metodo para cambiar la contraseña del usuario autenticado
  changePassword(newPassword: string): boolean {
    if (this.currentUser) {
      this.currentUser.password = newPassword;
      return true;
    }
    return false;
  }
 
}