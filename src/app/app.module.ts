import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ModalComponent } from './components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { StorageService } from './services/storage.service';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient, withInterceptorsFromDi, HttpClientModule } from '@angular/common/http';

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
  declarations: [AppComponent, ModalComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    FormsModule, 
    HttpClientModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [ routeReuseStrategy(), storageService(), provideHttpClient(withInterceptorsFromDi()) ],
  bootstrap: [AppComponent],
})
export class AppModule {}
