import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDiagramComponent } from './invoice-diagram.component';

describe('InvoiceDiagramComponent', () => {
  let component: InvoiceDiagramComponent;
  let fixture: ComponentFixture<InvoiceDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
