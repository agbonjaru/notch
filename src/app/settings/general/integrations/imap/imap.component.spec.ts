import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImapComponent } from './imap.component';

describe('ImapComponent', () => {
  let component: ImapComponent;
  let fixture: ComponentFixture<ImapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
