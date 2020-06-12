import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyLeadComponent } from './company-lead.component';

describe('CompanyLeadComponent', () => {
  let component: CompanyLeadComponent;
  let fixture: ComponentFixture<CompanyLeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyLeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyLeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
