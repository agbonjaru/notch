import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TargetRoutingModule } from './target-routing.module';
import { PeriodComponent } from './period/period.component';
import { TargetSubnavComponent } from './target-subnav/target-subnav.component';
import { TargetLayoutComponent } from './target-layout/target-layout.component';
import { TargetSidebarComponent } from './target-sidebar/target-sidebar.component';
import { TargetsComponent } from './targets/targets.component';
import { ViewTargetComponent } from './targets/view-target/view-target.component';
import { CommissionProfilesComponent } from './commission-profiles/commission-profiles.component';
import { CommissionsComponent } from './commissions/commissions.component';
import { ViewCommissionsComponent } from './commissions/view-commissions/view-commissions.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { ZingChartDirective } from '../shared/directives/zing-chart.directive';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TargetsGuard } from './target.guard';
import { TargetSidebarFilterComponent } from './target-sidebar/target-sidebar-filter/target-sidebar-filter.component';

@NgModule({
  declarations: [
    PeriodComponent,
    TargetSubnavComponent,
    TargetLayoutComponent,
    TargetSidebarComponent,
    TargetsComponent,
    ViewTargetComponent,
    CommissionProfilesComponent,
    CommissionsComponent,
    ViewCommissionsComponent,
    ZingChartDirective,
    DashboardComponent,
    TargetSidebarFilterComponent
  ],
  imports: [
    CommonModule,
    TargetRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SelectDropDownModule,
    BsDatepickerModule.forRoot()
  ],
  providers: [...TargetsGuard]
})
export class TargetModule { }
