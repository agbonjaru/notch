import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketReportsComponent } from './ticket-reports.component';

describe('TicketReportsComponent', () => {
  let component: TicketReportsComponent;
  let fixture: ComponentFixture<TicketReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
