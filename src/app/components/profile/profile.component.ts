import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/services/user.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent  implements OnInit {

  user: User | null = null
  id!: string;
  username!: string;
  email!: string;
  password!: string;


  constructor(private storageService: StorageService) { }

  ngOnInit() {
  }


}
