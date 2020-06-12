import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadToCompanyComponent } from './lead-to-company.component';

describe('LeadToCompanyComponent', () => {
  let component: LeadToCompanyComponent;
  let fixture: ComponentFixture<LeadToCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadToCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadToCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
