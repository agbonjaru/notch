import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesMoreComponent } from './companies-more.component';

describe('CompaniesMoreComponent', () => {
  let component: CompaniesMoreComponent;
  let fixture: ComponentFixture<CompaniesMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompaniesMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
