import {Injectable, OnInit} from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  
  constructor(private readonly storage: Storage) { 
    this.init();
  }

  async init(): Promise<void> {
    const storage = await this.storage.create();
    this._storage = storage;

  }

  // Métodos para interactuar con los usuarios
  public async getUsers() {
    const users = await this._storage?.get('users');
    console.log(users);
    return users || []
  }

  // Guardar lista completa de usuarios
  public async saveUsers(users: any[]): Promise<void> {
    await this._storage?.set('users', users);
  }

  // Guardar el usuario en localStorage
  saveCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Agregar un solo usuario
  public async addUser(user: any): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this._storage?.set('users', users);
  }

  // Actualizar un usuario
  public async updateUser(updatedUser: any): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex((user: any) => user.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      await this._storage?.set('users', users);
    }
  }

  // Eliminar un usuario
  public async deleteUser(id: number): Promise<void> {
    let users = await this.getUsers();
    users = users.filter((user: any) => user.id !== id);
    await this._storage?.set('users', users);
  }

  // Obtener el usuario actual autenticado
  public async getCurrentUser(){
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Eliminar el usuario actual (cerrar sesión)
  public async clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  // Método para guardar los usuarios en el Storage
  public async set(key: string, value: any): Promise<void> {
    await this._storage?.set(key, value);
  }
}