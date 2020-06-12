import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { ReportService } from 'src/app/services/ticket/report.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-group-performance',
  templateUrl: './group-performance.component.html',
  styleUrls: ['./group-performance.component.css']
})
export class GroupPerformanceComponent implements OnInit {
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
    this.reportSrv.fetchReports(2, filter).subscribe((res: any[]) => {
      this.performaceList = res;
      this.dataTable.dataChangedObs.next(true)
    }).add(()=> this.dateFilterLoading=false)
  }
  getFilter(filter) {
    // this.performaceList = null;
    this.dateFilterLoading=true;
    this.getAgentPerm(filter)
  }

 

}
