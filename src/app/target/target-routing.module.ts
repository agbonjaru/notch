import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PeriodComponent } from './period/period.component';
import { TargetLayoutComponent } from './target-layout/target-layout.component';
import { TargetsComponent } from './targets/targets.component';
import { ViewTargetComponent } from './targets/view-target/view-target.component';
import { CommissionsComponent } from './commissions/commissions.component';
import { ViewCommissionsComponent } from './commissions/view-commissions/view-commissions.component';
import { CommissionProfilesComponent } from './commission-profiles/commission-profiles.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PeriodsGuard, AssignedTargetsGuard, CommissionGuard, CommissionProfilesGuard, CompanyTargetsGuard } from './target.guard';

const routes: Routes = [
  {
    path: '',
    component: TargetLayoutComponent,
    children: [
      {path: 'period', component: PeriodComponent, canActivate: [PeriodsGuard]},
      {path: 'targets', component: TargetsComponent, canActivate: [ CompanyTargetsGuard]},
      {path: 'targets/:id/:type', component: ViewTargetComponent, canActivate: [ CompanyTargetsGuard]},
      {path: 'dashboard', component: DashboardComponent, canActivate: [ AssignedTargetsGuard]},
      {path: 'dashboard/:id/:type', component: ViewTargetComponent, canActivate: [ AssignedTargetsGuard]},
      {path: 'commissions', component: CommissionsComponent, canActivate: [ CommissionGuard]},
      {path: 'commissions/:id', component: ViewCommissionsComponent, canActivate: [ CommissionGuard]},
      {path: 'commission-profiles', component: CommissionProfilesComponent, canActivate: [ CommissionProfilesGuard]}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TargetRoutingModule { }
