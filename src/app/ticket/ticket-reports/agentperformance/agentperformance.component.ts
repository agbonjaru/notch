import { ReportService } from './../../../services/ticket/report.service';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-agentperformance',
  templateUrl: './agentperformance.component.html',
  styleUrls: ['./agentperformance.component.css']
})
export class AgentperformanceComponent implements OnInit {
  dateFilterLoading = false;
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Agents", key: "name" },
      { title: "Tickets Assigned", key: "totalAssigned" },
      { title: "Tickets Resolved", key: "totalResolved" },
      { title: "Tickets Reopened", key: "totalReopened" },
      { title: "Tickets Reassigned", key: "totalReassigned" },
      { title: "First response SLA %", key: "avgFirstResponseTime" },
    ],
    options: {
      datePipe: {},
      singleActions: [],
      bulkActions: [    
      
      ]
    }
  };
  performaceList: any[];
  constructor(private reportSrv: ReportService) {
  }

  ngOnInit() {
    this.getAgentPerm(null, true);
  }

  getAgentPerm(filter, loadtable?) {
    this.reportSrv.fetchReports(1, filter).subscribe((res: any[]) => {
      this.performaceList = res;
      this.dataTable.dataChangedObs.next(true);
    }).add(() => {
      this.dateFilterLoading = false
    })
  }
  getFilter(filter) {
    this.dateFilterLoading=true;
    // this.performaceList = null;
    this.getAgentPerm(filter)
  }


}
