import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesDetailsComponent } from './companies-details.component';

describe('CompaniesDetailsComponent', () => {
  let component: CompaniesDetailsComponent;
  let fixture: ComponentFixture<CompaniesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompaniesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
