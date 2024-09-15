import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwdRecovPage } from './pwd-recov.page';

describe('PwdRecovPage', () => {
  let component: PwdRecovPage;
  let fixture: ComponentFixture<PwdRecovPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdRecovPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
