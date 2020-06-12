import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderWorkflowCreateComponent } from './sales-order-workflow-create.component';

describe('SalesOrderWorkflowCreateComponent', () => {
  let component: SalesOrderWorkflowCreateComponent;
  let fixture: ComponentFixture<SalesOrderWorkflowCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderWorkflowCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderWorkflowCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
