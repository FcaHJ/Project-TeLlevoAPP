import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/api/login.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  username!: string;

  constructor(private loginService: LoginService) {  
  }
  
  ngOnInit() {
    //Muestra el nombre de usuario
    const currentUser: User | null = this.loginService.getCurrentUser();
    if (currentUser) {
      this.username = currentUser.username;
  }
  }
}
