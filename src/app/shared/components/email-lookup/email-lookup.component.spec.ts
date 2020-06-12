import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailLookupComponent } from './email-lookup.component';

describe('EmailLookupComponent', () => {
  let component: EmailLookupComponent;
  let fixture: ComponentFixture<EmailLookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailLookupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
