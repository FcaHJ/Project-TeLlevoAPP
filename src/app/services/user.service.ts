import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Observable, of } from 'rxjs';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  fullname: string;
  role: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService  {
  url = 'http://localhost:3000/api/users';
  private users: User[] = [];

  constructor(private http: HttpClient, private storage: StorageService) {
    this.loadUsersStorage();
  }

  // Cargar usuarios, primero desde el servidor, y si falla, desde el almacenamiento local
  loadUsersStorage(): void {
    // Cargar los usuarios desde el almacenamiento local
    this.storage.getUsers().then((users) => {
      if (users && users.length > 0) {
        this.users = users;  
      } else {
        // Si no hay usuarios en el storage, los obtenemos desde la API
        this.http.get<User[]>(this.url).subscribe((data) => {
          this.users = data;  // Asignamos los usuarios obtenidos desde la API
          this.storage.set('users', data);  // Guardamos los usuarios en Storage
        });
      }
    });
  }

  // Cargar los usuarios desde la API, si no están disponibles en el almacenamiento local
  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url).pipe(
      map((data) => {
        this.users = data; 
        this.storage.set('users', data);  
        return this.users;
      }),
      catchError(() => {
        return of(this.users);
      })
    );
  }

  // Obtener todos los usuarios
  getUsers(): User[] {
    return this.users;
  }

  // Obtener un usuario por ID
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  // Obtener un usuario por su nombre de usuario
  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // Agregar un nuevo usuario en ambos: servidor y almacenamiento local
  addUser(newUser: User): void {
    this.http.post<User>(this.url, newUser).subscribe((user) => {
      this.users.push(user);
      this.storage.addUser(user);  // Agregar al almacenamiento local
    });
  }

  // Actualizar usuario existente en ambos
  updateUser(updatedUser: User): void {
    this.http.put(`${this.url}/${updatedUser.id}`, updatedUser).subscribe(() => {
      const index = this.users.findIndex(user => user.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = updatedUser;
        
        // Actualizar los usuarios en el localStorage
        this.storage.set('users', this.users);
      }
    });
  }

  // Eliminar un usuario en ambos
  deleteUser(id: number): void {
    this.http.delete(`${this.url}/${id}`).subscribe(() => {
      this.users = this.users.filter(user => user.id !== id);
      this.storage.deleteUser(id);  // Eliminar del almacenamiento local
    });
  }
}
