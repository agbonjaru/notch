import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationSidebarComponent } from './quotation-sidebar.component';

describe('QuotationSidebarComponent', () => {
  let component: QuotationSidebarComponent;
  let fixture: ComponentFixture<QuotationSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
