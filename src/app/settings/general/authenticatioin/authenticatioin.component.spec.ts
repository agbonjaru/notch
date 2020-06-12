import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticatioinComponent } from './authenticatioin.component';

describe('AuthenticatioinComponent', () => {
  let component: AuthenticatioinComponent;
  let fixture: ComponentFixture<AuthenticatioinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthenticatioinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticatioinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
