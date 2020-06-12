import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketLifecycleComponent } from './ticket-lifecycle.component';

describe('TicketLifecycleComponent', () => {
  let component: TicketLifecycleComponent;
  let fixture: ComponentFixture<TicketLifecycleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketLifecycleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketLifecycleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
