import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadWorkflowComponent } from './lead-workflow.component';

describe('LeadWorkflowComponent', () => {
  let component: LeadWorkflowComponent;
  let fixture: ComponentFixture<LeadWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
