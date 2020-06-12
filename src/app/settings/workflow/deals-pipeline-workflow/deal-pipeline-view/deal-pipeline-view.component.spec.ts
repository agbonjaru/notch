import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsPipelineViewComponent } from './deal-pipeline-view.component';

describe('DealsPipelineViewComponent', () => {
  let component: DealsPipelineViewComponent;
  let fixture: ComponentFixture<DealsPipelineViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealsPipelineViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealsPipelineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
