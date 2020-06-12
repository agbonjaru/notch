import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesSubnavComponent } from './sales-subNav.component';

describe('SalesSubnavComponent', () => {
  let component: SalesSubnavComponent;
  let fixture: ComponentFixture<SalesSubnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesSubnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesSubnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
