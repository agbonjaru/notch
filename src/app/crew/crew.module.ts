import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './../shared/shared.module';
import { CommissionListComponent } from './commission/commission-list/commission-list.component';
import { CrewRoutingModule } from './crew-routing.module';
import { CrewSidebarComponent } from './crew-sidebar/crew-sidebar.component';
import { CrewGuard } from './crew.guard';
import { GamificationComponent } from './game/gamification/gamification.component';
import { SalespersonListComponent } from './salesperson/salesperson-list/salesperson-list.component';
import { SalespersonSiderbarComponent } from './salesperson/salesperson-siderbar/salesperson-siderbar.component';
import { SalepersonNavComponent } from './salesperson/salesperson-view/saleperson-nav/saleperson-nav.component';
import { SalespersonViewComponent } from './salesperson/salesperson-view/salesperson-view.component';
import { TeamsSubNavComponent } from './teams-subnav/teams-subnav.component';
import { TeamNavComponent } from './teams/team-view/team-nav/team-nav.component';
import { TeamViewComponent } from './teams/team-view/team-view.component';
import { TeamsListComponent } from './teams/teams-list/teams-list.component';
import { TeamsSideBarComponent } from './teams/teams-list/teams-side-bar/teams-side-bar.component';
import { TeamFilterComponent } from './teams/teams-list/teams-side-bar/filter/team-filter.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  imports: [
    CommonModule,
    CrewRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  
  declarations: [
    TeamsListComponent,
    SalespersonListComponent,
    GamificationComponent,
    CommissionListComponent,
    CrewSidebarComponent,
    TeamsSubNavComponent,
    TeamViewComponent,
    TeamNavComponent,
    SalespersonViewComponent,
    SalepersonNavComponent,
    SalespersonSiderbarComponent,
    TeamsSideBarComponent,
    TeamFilterComponent

  ],
  providers: [...CrewGuard]
})
export class CrewModule { }
