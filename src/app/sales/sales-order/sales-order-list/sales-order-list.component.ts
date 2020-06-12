import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { ClientService } from "src/app/services/client-services/clients.service";
import {
  selectConfig,
  convertObjToArray,
  exportTableToCSV,
} from "src/app/utils/utils";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { GeneralService } from "src/app/services/general.service";
import { Observable, BehaviorSubject } from "rxjs";
import { SignupLoginService } from "src/app/services/signupLogin.service";

@Component({
  selector: "app-sales-order-list",
  templateUrl: "./sales-order-list.component.html",
  styleUrls: ["./sales-order-list.component.css"],
})
export class SalesOrderListComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Sales Order code", key: "displayCode" },
      { title: "Client Name", key: "clientName" },
      { title: "Amount", key: "totalAmount", pipe: "currency" },
      { title: "Sales Order Owner", key: "source" },
      { title: "Creation date", key: "createdDate" },
      { title: "Status", key: "status-salesorder" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["Edit"],
      bulkActions: [],
    },
  };
  salesOrderList: any[];
  selectedClientName;
  config = { ...selectConfig };
  dropdownOptions = [];
  salesOrderInfo = { salesOrder: null, client: null };
  teamId;
  teamList$ = this.signupSrv.fetchSupervisorTeams();
  selectedTeam = "";
  ViewSwitch = "Dashboard";

  constructor(
    private salesOrderSrv: SalesOrderService,
    private clientSrv: ClientService,
    private signupSrv: SignupLoginService,
    public gs: GeneralService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
    this.teamId = this.gs.user.teamID;
    this.selectedTeam = this.teamId;
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "Copy To") {
          // this.copyTo(data.data);
          // //@ts-ignore
          // document.querySelector("[data-target='#ModalCenter4'").click();
        } else if (data.action === "Edit") {
          this.openSalesOrdder(data.data);
        }

        break;

      default:
        break;
    }
  };

  ngOnInit() {
    this.getClients();
    this.getSaleOrders(this.teamId, null);

    this.activeRoute.queryParams.subscribe((res) => {
      if (res.session_id === "Dashboard") {
        this.ViewSwitch = "Dashboard";
      } else if (res.session_id === "List") {
        this.ViewSwitch = "List";
      } else {
        this.ViewSwitch = "Dashboard";
      }
    });
  }

  getClients() {
    this.clientSrv.getAllClients().subscribe((data) => {
      this.dropdownOptions = convertObjToArray(data);
    });
  }

  getSaleOrders(teamId = this.teamId, filter) {
    console.log(filter, "filter");
    this.salesOrderList = null;
    this.salesOrderSrv
      .fetchAllSalesOrder(teamId, filter)
      .subscribe((data: any) => {
        this.salesOrderList = data;
        console.log(data, "dataring");
        this.dataTable.dataChangedObs.next(true);
      });
  }

  getFilteredSalesOrder(id) {
    this.salesOrderList = null;
    this.salesOrderSrv.fetchFilteredSalesOrders(id).subscribe((data: any) => {
      this.salesOrderList = data;
      this.dataTable.dataChangedObs.next(true);
    });
  }

  handleViewSwitch(view) {
    if (view === "Dashboard") {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_id: "Dashboard" },
      };
      this.router.navigate(["/sales/sales-order-list"], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_id: "List" },
      };
      this.router.navigate(["/sales/sales-order-list"], navigationExtras);
    }
  }

  copyTo(salesOrder) {
    // this.dropdownOptions = this.dropdownOptions.filter(item => item.id != salesOrder.clientID);
    this.salesOrderInfo["salesOrder"] = salesOrder;
  }
  handleClientSelection() {
    this.salesOrderInfo["client"] = this.selectedClientName;
  }

  handleCopy() {
    document.getElementById("closeModal").click();
    const { salesOrder, client } = this.salesOrderInfo;
    this.router.navigate(["/sales/create-sales-order"], {
      queryParams: {
        salesOrder: salesOrder.code,
        clientId: client.id,
        clientName: client.name,
      },
    });
  }

  openSalesOrdder(salesOrder) {
    this.router.navigate(["/sales/create-sales-order"], {
      queryParams: { salesOrder: salesOrder.code },
    });
  }
  exportTable() {
    const columns = [
      { title: "Sales Order Code", value: "code" },
      { title: "Client Name", value: "clientName" },
      { title: "Amount", value: "totalAmount" },
      { title: "Sales Order Owner", value: "source" },
      { title: "Creation Date", value: "createdDate" },
    ];
    exportTableToCSV(this.salesOrderList, columns, "salesorder");
  }
}
