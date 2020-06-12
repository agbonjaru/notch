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
  selector: 'app-commissions',
  templateUrl: './commissions.component.html',
  styleUrls: ['./commissions.component.css']
})
export class CommissionsComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "Salesperson/Team", key: "user" },
      { title: "Commission", key: "commission" },
      { title: "Paid", key: "value", pipe: 'currency' },
      { title: "Target Type", key: "type" },
      { title: "Target", key: "target" },
      { title: "Period", key: "period" },
      { title: "Threshold", key: "threshold" },
      { title: 'Date Created', key: 'date_created' },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActions: ["View"],
      bulkActions: [    
        "View Sub-target",
        "Assign Territory",
        "Assign Company",
        "Delete"
      ]
    }
  };

  userId;
  commissions: Array<{}> = [];
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;
  loadingView = false;

  constructor(
    private targetService: TargetService,
    public generalService: GeneralService,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.store.select("userInfo").subscribe(data => {
      this.userId = data.user.id;
    });
  }
  
  ngOnInit() {
    this.getCommissions();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction":
        if (data.action === "View") {
          this.router.navigate(['/target/commissions/' +  data.data.id]);
        }
        break;
      default:
        break;
    }
  };

  clearFilter = () => this.getCommissions();

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  getCommissions(filter?) {
    this.loadingView = true;
    this.targetService.getCommissions(
      (this.generalService.isSuperAdmin)? null : this.userId,
      this.targetService.convertObjectToQueryString(filter)
    ).subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        this.commissions = res.response;
        this.dataTable.dataChangedObs.next(true);
        localStorage.commissions = JSON.stringify(this.commissions);
      }
    });
  }

  exportTable() {
    const exportName = `Notch Commissions List - ${format(Date.now(), 'MMM d, yyyy h.mm a')}`;
    const columns = [
      { title: "Salesperson/Team", value: "user" },
      { title: "Commission", value: "commission" },
      { title: "Paid", value: "value" },
      { title: "Type", value: "type" },
      { title: "Target", value: "target" },
      { title: "Period", value: "period" },
      { title: "Threshold", value: "threshold" },
      { title: 'Date Created', value: 'date_created' }
    ];
    exportTableToCSV(this.commissions, columns, exportName);
  }
}
