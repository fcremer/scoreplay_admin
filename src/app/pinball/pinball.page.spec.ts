import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PinballPage } from './pinball.page';

describe('PinballPage', () => {
  let component: PinballPage;
  let fixture: ComponentFixture<PinballPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PinballPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
