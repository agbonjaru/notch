import { LaddaModule } from "angular2-ladda";
import { SharedModule } from "./../shared/shared.module";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FateModule } from "fate-editor";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

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
import { SettingsHeaderComponent } from "./settings-header/settings-header.component";
import { SettingsRoutingModule } from "./settings-routing.module";
import { SettingsSidebarComponent } from "./settings-sidebar/settings-sidebar.component";
import { InvoiceQuotationComponent } from "./templates/invoice-quotation/invoice-quotation.component";
import { Temp1Component } from "./templates/invoice-quotation/temp1/temp1.component";
import { Temp2Component } from "./templates/invoice-quotation/temp2/temp2.component";
import { Temp3Component } from "./templates/invoice-quotation/temp3/temp3.component";
import { Temp4Component } from "./templates/invoice-quotation/temp4/temp4.component";
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
import { LogActivityComponent } from "./general/log-activity/log-activity.component";
import { ImapIntegrationComponent } from "./general/integrations/imap/imap.component";
import { DealReasonsComponent } from "./workflow/deal-reasons/deal-reasons.component";
import { BillingSubscriptionComponent } from "./billing-subscription/billing-subscription.component";
import { TwitterIntegrationComponent } from "./general/integrations/twitter/twitter.component";
import { MatDialogModule, MatSlideToggleModule } from "@angular/material";
import { SelectCardModalComponent } from "./billing-subscription/select-card/select-card-modal.component";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ErrorInterceptor } from "../helpers/error.interceptor.service";
import { SettingsGuard } from "./settings.guard";
import { NgxPaginationModule } from "ngx-pagination";
import { SalesOrderWorkflowCreateComponent } from "./workflow/sales-order-workflow-create/sales-order-workflow-create.component";
import { SalesOrderWorkflowEditComponent } from "./workflow/sales-order-workflow-edit/sales-order-workflow-edit.component";

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    FormsModule,
    LaddaModule,
    SharedModule,
    SelectDropDownModule,
    NgxPaginationModule,
    FateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSlideToggleModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],

  declarations: [
    UserRolesComponent,
    RolesComponent,
    EmailNotificationComponent,
    ProductServicesComponent,
    LeadCustomerComponent,
    AuthenticatioinComponent,
    IntegrationsComponent,
    TicketInboundComponent,
    BulkMessagesComponent,
    SettingsSidebarComponent,
    DealsPipelineWorkflowComponent,
    GeneralApprovalWorkflowComponent,
    LeadWorkflowComponent,
    SalesOrderWorkflowComponent,
    RolesViewComponent,
    SalesCompetitionTerritoryComponent,
    Temp1Component,
    Temp2Component,
    Temp3Component,
    Temp4Component,
    MessagingComponent,
    InvoiceQuotationComponent,
    TemplateSequencingComponent,
    SequencingViewComponent,
    DealsPipelineViewComponent,
    SettingsHeaderComponent,
    SalesOrderViewComponent,
    ListCreditProfileComponent,
    ListClientCreditProfileComponent,
    TicketSettingsComponent,
    BankSetupComponent,
    SupervisorComponent,
    SupervisorViewComponent,
    LogActivityComponent,
    ImapIntegrationComponent,
    TwitterIntegrationComponent,
    DealReasonsComponent,
    BillingSubscriptionComponent,
    SelectCardModalComponent,
    SalesOrderWorkflowCreateComponent,
    SalesOrderWorkflowEditComponent,
  ],
  providers: [
    ...SettingsGuard,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  entryComponents: [SelectCardModalComponent],
})
export class SettingModule {}
