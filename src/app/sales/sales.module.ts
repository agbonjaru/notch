import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule, MatNativeDateModule } from "@angular/material";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { FateModule } from "fate-editor";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { DealsService } from "../services/deals.service";
import { SharedModule } from "../shared/shared.module";
import { SalesOrderService } from "./../services/sales-order.service";
import { CreateDealsComponent } from "./deals/create-deals/create-deals.component";
import { DealListComponent } from "./deals/deal-list/deal-list.component";
import { DealNavComponent } from "./deals/deal-view/deal-nav/deal-nav.component";
import { DealStagesComponent } from "./deals/deal-view/deal-stages/deal-stages.component";
import { DealViewComponent } from "./deals/deal-view/deal-view.component";
import { CreateInvoiceComponent } from "./invoice/create-invoice/create-invoice.component";
import { EditInvoiceComponent } from "./invoice/edit-invoice/edit-invoice.component";
import { InvoiceListComponent } from "./invoice/invoice-list/invoice-list.component";
import { CreateQuoteComponent } from "./quotation/create-quote/create-quote.component";
import { EditQuotationComponent } from "./quotation/edit-quotation/edit-quotation.component";
import { QuotationListComponent } from "./quotation/quotation-list/quotation-list.component";
import { CreateSalesOrderComponent } from "./sales-order/create-sales-order/create-sales-order.component";
import { SalesOrderListComponent } from "./sales-order/sales-order-list/sales-order-list.component";
import { SalesRoutingModule } from "./sales-routing.module";
import { SalesSubnavComponent } from "./sales-subNav/sales-subNav.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { CreateSubscriptionComponent } from "./subscription/create-subscription/create-subscription.component";
import { EditSubscriptionComponent } from "./subscription/edit-subscription/edit-subscription.component";
import { SubscriptionListComponent } from "./subscription/subscription-list/subscription-list.component";
import { FilterComponent } from "./sidebar/filter/filter.component";
import { InvoiceDiagramComponent } from "./invoice/invoice-list/invoice-diagram/invoice-diagram.component";
import { InvoiceTableComponent } from "./invoice/invoice-list/invoice-table/invoice-table.component";
import { DealDashboardComponent } from "./deals/deal-list/deal-dashboard/deal-dashboard.component";
import { DealsListTableComponent } from "./deals/deal-list/deals-list-table/deals-list-table.component";
import { InvoiceSidebarComponent } from "./invoice/invoice-sidebar/invoice-sidebar.component";
import { QuotationSidebarComponent } from "./quotation/quotation-sidebar/quotation-sidebar.component";
import { SubscriptionSidebarComponent } from "./subscription/subscription-sidebar/subscription-sidebar.component";
import { InvoiceFilterComponent } from "./invoice/invoice-sidebar/invoice-filter/invoice-filter.component";
import { SalesOrderDashboardComponent } from "./sales-order/sales-order-dashboard/sales-order-dashboard.component";
import { SidebarSalesOrderComponent } from "./sales-order/sidebar-sales-order/sidebar-sales-order.component";
import { SalesOrderFilterComponent } from "./sales-order/sidebar-sales-order/sales-order-filter/sales-order-filter.component";
import { salesGuard } from "./sales.guard";
import { DirectiveModule } from '../shared/directives/directive.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SalesRoutingModule,
    SelectDropDownModule,
    SharedModule,

    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    FateModule,
    MatCardModule,
    NgbTypeaheadModule,
    BsDatepickerModule,
    DirectiveModule
  ],
  declarations: [
    DealListComponent,
    CreateDealsComponent,
    DealViewComponent,
    InvoiceListComponent,
    CreateInvoiceComponent,
    SalesOrderListComponent,
    CreateSalesOrderComponent,
    QuotationListComponent,
    CreateQuoteComponent,
    SubscriptionListComponent,
    CreateSubscriptionComponent,
    SidebarComponent,
    SalesSubnavComponent,
    EditSubscriptionComponent,
    EditQuotationComponent,
    EditInvoiceComponent,
    DealStagesComponent,
    DealNavComponent,
    FilterComponent,
    InvoiceDiagramComponent,
    InvoiceTableComponent,
    DealDashboardComponent,
    DealsListTableComponent,
    InvoiceSidebarComponent,
    QuotationSidebarComponent,
    SubscriptionSidebarComponent,
    InvoiceFilterComponent,
    SalesOrderDashboardComponent,
    SidebarSalesOrderComponent,
    SalesOrderFilterComponent
  ],
  exports: [],
  providers: [...salesGuard]
})
export class SalesModule {}
