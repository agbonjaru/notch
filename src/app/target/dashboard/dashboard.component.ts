import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Component, OnInit } from '@angular/core';
import { TargetService } from 'src/app/services/target.service';
import { GeneralService } from 'src/app/services/general.service';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { exportTableToCSV } from 'src/app/utils/utils';
import { format } from 'date-fns';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "Owner", key: "owner" },
      { title: "User Type", key: "user_type" },
      { title: "Value", key: "value", pipe:'currency' },
      { title: "Target Type", key: "type", 
        transform: fieldData => this.targetService.getTargetType(fieldData)['name']
      },
      { title: "Period", key: "period" },
      { title: "Counts on", key: "stage", 
        transform: fieldData => this.targetService.getTargetStage(fieldData)['name']
      },
      { title: "Start Date", key: "start" },
      { title: "End Date", key: "end" },
      { title: 'Date Created', key: 'date_created' },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActions: ["View"],
      bulkActions: [    
        "View Commission",
        "View My Commission",
        "Assign Company",
        "Delete"
      ]
    }
  };
  userId;
  targets: Array<{}> = [];
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;
  loadingView = false;

  constructor(
    private targetService: TargetService,
    private generalService: GeneralService,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.store.select("userInfo").subscribe(data => {
      this.userId = data.user.id;
    });
  }

  ngOnInit() {
    this.getTargets();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction":
        if (data.action === "View") {
          this.router.navigate(["/target/dashboard/" + data.data.id + '/assigned']);
        } else if (data.action === "Delete") {
          this.reverseAssignTarget(data.data.id,data.data.userId)
        }
        break;
      default:
        break;
    }
  };

  clearFilter = () => this.getTargets();

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  getTargets(filter?) {
    this.loadingView = true;
    this.targetService.getTargetLists(
      (this.generalService.isSuperAdmin)? null : this.userId,
      this.targetService.convertObjectToQueryString(filter)
    ).subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        const targets = res.response;
        this.targets = targets.map(e => {
          e.user_type = e.user_type === 'user'? 'Salesperson' : 'Team';
          return e;
        });
        this.dataTable.dataChangedObs.next(true);
        localStorage.target_lists = JSON.stringify(this.targets);
      }
    });
  }

  reverseAssignTarget(id, userId) {
    this.generalService.sweetAlertFileDeletions('Target')
      .then(result => {
        if (result.value) {
          this.targetService.deleteAssignedTarget(id, userId)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getTargets();
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  formatText(text) {
    return text.replace(/_/g, ' ');
  }

  exportTable() {
    const exportName = `Notch Assigned Targets - ${format(Date.now(), 'MMM d, yyyy h.mm a')}`;
    const columns = [
      { title: "Owner", value: "owner" },
      { title: "User Type", value: "user_type" },
      { title: "Value", value: "value" },
      { title: "Type", value: "type" },
      { title: "Period", value: "period" },
      { title: "Start Date", value: "start" },
      { title: "End Date", value: "end" },
      { title: 'Date Created', value: 'date_created' }
    ];
    exportTableToCSV(this.targets, columns, exportName);
  }
}
