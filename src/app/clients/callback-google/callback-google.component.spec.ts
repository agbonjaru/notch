import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackGoogleComponent } from './callback-google.component';

describe('CallbackGoogleComponent', () => {
  let component: CallbackGoogleComponent;
  let fixture: ComponentFixture<CallbackGoogleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackGoogleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackGoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
