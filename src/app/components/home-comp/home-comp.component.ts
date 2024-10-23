import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home-comp',
  templateUrl: './home-comp.component.html',
  styleUrls: ['./home-comp.component.scss'],
})
export class HomeCompComponent  implements OnInit {

  username!: string;

  constructor(private authService: AuthService) { }

  async ngOnInit() {
    //Muestra el nombre de usuario
    const logged_user: User | null = await this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
  }
  }
}
