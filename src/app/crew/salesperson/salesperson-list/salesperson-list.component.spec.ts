import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalespersonListComponent } from './salesperson-list.component';

describe('SalespersonListComponent', () => {
  let component: SalespersonListComponent;
  let fixture: ComponentFixture<SalespersonListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalespersonListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalespersonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
