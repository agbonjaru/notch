import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadWorkflowItemComponent } from './lead-workflow-item.component';

describe('LeadWorkflowItemComponent', () => {
  let component: LeadWorkflowItemComponent;
  let fixture: ComponentFixture<LeadWorkflowItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadWorkflowItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadWorkflowItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
