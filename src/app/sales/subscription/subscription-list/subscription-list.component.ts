import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import { SubscriptionService } from "src/app/services/subscription.service";
import Swal from "sweetalert2";
import { FormGroup, FormBuilder } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Subject, BehaviorSubject } from "rxjs";
import { selectConfig, exportTableToCSV } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-subscription-list",
  templateUrl: "./subscription-list.component.html",
  styleUrls: ["./subscription-list.component.css"],
})
export class SubscriptionListComponent implements OnInit {
  suspendActivate = "Suspend";
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Subscription code", key: "id" },
      { title: "Client name", key: "clientName" },
      { title: "Subscription value", key: "totalCost", pipe: "currency" },
      { title: "Start date", key: "createdOn" },
      { title: "End date", key: "endDate" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View/Edit", this.suspendActivate, "Terminate"],
      bulkActions: ["Email", "SMS", "CHAT"],
    },
  };
  teamConfig = {
    ...selectConfig,
    displayKey: "teamName",
    placeholder: "Select Team",
  };
  arrayTeams: any;
  selectedTeamId = this.genSer.user.teamID;
  teamForm: FormGroup;
  btnLoading: boolean = false;
  dataSource: any;

  loadingView = false;
  unsubscribe: Subject<boolean> = new Subject<boolean>();
  teamId = this.genSer.teamIdSideBarFilter;

  constructor(
    private subServ: SubscriptionService,
    private companyServ: CompaniesService,
    public genSer: GeneralService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadingView = true;
    this.getSupervisorTeams();
    const filterQuery = `teamId=${this.selectedTeamId}`;
    this.subServ.getSubscriptionByFilter(filterQuery).subscribe(
      (res: any) => {
        if (res) {
          this.loadingView = false;
          this.dataSource = res.payload;
          console.log(res.payload, "paylod");
          this.dataTable.dataChangedObs.next(true);
          console.log(this.dataSource, "Subscriptionpayload");
        }
      },
      (error) => {
        console.log(error, "error");
      }
    );
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View/Edit") {
          this.router.navigate(["/sales/edit-subscriptions/" + data.data.id]);
        } else if (data.action === this.suspendActivate) {
          this.handleStatusUpdate(this.suspendActivate, data.data.id);
          //@ts-ignore
          document.querySelector("[data-target='#sendQuoteModal'").click();
        } else if (data.action === "Terminate") {
          this.handleStatusUpdate("Terminate", data.data.id);
        }

        break;

      default:
        break;
    }
  };

  private filterApi(valid, filterQuery) {
    if (valid) {
      this.teamId.subscribe((res) => {
        const query = filterQuery
          ? `${filterQuery}&teamId=${res}`
          : `teamId=${res}`;
        this.subServ
          .getSubscriptionByFilter(query)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(
            (res: any) => {
              console.log(res, "resOnfilrer");
              if (res) {
                this.loadingView = false;
                this.dataSource = res.payload;
                this.dataTable.dataChangedObs.next(true);
              }
            },
            (error) => {
              console.log(error, "error");
            }
          );
      });
    }
  }

  private getSupervisorTeams() {
    this.companyServ.getSupervisorTeams().subscribe((res) => {
      this.arrayTeams = res;
    });
  }

  handleClearAllFilter() {
    this.filterApi(true, "");
  }

  handleDateFilter(subscriptionDateForm: FormGroup) {
    const { value, valid } = subscriptionDateForm;
    const fromDate = new Date(Date.parse(value.fromDate)).setHours(0, 0, 0, 0);
    const toDate = new Date(Date.parse(value.toDate)).setHours(23, 59, 59, 59);
    const jsonFilterString = { createdOn: { from: fromDate, to: toDate } };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    this.filterApi(valid, filterQuery);
  }

  handleEndDateFilter(subscriptionEndDateForm: FormGroup) {
    const { value, valid } = subscriptionEndDateForm;
    const fromDate = new Date(Date.parse(value.fromDate)).setHours(0, 0, 0, 0);
    const toDate = new Date(Date.parse(value.toDate)).setHours(23, 59, 59, 59);
    const jsonFilterString = { endDate: { from: fromDate, to: toDate } };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    this.filterApi(valid, filterQuery);
  }

  handleClientFilter(clientNameForm: FormGroup) {
    const { value, valid } = clientNameForm;
    const filterQuery = `clientName=${value.clientName}`;
    this.filterApi(valid, filterQuery);
  }

  handleCurrencyFilter(currencyForm: FormGroup) {
    const { value, valid } = currencyForm;
    const filterQuery = `currency=${value.currencyName}`;
    this.filterApi(valid, filterQuery);
  }

  handleValueFilter(valueForm: FormGroup) {
    const { value, valid } = valueForm;
    const from = value.fromAmount;
    const to = value.toAmount;
    const jsonFilterString = { totalCost: { from, to } };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    this.filterApi(valid, filterQuery);
  }

  handleOwnerFilter(ownerForm: FormGroup) {
    const { value, valid } = ownerForm;
    if (valid) {
      const filterQuery = `createdBy=${value.owner.id}`;
      this.filterApi(valid, filterQuery);
    }
  }

  handleCustomFilter(event) {
    const {
      subscriptionOwner,
      subscriptionValueFrom,
      subscriptionValueTo,
      clientName,
    } = event;
    const jsonValueRange = {
      totalCost: { from: subscriptionValueFrom, to: subscriptionValueTo },
    };
    const id = clientName.id;
    const salespersonId = subscriptionOwner.id;
    const rangeAmount = `range=${JSON.stringify(jsonValueRange)}`;
    const filterQuery = `clientId=${id}&${rangeAmount}&createdBy=${salespersonId}`;
    this.filterApi(true, filterQuery);
  }

  handleFilterBySupervisor() {
    if (this.selectedTeamId) {
      const filterQuery = `teamId=${this.selectedTeamId}`;
      this.subServ
        .getSubscriptionByFilter(filterQuery)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
            console.log(res, "resOnfilrer");
            if (res) {
              this.loadingView = false;
              this.dataSource = res.payload;
              this.dataTable.dataChangedObs.next(true);
            }
          },
          (error) => {
            console.log(error, "error");
          }
        );
      this.genSer.teamIdSideBarFilter.next(this.selectedTeamId);
    }
  }

  handleStatusUpdate(status, id) {
    console.log(id, "identification");
    if (status === "Suspend") {
      this.subServ
        .updateSubscription({ id, isSuspended: "true" })
        .subscribe((res) => {
          this.suspendActivate = "Reactivate";
          console.log("updated suspended");
          this.loadingView = false;
        });
    } else if (status === "Reactivate") {
      this.subServ
        .updateSubscription({ id, isSuspended: "false" })
        .subscribe((res) => {
          this.suspendActivate = "Suspend";
          console.log("updated reactivated");
          this.loadingView = false;
        });
    } else if (status === "Terminate") {
      this.suspendActivate = "";
      this.genSer.sweetAlertFileDeletions("Subscription").then((result) => {
        if (result.value) {
          this.subServ.deleteSubscription(id).subscribe(
            (result2) => {
              if (result2) {
                console.log("updated deleted");
                this.loadingView = false;
                Swal.fire(
                  "Deleted!",
                  "Your file has been deleted.",
                  "success"
                ).then((res22) => {
                  // Reload Page
                  this.subServ.getAllSubscription().subscribe(
                    (res: any) => {
                      if (res) {
                        this.loadingView = false;
                        this.dataSource = res.payload;
                        this.dataTable.dataChangedObs.next(true);
                        console.log(this.dataSource, "Reload payload");
                      }
                    },
                    (error) => {
                      console.log(error, "error");
                    }
                  );
                });
              }
            },
            (error) => {
              console.log("errorDeleting", error);
              Swal.fire({
                type: "error",
                title: "Oops...",
                text: "Something went wrong! Try again",
              });
            }
          );
        }
      });
    }
  }

  exportTable() {
    const exportName = "Subscription" + Date.now();
    const columns = [
      { title: "Subscription Id", value: "id" },
      { title: "Customer", value: "clientName" },
      { title: "Amount", value: "totalCost" },
      { title: "Start Date", value: "createdOn" },
      { title: "End Date", value: "endDate" },
    ];
    exportTableToCSV(this.dataSource, columns, exportName);
  }
}
