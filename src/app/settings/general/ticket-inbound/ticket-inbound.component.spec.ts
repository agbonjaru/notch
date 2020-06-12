import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketInboundComponent } from './ticket-inbound.component';

describe('TicketInboundComponent', () => {
  let component: TicketInboundComponent;
  let fixture: ComponentFixture<TicketInboundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketInboundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketInboundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
