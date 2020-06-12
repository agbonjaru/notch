import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackOutlookComponent } from './callback-outlook.component';

describe('CallbackOutlookComponent', () => {
  let component: CallbackOutlookComponent;
  let fixture: ComponentFixture<CallbackOutlookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallbackOutlookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackOutlookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
