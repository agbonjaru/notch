import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceQuotationComponent } from './invoice-quotation.component';

describe('InvoiceQuotationComponent', () => {
  let component: InvoiceQuotationComponent;
  let fixture: ComponentFixture<InvoiceQuotationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceQuotationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
