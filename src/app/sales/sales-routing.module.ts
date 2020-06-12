import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsListComponent } from '../crew/teams/teams-list/teams-list.component';
import { DealListComponent } from './deals/deal-list/deal-list.component';
import { CreateDealsComponent } from './deals/create-deals/create-deals.component';
import { DealViewComponent } from './deals/deal-view/deal-view.component';
import { InvoiceListComponent } from './invoice/invoice-list/invoice-list.component';
import { CreateInvoiceComponent } from './invoice/create-invoice/create-invoice.component';
import { SalesOrderListComponent } from './sales-order/sales-order-list/sales-order-list.component';
import { CreateSalesOrderComponent } from './sales-order/create-sales-order/create-sales-order.component';
import { PipelineComponent } from '../shared/components/pipeline/pipeline.component';
import { QuotationListComponent } from './quotation/quotation-list/quotation-list.component';
import { CreateQuoteComponent } from './quotation/create-quote/create-quote.component';
import { SubscriptionListComponent } from './subscription/subscription-list/subscription-list.component';
import { CreateSubscriptionComponent } from './subscription/create-subscription/create-subscription.component';
import { EditSubscriptionComponent } from './subscription/edit-subscription/edit-subscription.component';
import { EditQuotationComponent } from './quotation/edit-quotation/edit-quotation.component';
import { EditInvoiceComponent } from './invoice/edit-invoice/edit-invoice.component';
import { DealGuard, InvoiceGuard, SalesOrderGuard, QuotationGuard, SubscriptionGuard, AddDealGuard } from './sales.guard';

const salesRoutes: Routes = [
  {
    path: 'deals-list',
    component: DealListComponent,
    canActivate: [ DealGuard]
  },
  {
    path: 'create-deals',
    component: CreateDealsComponent,
    canActivate: [ DealGuard, AddDealGuard]
  },
  {
    path: 'deals-view/:id',
    component: DealViewComponent,
    canActivate: [ DealGuard]
  },
  {
    path: 'invoice-list',
    component: InvoiceListComponent,
    canActivate: [InvoiceGuard]
  },
  {
    path: 'create-invoice',
    component: CreateInvoiceComponent,
    canActivate: [InvoiceGuard]
  },
  {
    path: 'edit-invoice/:id',
    component: EditInvoiceComponent,
    canActivate: [InvoiceGuard]
  },
  {
    path: 'sales-order-list',
    component: SalesOrderListComponent,
    canActivate: [SalesOrderGuard]
  },
  {
    path: 'create-sales-order',
    component: CreateSalesOrderComponent,
    canActivate: [SalesOrderGuard]
  },
  {
    path: 'pipeline',
    component: PipelineComponent,
    canActivate: [SalesOrderGuard]
  },
  {
    path: 'quotation-list',
    component: QuotationListComponent,
    canActivate: [QuotationGuard]
  },
  {
    path: 'create-quote',
    component: CreateQuoteComponent,
    canActivate: [QuotationGuard]
  },
  {
    path: 'edit-quotation/:id',
    component: EditQuotationComponent,
    canActivate: [QuotationGuard]
  },
  {
    path: 'Subscriptions-list',
    component: SubscriptionListComponent,
    canActivate: [SubscriptionGuard]
  },
  {
    path: 'Create-Subscriptions',
    component: CreateSubscriptionComponent,
    canActivate: [SubscriptionGuard]
  },
  {
    path: 'edit-subscriptions/:id',
    component: EditSubscriptionComponent,
    canActivate: [SubscriptionGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(salesRoutes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
