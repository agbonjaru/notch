import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderWorkflowEditComponent } from './sales-order-workflow-edit.component';

describe('SalesOrderWorkflowEditComponent', () => {
  let component: SalesOrderWorkflowEditComponent;
  let fixture: ComponentFixture<SalesOrderWorkflowEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderWorkflowEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesOrderWorkflowEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
