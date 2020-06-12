import { TimeagoModule } from "ngx-timeago";
import { SharedModule } from "./../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { PickerModule } from "@ctrl/ngx-emoji-mart";

import { TicketsRoutingModule } from "./ticket-routing.module";
import { TicketDashboardComponent } from "./ticket-dashboard/ticket-dashboard.component";
import { AllTicketComponent } from "./all-ticket/all-ticket.component";
import { TicketReportsComponent } from "./ticket-reports/ticket-reports.component";
import { HelpdeskComponent } from "./ticket-reports/helpdesk/helpdesk.component";
import { AgentperformanceComponent } from "./ticket-reports/agentperformance/agentperformance.component";
import { GroupPerformanceComponent } from "./ticket-reports/group-performance/group-performance.component";
import { PerformanceDistributionComponent } from "./ticket-reports/performance-distribution/performance-distribution.component";
import { TimeSheetComponent } from "./ticket-reports/time-sheet/time-sheet.component";
import { TicketLifecycleComponent } from "./ticket-reports/ticket-lifecycle/ticket-lifecycle.component";
import { CustomerAnalysisComponent } from "./ticket-reports/customer-analysis/customer-analysis.component";
import { SatisfactionSurveyComponent } from "./ticket-reports/satisfaction-survey/satisfaction-survey.component";
import { TicketSubnavComponent } from "./ticket-subnav/ticket-subnav.component";
import { TicketAgentsComponent } from "./ticket-agents/ticket-agents.component";
import { TicketGroupsComponent } from "./ticket-groups/ticket-groups.component";
import { TicketViewComponent } from "./ticket-view/ticket-view.component";
import { AgentViewComponent } from "./ticket-agents/agent-view/agent-view.component";
import { TicketStatsCardComponent } from "./ticket-stats-card/ticket-stats-card.component";
import { TicketListTypeComponent } from "./ticket-list-type/ticket-list-type.component";
import { GroupViewComponent } from "./ticket-groups/group-view/group-view.component";
import { DataRangeFilter } from "./filter/date-range.filter";
import { TicketGuard } from "./ticket.guard";
import { NgxPaginationModule } from "ngx-pagination";
import { AllTicketFilterComponent } from "./all-ticket/all-ticket-filter/all-ticket-filter.component";
import { LaddaModule } from "angular2-ladda";
import { TicketNotesComponent } from "./ticket-view/textareas/notes/notes.component";
import { CustomerSurveyCommentsComponent } from "./customer-survey-comments/customer-survey-comments.component";

@NgModule({
  imports: [
    CommonModule,
    TicketsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TimeagoModule.forRoot(),
    NgbTypeaheadModule,
    BsDatepickerModule,
    PickerModule,
    NgxPaginationModule,
    LaddaModule,
  ],
  declarations: [
    TicketDashboardComponent,
    AllTicketComponent,
    TicketReportsComponent,
    HelpdeskComponent,
    AgentperformanceComponent,
    GroupPerformanceComponent,
    PerformanceDistributionComponent,
    TimeSheetComponent,
    TicketLifecycleComponent,
    CustomerAnalysisComponent,
    SatisfactionSurveyComponent,
    TicketSubnavComponent,
    TicketAgentsComponent,
    TicketGroupsComponent,
    TicketViewComponent,
    AgentViewComponent,
    TicketStatsCardComponent,
    TicketListTypeComponent,
    GroupViewComponent,
    DataRangeFilter,
    TicketNotesComponent,
    AllTicketFilterComponent,
    CustomerSurveyCommentsComponent,
  ],
  providers: [...TicketGuard, DatePipe],
})
export class TicketsModule {}
