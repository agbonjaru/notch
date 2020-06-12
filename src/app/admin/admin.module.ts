import { LaddaModule } from 'angular2-ladda';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { CreateOrganizationComponent } from './organization/create-organization/create-organization.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, LaddaModule, AdminRoutingModule, ReactiveFormsModule],
  declarations: [WelcomepageComponent, CreateOrganizationComponent],
})
export class AdminModule { }
