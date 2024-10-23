import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  //newUser: User = { username: '', password: '' };

  private _storage: Storage | null = null;

  constructor(private readonly storage: Storage) {
    
   }

   async init(): Promise<void> {
    this._storage = await this.storage.create();;
  }


  /* Método para agregar un nuevo usuario
  addUser() {
    this.userService.addUser(this.newUser).subscribe({
      next: (user) => {
        console.log('Usuario agregado:', user);
      },
      error: (err) => {
        console.error('Error al agregar usuario:', err);
      }
    });
  }*/

  async get(key: string) {
    return this._storage?.get(key);
  }

  async set(key: string, value: any) {
    return this._storage?.set(key, value);
  }

  async remove(key: string) {
    await this._storage?.remove(key);
  }

  // Método para obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    return await this.get('users') || [];
  }
}
