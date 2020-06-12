import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/services/ticket/report.service';
import { GroupService } from 'src/app/services/ticket/group.service';

@Component({
  selector: 'app-ticket-lifecycle',
  templateUrl: './ticket-lifecycle.component.html',
  styleUrls: ['./ticket-lifecycle.component.css']
})
export class TicketLifecycleComponent implements OnInit {
  filterType = 1;
  groupList;
  selectedGroup;
  lifeCyleList;
  constructor(
    private reportSrv: ReportService,
    private groupSrv: GroupService) { }

  ngOnInit() {
    this.getGroups();
  }
  getLifeCycle(payload) {
    this.lifeCyleList = null
    this.reportSrv.fetchLifeCycle(payload).subscribe(res => {
      this.lifeCyleList = res;
    })
  }
  getGroups() {
    this.groupSrv.fetchGroup().subscribe(res => {
      this.groupList = res;
      this.selectedGroup = this.groupList[0].id;
      this.getLifeCycle({filterType:this.filterType,groupID:this.selectedGroup});
    })
  }
  update({endDate, startDate}) {
      this.getLifeCycle({endDate, startDate,filterType:this.filterType,groupID:this.selectedGroup})    
  }
  changeDate(filter) {
    const payload = {...filter, filterType:this.filterType,groupID:this.selectedGroup};
    this.getLifeCycle(payload);
  }


  // 

}
