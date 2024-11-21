import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService,User } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})

export class UsersPage implements OnInit {
  
  userRole: number | null = null;
  users: User[] = [];
  username!: string;
  isEditing: boolean = false; // Indica si estás editando un usuario
  newUser: User = {
    id: 0,
    username: '',
    password: '',
    email: '',
    fullname: '',
    role: 1,
  };

  constructor(
    private db: UserService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}


  ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
    this.users = this.db.getUsers(); // Cargar los usuarios al iniciar

    // Muestra el nombre de usuario
    const logged_user = this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
      console.log('Nombre de usuario:', this.username);
    }
  }

  createUser() {
    if (!this.isEditing) {
      this.db.addUser(this.newUser);
      console.log('Usuario agregado:', this.newUser);
    } else {
      this.updateUser(this.newUser);
    }
    this.resetForm();
    this.users = this.db.getUsers(); // Actualizar la lista de usuarios
  }
  updateUser(user: User) {
    this.db.updateUser(user);
    console.log('Usuario actualizado:', user);
    this.resetForm();
    this.users = this.db.getUsers(); // Actualizar la lista de usuarios
  }

  editUser(user: User) {
    this.isEditing = true;
    this.newUser = { ...user }; // Copiar los datos del usuario para editarlos
  }
  async confirmDeleteUser(id: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteUser(id),
        },
      ],
    });

    await alert.present();
  }
  deleteUser(id: number) {
    this.db.deleteUser(id);
    console.log('Usuario eliminado con ID:', id);
    this.users = this.db.getUsers(); // Actualizar la lista de usuarios
  }
  resetForm() {
    this.isEditing = false;
    this.newUser = {
      id: 0,
      username: '',
      password: '',
      email: '',
      fullname: '',
      role: 1,
    };
  }
}

