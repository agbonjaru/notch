import { SettingsModuleGuard } from './../settings/settings.guard';
import { ClientModuleGuard } from './../clients/clients.guard';
import { TicketModuleGuard } from './../ticket/ticket.guard';
import { CrewModuleGuard } from './../crew/crew.guard';
import { TargetModuleGuard } from './../target/target.guard';
import { SalesModuleGuard } from './../sales/sales.guard';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainLayoutRoutingModule } from './main-layout-routing.module';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { AccessDeniedComponent } from '../access-denied/access-denied.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { AiComponent } from './ai/ai.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    AccessDeniedComponent,
    DashboardComponent,  
    HeaderComponent,
    AiComponent,
  ],
  imports: [
    CommonModule,
    MainLayoutRoutingModule,
    SharedModule
  ],
  providers: [ SalesModuleGuard, TargetModuleGuard, CrewModuleGuard, TicketModuleGuard, ClientModuleGuard, SettingsModuleGuard]
})
export class MainLayoutModule { }
