import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailFeedsComponent } from './email-feeds.component';

describe('EmailFeedsComponent', () => {
  let component: EmailFeedsComponent;
  let fixture: ComponentFixture<EmailFeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailFeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailFeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
