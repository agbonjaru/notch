import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSubnavComponent } from './ticket-subnav.component';

describe('TicketSubnavComponent', () => {
  let component: TicketSubnavComponent;
  let fixture: ComponentFixture<TicketSubnavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketSubnavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketSubnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
