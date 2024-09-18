import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      // Después de 3 segundos, redirige a la página de inicio
      this.router.navigateByUrl('/home');
    }, 3000); // Simula una carga de 3 segundos
  }
}
