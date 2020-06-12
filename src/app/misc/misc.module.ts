import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { MiscRoutingModule } from './misc-routing.module';
import { BulkMessagesComponent } from './bulk-messages/bulk-messages.component';
import { DocLibraryComponent } from './doc-library/doc-library.component';
import { SharedModule } from '../shared/shared.module';
import { CreateMyTasksComponent } from './my-tasks/create-my-tasks/create-my-tasks.component';
import { AllMyTasksComponent } from '../misc/my-tasks/all-my-tasks/all-my-tasks.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { BankPaymentsComponent } from './bank-payments/bank-payments.component';
import { BanksComponent } from './bank-payments/banks/banks.component';

@NgModule({
  declarations: [
    BulkMessagesComponent,
    DocLibraryComponent,
    CreateMyTasksComponent,
    AnalyticsComponent,
    AllMyTasksComponent,
    BankPaymentsComponent,
    BanksComponent,
  ],
  imports: [
    CommonModule,
    MiscRoutingModule,
    SharedModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot()
  ]
})
export class MiscModule { }
