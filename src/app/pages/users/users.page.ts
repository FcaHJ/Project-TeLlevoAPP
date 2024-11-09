import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService,User } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  userRole: number | null = null;
  users: User[] = [];
  newUser: User = {
    id: 0,
    username: '',
    password: '',
    email: '',
    fullname: '',
    role: 1
  };

  constructor(private db: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
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

