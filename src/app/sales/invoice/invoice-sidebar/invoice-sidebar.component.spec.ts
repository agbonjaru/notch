import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSidebarComponent } from './invoice-sidebar.component';

describe('InvoiceSidebarComponent', () => {
  let component: InvoiceSidebarComponent;
  let fixture: ComponentFixture<InvoiceSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
