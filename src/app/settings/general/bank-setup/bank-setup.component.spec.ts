import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankSetupComponent } from './bank-setup.component';

describe('BankSetupComponent', () => {
  let component: BankSetupComponent;
  let fixture: ComponentFixture<BankSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
