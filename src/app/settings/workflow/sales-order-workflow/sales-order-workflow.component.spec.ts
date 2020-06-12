import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderWorkflowComponent } from './sales-order-workflow.component';

describe('SalesOrderWorkflowComponent', () => {
  let component: SalesOrderWorkflowComponent;
  let fixture: ComponentFixture<SalesOrderWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
