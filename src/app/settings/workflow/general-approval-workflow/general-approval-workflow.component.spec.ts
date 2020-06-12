import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralApprovalWorkflowComponent } from './general-approval-workflow.component';

describe('GeneralApprovalWorkflowComponent', () => {
  let component: GeneralApprovalWorkflowComponent;
  let fixture: ComponentFixture<GeneralApprovalWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralApprovalWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralApprovalWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
