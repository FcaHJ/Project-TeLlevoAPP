import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeDriverPage } from './home-driver.page';

describe('HomeDriverPage', () => {
  let component: HomeDriverPage;
  let fixture: ComponentFixture<HomeDriverPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
