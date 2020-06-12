import { CustomerSurveyCommentsComponent } from './customer-survey-comments/customer-survey-comments.component';
import { GroupViewComponent } from './ticket-groups/group-view/group-view.component';
import { AgentViewComponent } from './ticket-agents/agent-view/agent-view.component';
import { TicketViewComponent } from './ticket-view/ticket-view.component';
import { TicketGroupsComponent } from './ticket-groups/ticket-groups.component';
import { TicketAgentsComponent } from './ticket-agents/ticket-agents.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketReportsComponent } from './ticket-reports/ticket-reports.component';
import { HelpdeskComponent } from './ticket-reports/helpdesk/helpdesk.component';
import { AgentperformanceComponent } from './ticket-reports/agentperformance/agentperformance.component';
import { GroupPerformanceComponent } from './ticket-reports/group-performance/group-performance.component';
import { PerformanceDistributionComponent } from './ticket-reports/performance-distribution/performance-distribution.component';
import { TimeSheetComponent } from './ticket-reports/time-sheet/time-sheet.component';
import { TicketLifecycleComponent } from './ticket-reports/ticket-lifecycle/ticket-lifecycle.component';
import { CustomerAnalysisComponent } from './ticket-reports/customer-analysis/customer-analysis.component';
import { SatisfactionSurveyComponent } from './ticket-reports/satisfaction-survey/satisfaction-survey.component';
import { TicketDashboardComponent } from './ticket-dashboard/ticket-dashboard.component';
import { AllTicketComponent } from './all-ticket/all-ticket.component';
import { TicketListTypeComponent } from './ticket-list-type/ticket-list-type.component';
import { TicketDashboardGuard, AllTicketGuard, TicketReportGuard, AgentsGuard, GroupsGuard } from './ticket.guard';

const adminRoutes: Routes = [
  {
    path: "ticket-dashboard",
    component: TicketDashboardComponent,
    canActivate: [ TicketDashboardGuard]
  },
  {
    path: "all-ticket",
    component: AllTicketComponent,
    canActivate: [ AllTicketGuard]
  },
  {
    path: 'ticket-view/:code',
    component: TicketViewComponent,
    canActivate: [ AllTicketGuard]
  },
  {
    path: "ticket-reports",
    component: TicketReportsComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: 'ticket-agents',
    component: TicketAgentsComponent,
    canActivate: [ AgentsGuard]
  },
  {
    path: 'agent/:id',
    component: AgentViewComponent,
    canActivate: [ AgentsGuard]
  },
  {
    path: 'ticket-groups',
    component: TicketGroupsComponent,
    canActivate: [ GroupsGuard]
  },
  {
    path: 'group/:id',
    component: GroupViewComponent,
    canActivate: [ GroupsGuard]
  },
  {
    path: 'ticket-list/:statType/:id/:type',
    component: TicketListTypeComponent,
    canActivate: [ TicketDashboardGuard]
  },
  {
    path: "Help-Desk",
    component: HelpdeskComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Agent-Performance",
    component: AgentperformanceComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Group-Performance",
    component: GroupPerformanceComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Performance-Distribution",
    component: PerformanceDistributionComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Time-Sheet",
    component: TimeSheetComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Ticket-Lifecycle",
    component: TicketLifecycleComponent
  },
  {
    path: "Customer-Analysis",
    component: CustomerAnalysisComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Satisfaction-Survey",
    component: SatisfactionSurveyComponent,
    canActivate: [ TicketReportGuard]
  },
  {
    path: "Customer-Survey-Comments/:type",
    component: CustomerSurveyCommentsComponent,
    canActivate: [ TicketReportGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class TicketsRoutingModule { }
