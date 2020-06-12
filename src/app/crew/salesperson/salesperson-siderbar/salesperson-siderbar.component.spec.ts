import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalespersonSiderbarComponent } from './salesperson-siderbar.component';

describe('SalespersonSiderbarComponent', () => {
  let component: SalespersonSiderbarComponent;
  let fixture: ComponentFixture<SalespersonSiderbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalespersonSiderbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalespersonSiderbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
