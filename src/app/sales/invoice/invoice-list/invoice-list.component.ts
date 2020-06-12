import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import * as $ from "jquery";
import { InvoiceService } from "src/app/services/invoice.service";
import { GeneralService } from "src/app/services/general.service";
import Swal from "sweetalert2";
import { SUBSCRIPTIONCLIENTS } from "src/app/data/industries";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { Observable, Subject } from "rxjs";
import { ClientService } from "src/app/services/client-services/clients.service";
import { FormGroup } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { exportTableToCSV } from "src/app/utils/utils";

@Component({
  selector: "app-invoice-list",
  templateUrl: "./invoice-list.component.html",
  styleUrls: ["./invoice-list.component.css"],
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Clients", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search",
  };
  unsubscribe: Subject<boolean> = new Subject<boolean>();
  invoiceData: any;
  dropdownOptions: Observable<any>;
  copyInvoiceDetails = {
    invoiceId: null,
    clientName: "",
    clientId: null,
  };
  selectedClientName = "";
  clientsDetailArray = [];
  loadingView = false;
  ViewSwitch = "Dashboard";
  filteredDataSource: any;
  teamId = this.gs.teamIdSideBarFilter;

  exportInvoiceData;

  constructor(
    private router: Router,
    private clientServ: ClientService,
    private invoiceServ: InvoiceService,
    private activeRoute: ActivatedRoute,
    public gs: GeneralService
  ) {
    // Get Clients
    this.clientServ
      .getAllClients()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res) => {
          if (res) {
            // create array object
            const arrayResponse = [];
            // loop through object and push into array
            // tslint:disable-next-line: only-arrow-functions
            Object.keys(res).forEach(function (key) {
              arrayResponse.push(res[key]);
            });

            arrayResponse.map((res2: any) => {
              this.clientsDetailArray.push({
                id: res2.id,
                name: res2.name,
              });
            });
            const dropDown = [];
            this.clientsDetailArray.forEach((element) => {
              dropDown.push(element.name);
            });
            this.dropdownOptions = new Observable((observer) => {
              observer.next(dropDown);
            });
          }
        },
        (error) => {
          this.loadingView = false;
          console.log(error, "error on getting clients");
        }
      );
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((res) => {
      if (res.session_id === "Dashboard") {
        this.ViewSwitch = "Dashboard";
      } else if (
        res.session_id === "List" ||
        res.session_table ||
        res.session_id === "List-Dash"
      ) {
        this.ViewSwitch = "List";
      } else {
        this.ViewSwitch = "Dashboard";
      }
    });
  }

  private filterApi(valid, filterQuery) {
    if (valid) {
      this.teamId.subscribe((res) => {
        const query = filterQuery
          ? `${filterQuery}&teamId=${res}`
          : `teamId=${res}`;
        this.invoiceServ
          .getInvoiceByFilter(query)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(
            (res: any) => {
              // console.log(res, "resOnfilrer");
              if (res) {
                this.loadingView = false;
                this.filteredDataSource = res.payload;
              }
            },
            (error) => {
              console.log(error, "error");
            }
          );
      });
    }
  }

  handleClearAllFilter() {
    this.filterApi(true, "");
  }

  handleDateFilter(invoiceDateForm: FormGroup) {
    const { value, valid } = invoiceDateForm;
    const fromDate = new Date(Date.parse(value.fromDate)).setHours(0, 0, 0, 0);
    const toDate = new Date(Date.parse(value.toDate)).setHours(23, 59, 59, 59);
    const jsonFilterString = { createdOn: { from: fromDate, to: toDate } };
    const filterQuery = `range=${JSON.stringify(jsonFilterString)}`;
    this.filterApi(valid, filterQuery);
  }

  handlePaymentDateFilter(invoicePaymentDateForm: FormGroup) {
    const { value, valid } = invoicePaymentDateForm;
    const fromDate = new Date(Date.parse(value.fromDate)).setHours(0, 0, 0, 0);
    const toDate = new Date(Date.parse(value.toDate)).setHours(23, 59, 59, 59);
    const jsonFilterString = { paymentDueDate: { from: fromDate, to: toDate } };
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

  handleBalanceValueFilter(invoiceBalanceForm: FormGroup) {
    const { value, valid } = invoiceBalanceForm;
    const from = value.fromAmount;
    const to = value.toAmount;
    const jsonFilterString = { balanceDue: { from, to } };
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

  handleDashBoardFilter(filterBy) {
    this.handleViewSwitch("List-Dash", filterBy);
  }

  handleCustomFilter(event) {
    const {
      invoiceOwner,
      invoiceValueFrom,
      invoiceValueTo,
      clientName,
    } = event;
    const jsonValueRange = {
      totalCost: { from: invoiceValueFrom, to: invoiceValueTo },
    };
    const id = clientName.id;
    const salespersonId = invoiceOwner.id;
    const rangeAmount = `range=${JSON.stringify(jsonValueRange)}`;
    const filterQuery = `clientId=${id}&${rangeAmount}&createdBy=${salespersonId}`;
    this.filterApi(true, filterQuery);
  }

  navigateToRecurring() {
    const navigationExtras: NavigationExtras = {
      queryParams: { session_id: "recurringInvoice" },
    };

    this.router.navigate(["/sales/create-invoice"], navigationExtras);
  }

  handleViewSwitch(view, filterBy?) {
    if (view === "Dashboard") {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_id: "Dashboard" },
      };
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    } else if (view === "List-Dash") {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_id: "List-Dash", session_filter: filterBy },
      };
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_id: "List" },
      };
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    }
  }

  exportTable() {
    const exportName = "invoices_" + Date.now();
    const columns = [
      { title: "Invoice code", value: "id" },
      { title: "Client Name", value: "clientName" },
      { title: "Invoice Amount", value: "totalCost" },
      { title: "Balance Due", value: "balanceDue" },
      { title: "Invoice Date", value: "createdOn" },
      { title: "Payment Due Date", value: "paymentDueDate" },
    ];
    exportTableToCSV(this.invoiceData, columns, exportName);
  }

  handleData(source) {
    this.invoiceData = source;
  }

  ngOnDestroy() {
    this.unsubscribe.next(true);
    this.unsubscribe.unsubscribe();
  }
}
