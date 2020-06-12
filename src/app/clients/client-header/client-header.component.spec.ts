import { async, ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<< HEAD:src/app/clients/client-header/client-header.component.spec.ts
import { ClientHeaderComponent } from './client-header.component';

describe('ClientHeaderComponent', () => {
  let component: ClientHeaderComponent;
  let fixture: ComponentFixture<ClientHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientHeaderComponent ]
=======
import { SalesOrderViewComponent } from './sales-order-view.component';

describe('SalesOrderViewComponent', () => {
  let component: SalesOrderViewComponent;
  let fixture: ComponentFixture<SalesOrderViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderViewComponent ]
>>>>>>> 3a8bac1da9386ba0033571bf68327b41ca587acf:src/app/settings/workflow/sales-order-workflow/sales-order-view/sales-order-view.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<< HEAD:src/app/clients/client-header/client-header.component.spec.ts
    fixture = TestBed.createComponent(ClientHeaderComponent);
=======
    fixture = TestBed.createComponent(SalesOrderViewComponent);
>>>>>>> 3a8bac1da9386ba0033571bf68327b41ca587acf:src/app/settings/workflow/sales-order-workflow/sales-order-view/sales-order-view.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
