import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulkMessagesComponent } from './bulk-messages/bulk-messages.component';
import { DocLibraryComponent } from './doc-library/doc-library.component';
import { AllMyTasksComponent } from './my-tasks/all-my-tasks/all-my-tasks.component';
import { CreateMyTasksComponent } from './my-tasks/create-my-tasks/create-my-tasks.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { BankPaymentsComponent } from './bank-payments/bank-payments.component';
import { BanksComponent } from './bank-payments/banks/banks.component';

const routes: Routes = [
  { path: 'create-my-tasks', component: CreateMyTasksComponent },
  { path: 'all-my-tasks', component: AllMyTasksComponent },
  { path: 'analytics', component: AnalyticsComponent },
  { path: 'banks', component: BanksComponent },
  { path: 'banks/:id', component: BankPaymentsComponent },
  { path: 'bulk-messages', component: BulkMessagesComponent },
  { path: 'doc-library', component: DocLibraryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MiscRoutingModule { }
