import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loggedUser: User | null = null;
  isLogged: boolean = false;

  private readonly logged_user_key = 'logged_user';
  private readonly users_key = 'users';

  constructor(
    private readonly storageService: StorageService,
    private readonly userService: UserService
  ) { }

  //Autentica usuario
  async authenticate(u: string, p: string): Promise<User | null> {
    const founds = await firstValueFrom(this.userService.findUserByUsername(u)); //Obtiene lista de usuarios

    if (founds.length > 0) {
      const found = founds[0]
      console.log('It found user: ', found.username)
      const matchPwd = found.password === p;
      if (matchPwd) {
        this.loggedUser = found;
        this.isLogged = true;
        await this.storageService.set(this.logged_user_key, this.loggedUser);
        return found
      }
      console.log('User not found: ', u);
    }
    return null;
  }

  //Verifica usuario auntenticado
  async isAuthenticated() {
    console.log(this.loggedUser)
    console.log(this.isLogged)
    const userInMemory = this.loggedUser !== null;
    console.log("user exist: " + userInMemory)
    if (!userInMemory) {
      const user = await this.storageService.get(this.logged_user_key);
      if (user) {
        console.log('LoginService found user in storage')
        this.isLogged = true;
        this.loggedUser = user;
      }
    }
    return this.isLogged;
  }

  //Cerrar sesion del storage
  async logout() {
    this.loggedUser = null;
    this.isLogged = false;
    return this.storageService
      .remove(this.logged_user_key)
      .then(() => console.log('User removed from storage'));
  }

  //ARREGLAR
  private currentUser: User | null =null //Almacena usuario registrado;

// valida credenciales del login *//*
/*
  validateLogin(u: string, p:string): boolean {
    const found = this.users.find(user => user.username === u)
    if (found != undefined) {
      this.currentUser = found;
      return found.password === p;
    }
    return false;
  }*/

  
  async passwordRecovery(u: string): Promise<boolean> {
    // Cargar la lista de usuarios desde el almacenamiento
    const users: User[] = await this.storageService.get(this.users_key) || [];

    // Buscar el usuario en la lista
    const found = users.find(user => user.username === u);
    if (found) {
      this.currentUser = found; // Usuario encontrado
      return true; // Usuario válido
    }

    return false; // En caso de no encontrar un nombre de usuario válido
  }/*
    const found = this.users.find(user => user.username === u)
    if (found != undefined) {
      this.currentUser = found; // Usuario actualmente autenticado o logueado en el sistema.
      return found.username === u; // Si el nombre de usuario es valido
    }
    return false; // En caso de no encontrar un nombre de usuario valido
    
  }*/

  async getCurrentUser(): Promise<User | null> {
    this.currentUser = await this.storageService.get('current_user');
    return this.currentUser; // Retorna el usuario autenticado
  }

  // Metodo para cambiar la contraseña del usuario autenticado
  async changePassword(newPassword: string): Promise<boolean> {
    if (this.currentUser) {
      this.currentUser.password = newPassword;
      await this.storageService.set('current_user', this.currentUser);
      return true;
    }
    return false;
  }
}
