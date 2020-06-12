import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentperformanceComponent } from './agentperformance.component';

describe('AgentperformanceComponent', () => {
  let component: AgentperformanceComponent;
  let fixture: ComponentFixture<AgentperformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentperformanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentperformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
