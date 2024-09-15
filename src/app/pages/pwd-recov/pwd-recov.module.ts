import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PwdRecovPageRoutingModule } from './pwd-recov-routing.module';

import { PwdRecovPage } from './pwd-recov.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PwdRecovPageRoutingModule
  ],
  declarations: [PwdRecovPage]
})
export class PwdRecovPageModule {}
