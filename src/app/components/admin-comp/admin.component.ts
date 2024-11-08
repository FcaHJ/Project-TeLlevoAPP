import { Component, OnInit } from '@angular/core';
import { UserService,User } from 'src/app/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {

  users: User[] = [];
  newUser: User = {
    id: 0,
    username: '',
    password: '',
    email: '',
    fullname: '',
    role: 1
  };

  constructor(private db: UserService) {}

  ngOnInit() {
    this.users = this.db.getUsers();  // Cargar los usuarios al iniciar
  }

  createUser() {
    this.db.addUser(this.newUser);
    this.users = this.db.getUsers();  // Actualizar la lista de usuarios
    this.newUser = { id: 0, username: '', password: '', email: '', fullname: '', role: 1 };  // Limpiar el formulario
  }

  updateUser(user: User) {
    this.db.updateUser(user);
    this.users = this.db.getUsers();
  }

  deleteUser(id: number) {
    this.db.deleteUser(id);
    this.users = this.db.getUsers();
  }
}
