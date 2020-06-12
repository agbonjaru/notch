import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadCustomerComponent } from './lead-customer.component';

describe('LeadCustomerComponent', () => {
  let component: LeadCustomerComponent;
  let fixture: ComponentFixture<LeadCustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadCustomerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
