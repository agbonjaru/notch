import { RouterModule } from "@angular/router";
import { PipelineComponent } from "./components/pipeline/pipeline.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FateModule } from "fate-editor";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { SelectDropDownModule } from "ngx-select-dropdown";
import { ChartsModule } from "ng2-charts";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";
import { TimeagoModule, TimeagoFormatter } from "ngx-timeago";

import { FeedsComponent } from "./components/feeds/feeds.component";
import { IntegrationComponent } from "./components/integration/integration.component";
import { ScoreComponent } from "./components/score/score.component";
import { ChartComponent } from "./components/chart/chart.component";
import { CalendarComponent } from "./components/calendar/calendar.component";
import { ViewDocComponent } from "./components/view-doc/view-doc.component";
import { LibraryUploadComponent } from "./components/library-upload/library-upload.component";
import { DealModalComponent } from "./components/deal-modal/deal-modal.component";
import { TextEditorComponent } from "./components/text-editor/text-editor.component";
import { LoadingSpinnerComponent } from "./components/loading-spinner/loading-spinner.component";
import { DatepickerMinModeComponent } from "./components/datepicker-min-mode/datepicker-min-mode.component";
import { BsDatepickerModule } from "ngx-bootstrap";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { TaskFeedsComponent } from "./components/feeds/task-feeds/task-feeds.component";
import { NotesComponent } from "./components/integration/notes/notes.component";
import { NoteFeedsComponent } from "./components/feeds/note-feeds/note-feeds.component";
import { LogActivityComponent } from "./components/integration/log-activity/log-activity.component";
import { DatatableComponent } from "./components/datatable/datatable.component"; // custom datatable module

import { EmailComponent } from "./components/integration/email/email.component";
import { EmailFeedsComponent } from "./components/feeds/email-feeds/email-feeds.component";
import { EmailLookupComponent } from "./components/email-lookup/email-lookup.component";
import { ImapComponent } from "./components/imap/imap.component";

/** WYSIWYG EDITOR */
import { QuillModule } from "ngx-quill";
import { LogactivityFeedsComponent } from "./components/feeds/logactivity-feeds/logactivity-feeds.component";
import { AddCardModalComponent } from "./components/add-card-modal/add-card-modal.component";
import { DashStatsComponent } from "./components/dash-stats/dash-stats.component";
import { FilterPipe } from "../utils/filter.pipe";
import { DataFilterComponent } from "./components/data-filter/data-filter.component";
import { UniquePipe } from "../utils/unique.pipe";
import { SalesOrderTransitionModalComponent } from "./components/sales-order-transition-modal/sales-order-transition-modal";
import { ClientComponent } from "./components/integration/client-tasks/client-tasks.component";
import { NgxPaginationModule } from "ngx-pagination";
import { FlowTemplateComponent } from "./components/flow-template/flow-template.component";
import { TruncatePipe } from "../utils/truncate.pipe";
import { LaddaModule } from "angular2-ladda";

const sharedComponent = [
  FeedsComponent,
  EmailLookupComponent,
  ImapComponent,
  IntegrationComponent,
  ScoreComponent,
  ChartComponent,
  ViewDocComponent,
  LibraryUploadComponent,
  PipelineComponent,
  DealModalComponent,
  SalesOrderTransitionModalComponent,
  LoadingSpinnerComponent,
  DatepickerMinModeComponent,
  DatatableComponent,
  DashStatsComponent,
  DataFilterComponent,
  FlowTemplateComponent,
  TruncatePipe,
];

const sharedModules = [SelectDropDownModule, FormsModule, ReactiveFormsModule];

@NgModule({
  declarations: [
    ...sharedComponent,
    CalendarComponent,
    EmailComponent,
    EmailFeedsComponent,
    LogActivityComponent,
    TextEditorComponent,
    TaskFeedsComponent,
    ClientComponent,
    NotesComponent,
    NoteFeedsComponent,
    LogActivityComponent,
    LogactivityFeedsComponent,
    AddCardModalComponent,
    FilterPipe,
    UniquePipe,
    FlowTemplateComponent,
  ],

  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    FateModule,
    SelectDropDownModule,
    DragDropModule,
    NgxPaginationModule,
    ChartsModule,
    QuillModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    LaddaModule,
  ],

  exports: [
    ...sharedComponent,
    ...sharedModules,
    EmailComponent,
    NotesComponent,
    LogActivityComponent,
    FlowTemplateComponent,
  ],

  entryComponents: [AddCardModalComponent],
})
export class SharedModule { }
