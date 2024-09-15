import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PwdRecovPage } from './pwd-recov.page';

const routes: Routes = [
  {
    path: '',
    component: PwdRecovPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PwdRecovPageRoutingModule {}
