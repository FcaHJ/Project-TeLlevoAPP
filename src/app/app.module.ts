import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ModalComponent } from './components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { StorageService } from './services/storage.service';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient, withInterceptorsFromDi, HttpClientModule } from '@angular/common/http';
import { HomePageModule } from './pages/home/home.module';
import { AuthService } from './services/auth.service';
import { ProfilePageModule } from './pages/profile/profile.module';
import { UsersPageModule } from './pages/users/users.module';
import { MenuComponent } from './components/menu/menu.component';

export function initApp(storageService: StorageService) {
  return () => storageService.init();
}
export function storageService() {
  return {
    provide: APP_INITIALIZER,
    useFactory: initApp,
    deps: [StorageService],
    multi: true,
  };
}

export function routeReuseStrategy() {
  return { provide: RouteReuseStrategy, useClass: IonicRouteStrategy };
}

@NgModule({
  declarations: [AppComponent, ModalComponent, MenuComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    FormsModule, 
    HttpClientModule,
    IonicStorageModule.forRoot(),
    RouterModule,
  ],
  providers: [
    routeReuseStrategy(), 
    storageService(), 
    provideHttpClient(withInterceptorsFromDi()), 
    AuthService 
    ],
  bootstrap: [AppComponent],
})
export class AppModule {}
