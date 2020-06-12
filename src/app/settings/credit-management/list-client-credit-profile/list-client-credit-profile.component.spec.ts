import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListClientCreditProfileComponent } from './list-client-credit-profile.component';

describe('ListClientCreditProfileComponent', () => {
  let component: ListClientCreditProfileComponent;
  let fixture: ComponentFixture<ListClientCreditProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListClientCreditProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListClientCreditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
