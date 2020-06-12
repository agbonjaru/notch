import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAnalysisComponent } from './customer-analysis.component';

describe('CustomerAnalysisComponent', () => {
  let component: CustomerAnalysisComponent;
  let fixture: ComponentFixture<CustomerAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
