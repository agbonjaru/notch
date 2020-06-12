import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadToContactComponent } from './lead-to-contact.component';

describe('LeadToContactComponent', () => {
  let component: LeadToContactComponent;
  let fixture: ComponentFixture<LeadToContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadToContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadToContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
