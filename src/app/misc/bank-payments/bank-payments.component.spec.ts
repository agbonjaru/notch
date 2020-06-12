import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankPaymentsComponent } from './bank-payments.component';

describe('BankPaymentsComponent', () => {
  let component: BankPaymentsComponent;
  let fixture: ComponentFixture<BankPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
