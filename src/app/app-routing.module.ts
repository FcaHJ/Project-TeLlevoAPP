import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NonAuthenticationGuard } from './guards/non-auth.guard';
import { AuthenticationGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [NonAuthenticationGuard],
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home', 
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'users',
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/users/users.module').then( m => m.UsersPageModule)
  },
  {
    path: 'profile',
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'password-recov',
    loadChildren: () => import('./pages/pwd-recov/pwd-recov.module').then( m => m.PwdRecovPageModule)
  },
  {
    path: 'loading',
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/loading/loading.module').then( m => m.LoadingPageModule)
  },
  {
    path: 'home-driver',
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/home-driver/home-driver.module').then( m => m.HomeDriverPageModule)
  },
  {
    path: 'booking',
    canActivate: [AuthenticationGuard],
    loadChildren: () => import('./pages/booking/booking.module').then( m => m.BookingPageModule)
  },
  {
    path: '**',  // Captura todas las rutas no existentes
    loadChildren: () => import('./pages/not-found/not-found.module').then( m => m.NotFoundPageModule)
  },


 






];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
