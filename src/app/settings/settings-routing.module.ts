import {
  UserROleAccessGuard,
  RolesGuard,
  SupervisorGuard,
  EmailNotificationGuard,
  BankSetupGuard,
  ProductAndServiceGuard,
  LeadSourceGuard,
  TwoFactorAuthGuard,
  IntergrationsGuard,
  TicketInboundCommssGuard,
  TicketSettingsGuard,
  BulkMessagesGuard,
  DealsWorkflowGuard,
  DealLostReasonGuard,
  GeneralApproveWorkflowGuard,
  LeadWorkflowGuard,
  SalesOrderWorkflowGuard,
  SalesCompetitorGuard,
  InvQuoteTemplateGuard,
  ChatSMSWhatsappTemplateGuard,
  EmailSeqTemplateGuard,
} from "./settings.guard";
import { DealReasonsComponent } from "./workflow/deal-reasons/deal-reasons.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthenticatioinComponent } from "./general/authenticatioin/authenticatioin.component";
import { BulkMessagesComponent } from "./general/bulk-messages/bulk-messages.component";
import { EmailNotificationComponent } from "./general/email-notification/email-notification.component";
import { IntegrationsComponent } from "./general/integrations/integrations.component";
import { LeadCustomerComponent } from "./general/lead-customer/lead-customer.component";
import { ProductServicesComponent } from "./general/product-services/product-services.component";
import { RolesViewComponent } from "./general/roles/roles-view/roles-view.component";
import { RolesComponent } from "./general/roles/roles.component";
import { TicketInboundComponent } from "./general/ticket-inbound/ticket-inbound.component";
import { UserRolesComponent } from "./general/user-roles/user-roles.component";
import { SalesCompetitionTerritoryComponent } from "./sales/sales-competition-territory/sales-competition-territory.component";
import { InvoiceQuotationComponent } from "./templates/invoice-quotation/invoice-quotation.component";
import { MessagingComponent } from "./templates/messaging/messaging.component";
import { SequencingViewComponent } from "./templates/template-sequencing/sequencing-view/sequencing-view.component";
import { TemplateSequencingComponent } from "./templates/template-sequencing/template-sequencing.component";
import { DealsPipelineViewComponent } from "./workflow/deals-pipeline-workflow/deal-pipeline-view/deal-pipeline-view.component";
import { DealsPipelineWorkflowComponent } from "./workflow/deals-pipeline-workflow/deals-pipeline-workflow.component";
import { GeneralApprovalWorkflowComponent } from "./workflow/general-approval-workflow/general-approval-workflow.component";
import { LeadWorkflowComponent } from "./workflow/lead-workflow/lead-workflow.component";
import { SalesOrderViewComponent } from "./workflow/sales-order-workflow/sales-order-view/sales-order-view.component";
import { SalesOrderWorkflowComponent } from "./workflow/sales-order-workflow/sales-order-workflow.component";
import { ListCreditProfileComponent } from "./credit-management/list-credit-profile/list-credit-profile.component";
import { ListClientCreditProfileComponent } from "./credit-management/list-client-credit-profile/list-client-credit-profile.component";
import { TicketSettingsComponent } from "./general/ticket-settings/ticket-settings.component";
import { BankSetupComponent } from "./general/bank-setup/bank-setup.component";
import { SupervisorComponent } from "./general/supervisor/supervisor.component";
import { SupervisorViewComponent } from "./general/supervisor/supervisor-view/supervisor-view.component";
import { BillingSubscriptionComponent } from "./billing-subscription/billing-subscription.component";
import { LogActivityComponent } from "./general/log-activity/log-activity.component";
import { SalesOrderWorkflowCreateComponent } from "./workflow/sales-order-workflow-create/sales-order-workflow-create.component";
import { SalesOrderWorkflowEditComponent } from "./workflow/sales-order-workflow-edit/sales-order-workflow-edit.component";

const settingsRoutes: Routes = [
  // General
  {
    path: "User-Roles",
    component: UserRolesComponent,
    canActivate: [UserROleAccessGuard],
  },
  {
    path: "Roles",
    component: RolesComponent,
    canActivate: [RolesGuard],
  },
  {
    path: "Roles/:name/:id",
    component: RolesViewComponent,
    canActivate: [RolesGuard],
  },
  {
    path: "supervisor",
    component: SupervisorComponent,
    canActivate: [SupervisorGuard],
  },
  {
    path: "supervisor/:id/:name/:email",
    component: SupervisorViewComponent,
    canActivate: [SupervisorGuard],
  },
  {
    path: "notification",
    component: EmailNotificationComponent,
    canActivate: [EmailNotificationGuard],
  },
  {
    path: "bank-setup",
    component: BankSetupComponent,
    canActivate: [BankSetupGuard],
  },
  {
    path: "product-services",
    component: ProductServicesComponent,
    canActivate: [ProductAndServiceGuard],
  },
  {
    path: "lead-customer",
    component: LeadCustomerComponent,
    canActivate: [LeadSourceGuard],
  },
  {
    path: "auth",
    component: AuthenticatioinComponent,
    canActivate: [TwoFactorAuthGuard],
  },
  {
    path: "integration",
    component: IntegrationsComponent,
    canActivate: [IntergrationsGuard],
  },
  {
    path: "ticket-inbound",
    component: TicketInboundComponent,
    canActivate: [TicketInboundCommssGuard],
  },
  {
    path: "ticket-settings",
    component: TicketSettingsComponent,
    canActivate: [TicketSettingsGuard],
  },
  {
    path: "bulk-messages",
    component: BulkMessagesComponent,
    canActivate: [BulkMessagesGuard],
  },
  // WorkFlow
  {
    path: "deals-workflow",
    component: DealsPipelineWorkflowComponent,
    canActivate: [DealsWorkflowGuard],
  },
  {
    path: "deals-reason",
    component: DealReasonsComponent,
    canActivate: [DealLostReasonGuard],
  },
  {
    path: "deals-workflow/:id",
    component: DealsPipelineViewComponent,
  },
  {
    path: "approval-workflow",
    component: GeneralApprovalWorkflowComponent,
    canActivate: [GeneralApproveWorkflowGuard],
  },
  {
    path: "lead-workflow",
    component: LeadWorkflowComponent,
    canActivate: [LeadWorkflowGuard],
  },
  {
    path: "sales-workflow-create",
    component: SalesOrderWorkflowCreateComponent,
    canActivate: [SalesOrderWorkflowGuard],
  },
  {
    path: "sales-workflow-edit/:id",
    component: SalesOrderWorkflowEditComponent,
    canActivate: [SalesOrderWorkflowGuard],
  },
  {
    path: "sales-workflow",
    component: SalesOrderWorkflowComponent,
    canActivate: [SalesOrderWorkflowGuard],
  },
  {
    path: "sales-workflow/:id",
    component: SalesOrderViewComponent,
    canActivate: [SalesOrderWorkflowGuard],
  },
  // sales
  {
    path: "sales-competition",
    component: SalesCompetitionTerritoryComponent,
    canActivate: [SalesCompetitorGuard],
  },
  // Templates
  {
    path: "invoice-quotation",
    component: InvoiceQuotationComponent,
    canActivate: [InvQuoteTemplateGuard],
  },
  {
    path: "messaging",
    component: MessagingComponent,
    canActivate: [ChatSMSWhatsappTemplateGuard],
  },
  {
    path: "template-sequencing",
    component: TemplateSequencingComponent,
    canActivate: [EmailSeqTemplateGuard],
  },
  {
    path: "template-sequencing/:id",
    component: SequencingViewComponent,
    canActivate: [EmailSeqTemplateGuard],
  },
  {
    path: "list-credit-profile",
    component: ListCreditProfileComponent,
  },
  {
    path: "view-credit-profile/:id/:name",
    component: ListClientCreditProfileComponent,
  },
  {
    path: "billing",
    component: BillingSubscriptionComponent,
  },
  {
    path: "log-activity",
    component: LogActivityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(settingsRoutes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
