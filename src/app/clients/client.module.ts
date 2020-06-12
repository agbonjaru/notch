import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { ClientRoutingModule } from "./client-routing.module";

import { LeadDetailComponent } from "./leads/lead-detail/lead-detail.component";
import { LeadNavComponent } from "./leads/lead-detail/lead-nav/lead-nav.component";
import { SharedModule } from "../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CompaniesSideNavComponent } from "./companies/companies-side-nav/companies-side-nav.component";
import { CompaniesListComponent } from "./companies/companies-list/companies-list.component";
import { ClientHeaderComponent } from "./client-header/client-header.component";
import { LeadsListComponent } from "./leads/leads-list/leads-list.component";
import { CompaniesDetailsComponent } from "./companies/companies-details/companies-details.component";
import { LeadsSideNavComponent } from "./leads/leads-side-nav/leads-side-nav.component";
import { CompaniesInnerDetailsComponent } from "./companies/companies-inner-details/companies-inner-details.component";
import { CompaniesMoreComponent } from "./companies/companies-inner-details/companies-more/companies-more.component";
import { SubheaderViewComponent } from "./subheader-view/subheader-view.component";
import { ContactsDetailsComponent } from "./contacts/contacts-details/contacts-details.component";
import { ContactsInnerDetailsComponent } from "./contacts/contacts-inner-details/contacts-inner-details.component";
import { ContactsListComponent } from "./contacts/contacts-list/contacts-list.component";
import { ContactsSideNavComponent } from "./contacts/contacts-side-nav/contacts-side-nav.component";
import { ContactsMoreComponent } from "./contacts/contacts-inner-details/contacts-more/contacts-more.component";
import { CreateContactComponent } from "./contacts/create-contact/create-contact.component";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { ContactFilterComponent } from "./contacts/contacts-side-nav/contact-filter/contact-filter.component";
import { LeadWorkflowItemComponent } from "./leads/lead-detail/lead-workflow-item/lead-workflow-item.component";
import { LeadToContactComponent } from "./leads/lead-detail/lead-to-contact/lead-to-contact.component";
import { LeadToCompanyComponent } from "./leads/lead-detail/lead-to-company/lead-to-company.component";
import { CompanyDashboardComponent } from "./companies/company-dashboard/company-dashboard.component";
import { ContactDashboardComponent } from "./contacts/contact-dashboard/contact-dashboard.component";
import { CallbackComponent } from "./callback/callback.component";
import { CallbackGoogleComponent } from "./callback-google/callback-google.component";
import { CallbackOutlookComponent } from "./callback-outlook/callback-outlook.component";
import { ClientsGuard } from "./clients.guard";
import { LaddaModule } from "angular2-ladda";
import { BsDatepickerModule } from 'ngx-bootstrap';
import { AddLeadComponent } from './leads/add-lead/add-lead.component';
import { CompanyLeadComponent } from './leads/add-lead/company-lead/company-lead.component';
import { ContactLeadComponent } from './leads/add-lead/contact-lead/contact-lead.component';
import { EnrichLeadComponent } from './leads/lead-detail/enrich-lead/enrich-lead.component';

@NgModule({
  imports: [
    CommonModule,
    ClientRoutingModule,
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SelectDropDownModule,
    LaddaModule,
    BsDatepickerModule
  ],
  declarations: [
    CompaniesSideNavComponent,
    CompaniesListComponent,
    CompaniesDetailsComponent,
    CompaniesInnerDetailsComponent,
    LeadsSideNavComponent,
    LeadsListComponent,
    LeadDetailComponent,
    LeadNavComponent,
    ClientHeaderComponent,
    CompaniesMoreComponent,
    SubheaderViewComponent,
    ContactsDetailsComponent,
    ContactsInnerDetailsComponent,
    ContactsListComponent,
    ContactsSideNavComponent,
    ContactsMoreComponent,
    CreateContactComponent,
    ContactFilterComponent,
    LeadWorkflowItemComponent,
    LeadToContactComponent,
    LeadToCompanyComponent,
    CompanyDashboardComponent,
    ContactDashboardComponent,
    CallbackComponent,
    CallbackGoogleComponent,
    CallbackOutlookComponent,
    AddLeadComponent,
    CompanyLeadComponent,
    ContactLeadComponent,
    EnrichLeadComponent
  ],
  providers: [...ClientsGuard, DatePipe]
})
export class ClientModule {}
