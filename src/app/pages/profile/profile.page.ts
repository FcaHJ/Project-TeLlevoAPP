import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { User } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userRole: number | null = null;

  user: User | null = null
  username!: string;
  email!: string;
  password!: string;
  fullname!: string;

  constructor(private storageService: StorageService, private authService: AuthService) { }

  async ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();

    const logged_user: User | null = await this.authService.getCurrentUser();
    if (logged_user) {
      this.username = logged_user.username;
      this.email = logged_user.email;
      this.password = logged_user.password;
      this.fullname = logged_user.fullname;
    }
  }
}
