import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsPipelineWorkflowComponent } from './deals-pipeline-workflow.component';

describe('DealsPipelineWorkflowComponent', () => {
  let component: DealsPipelineWorkflowComponent;
  let fixture: ComponentFixture<DealsPipelineWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealsPipelineWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealsPipelineWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
