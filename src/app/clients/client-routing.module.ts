import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompaniesListComponent } from './companies/companies-list/companies-list.component';

import { LeadDetailComponent } from './leads/lead-detail/lead-detail.component';
import { LeadsListComponent } from './leads/leads-list/leads-list.component';
import { CompaniesDetailsComponent } from './companies/companies-details/companies-details.component';
import { ContactsListComponent } from './contacts/contacts-list/contacts-list.component';
import { ContactsDetailsComponent } from './contacts/contacts-details/contacts-details.component';
import { CreateContactComponent } from './contacts/create-contact/create-contact.component';
import { CallbackComponent } from './callback/callback.component';
import { CallbackGoogleComponent } from './callback-google/callback-google.component';
import { CallbackOutlookComponent } from './callback-outlook/callback-outlook.component';

import { LeadChildRoutes } from './leads/leads-child-routes'; 
import { LeadsGuard, CompanyGuard, ContactsGuard } from './clients.guard';

const clientRoutes: Routes = [
  {
    path: 'callback',
    component: CallbackComponent,
  },
  {
    path: 'google-callback',
    component: CallbackGoogleComponent,
  },
  {
    path: 'outlook-callback',
    component: CallbackOutlookComponent,
  },
  {
    path: 'leads',
    component: LeadsListComponent,
    canActivate: [ LeadsGuard]
    // children: LeadChildRoutes
  },
  {
    path: 'leads/:id',
    component: LeadDetailComponent,
    canActivate: [ LeadsGuard]
  },
  {
    path: 'companies-list',
    component: CompaniesListComponent,
    canActivate: [ CompanyGuard]
  },
  {
    path: 'companies-view/:id',
    component: CompaniesDetailsComponent,
    canActivate: [ CompanyGuard]
  },
  {
    path: 'create-contacts',
    component: CreateContactComponent,
    canActivate: [ ContactsGuard]
  },
  {
    path: 'contacts-list',
    component: ContactsListComponent,
    canActivate: [ ContactsGuard]
  },
  {
    path: 'contacts-view/:id',
    component: ContactsDetailsComponent,
    canActivate: [ ContactsGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(clientRoutes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
