import { TargetModuleGuard } from './../target/target.guard';
import { TicketModuleGuard } from './../ticket/ticket.guard';
import { CrewModuleGuard } from './../crew/crew.guard';
import { ClientModuleGuard } from './../clients/clients.guard';
import { SalesModuleGuard } from './../sales/sales.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsModuleGuard } from '../settings/settings.guard';
import { AccessDeniedComponent } from '../access-denied/access-denied.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

const routes: Routes = [
  {path: '', component: MainLayoutComponent, 
   children: [
      // Clients Module
  {
    path: "clients",
    loadChildren: "../clients/client.module#ClientModule",
    data: { preload: true, delay: true },
    canLoad: [ClientModuleGuard],
  },
  // Sales Module
  {
    path: "sales",
    loadChildren: "../sales/sales.module#SalesModule",
    data: { preload: true, delay: true },
    canLoad: [SalesModuleGuard],
  },
  // Teams Module
  {
    path: "teams",
    loadChildren: "../crew/crew.module#CrewModule",
    data: { preload: false, delay: true },
    canLoad: [CrewModuleGuard],
  },
  // Settings Module
  {
    path: "settings",
    loadChildren: "../settings/settings.module#SettingModule",
    data: { preload: false, delay: true },
    canLoad: [SettingsModuleGuard],
     },
  
  // Tickets Module
  {
    path: "ticket",
    loadChildren: "../ticket/ticket.module#TicketsModule",
    data: { preload: false, delay: true },
    canLoad: [TicketModuleGuard],
     },
  
  // Misc Module
  {
    path: "",
    loadChildren: "../misc/misc.module#MiscModule",
    data: { preload: false, delay: true },
  },
  {
    path: "access-denied",
    component: AccessDeniedComponent,
  },
  {
    path: "dashboard",
    component: DashboardComponent,
  },
  {
    path: "profile",
    loadChildren: "../profiles/profiles.module#ProfilesModule",
  },
  {
    path: "target",
    loadChildren: "../target/target.module#TargetModule",
    data: { preload: false, delay: true },
    canLoad: [ TargetModuleGuard]
  },
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
