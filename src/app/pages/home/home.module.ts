import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { HomeCompComponent } from 'src/app/components/home-comp/home-comp.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';
import { AdminComponent } from 'src/app/components/admin-comp/admin.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, HomeCompComponent, ProfileComponent, AdminComponent]
})
export class HomePageModule {}
