import { TeamViewComponent } from './teams/team-view/team-view.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalespersonListComponent } from './salesperson/salesperson-list/salesperson-list.component';
import { GamificationComponent } from './game/gamification/gamification.component';
import { CommissionListComponent } from './commission/commission-list/commission-list.component';
import { TeamsListComponent } from './teams/teams-list/teams-list.component';
import { SalespersonViewComponent } from './salesperson/salesperson-view/salesperson-view.component';
import { TeamsGuard, SalesPersonGuard, GamificatoinGuard } from './crew.guard';

const crewRoutes: Routes = [
  {
    path: "teams-list",
    component: TeamsListComponent,
    canActivate: [ TeamsGuard ]
  },
  {
    path: 'team/:id',
    component: TeamViewComponent,
    canActivate: [ TeamsGuard ]
  },
  {
    path: "saleperson-list",
    component: SalespersonListComponent,
    canActivate: [ SalesPersonGuard ]
  },
  {
    path: 'salesperson/:id',
    component: SalespersonViewComponent,
    canActivate: [ SalesPersonGuard ]
  },
  {
    path: "gamification",
    component: GamificationComponent,
    canActivate: [ GamificatoinGuard ]
  },
  {
    path: "commission-list",
    component: CommissionListComponent,
    canActivate: [ GamificatoinGuard ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(crewRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CrewRoutingModule { }
