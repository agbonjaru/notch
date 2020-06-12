import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCreditProfileComponent } from './list-credit-profile.component';

describe('ListCreditProfileComponent', () => {
  let component: ListCreditProfileComponent;
  let fixture: ComponentFixture<ListCreditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCreditProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCreditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
