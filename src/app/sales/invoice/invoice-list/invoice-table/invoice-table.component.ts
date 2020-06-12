import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { NavigationExtras, Router, ActivatedRoute } from "@angular/router";
import { GeneralService } from "src/app/services/general.service";
import { ClientService } from "src/app/services/client-services/clients.service";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import * as $ from "jquery";
import { InvoiceService } from "src/app/services/invoice.service";
import Swal from "sweetalert2";
import { takeUntil, take } from "rxjs/operators";
import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BankService } from "src/app/services/settings-services/bank.service";
import { EmailService } from "src/app/services/integrations/email/email.service";
// import { EventEmitter } from "@";

@Component({
  selector: "app-invoice-table",
  templateUrl: "./invoice-table.component.html",
  styleUrls: ["./invoice-table.component.css"],
})
export class InvoiceTableComponent implements OnInit, OnChanges, OnDestroy {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Invoice code", key: "displayCode" },
      { title: "Client Name", key: "clientName" },
      { title: "Invoice Amount", key: "totalCost", pipe: "currency" },
      { title: "Balance Due", key: "balanceDue", pipe: "currency" },
      { title: "Invoice Date", key: "createdOn" },
      { title: "Payment Due Date", key: "paymentDueDate" },

      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View/Edit", "Copy To", "Send Invoice"],
      bulkActions: [],
    },
  };

  @Output() exportInvoice = new EventEmitter();
  @Input() filteredDataSource;
  config = { ...selectConfig, placeholder: "Select Clients" };

  teamConfig = {
    ...selectConfig,
    displayKey: "teamName",
    placeholder: "Select Team",
  };

  arrayTeams: any;
  selectedTeamId = "";

  unsubscribe = new Subject<boolean>();
  fetchInvoiceBy$: any;
  sendInvoiceForm: FormGroup;

  dropdownOptions: Observable<any>;
  dataSource: any;
  dataSource2: any;
  suspendActivate = "Suspend";
  loadingView = false;
  copyInvoiceDetails = {
    invoiceId: null,
    clientName: "",
    clientId: null,
  };
  selectedClientName;
  // clientDropdownOptions: Observable<any>;
  clientsDetailArray = [];
  ViewSwitch = "Recurring";
  allClients;
  selectedInvoice: any;
  selectedClientsDetails: any;
  bankAccountDetails = [];
  loading = false;
  teamId = this.genSer.teamIdSideBarFilter;

  constructor(
    private invoiceServ: InvoiceService,
    public genSer: GeneralService,
    private clientServ: ClientService,
    private companyServ: CompaniesService,
    private router: Router,
    private localStorage: LocalStorageService,
    private fb: FormBuilder,
    private bankServ: BankService,
    private emailService: EmailService,
    private activeRoute: ActivatedRoute
  ) {
    this.teamId.pipe(take(1)).subscribe((id) => {
      this.selectedTeamId = id;
      this.activeRoute.queryParams.subscribe((res) => {
        if (res.clientId) {
          const filterQuery = `teamId=${id}`;
          this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
            `${filterQuery}&clientId=${res.clientId}`
          );
        } else if (res.session_id === "List-Dash") {
          switch (res.session_filter) {
            case "Paid":
              this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
                `teamId=${id}&hasPayment=true`
              );
              break;
            case "Not-Paid":
              this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
                `teamId=${id}&hasPayment=false`
              );
              break;
            case "Overdue":
              const fromDate = new Date(Date.parse("01-01-2020")).setHours(
                0,
                0,
                0,
                0
              );
              const toDate = new Date().setHours(23, 59, 59, 59);
              const jsonFilterString = {
                paymentDueDate: { from: fromDate, to: toDate },
              };
              const filterQuery2 = `range=${JSON.stringify(
                jsonFilterString
              )}&teamId=${id}`;
              this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
                filterQuery2
              );
              break;
            default:
              const filterQuery = `teamId=${id}`;
              // console.log("lolg", filterQuery);
              this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
                filterQuery
              );
              break;
          }
        } else {
          const filterQuery = `teamId=${id}`;
          // console.log(filterQuery, "filterQueryAllList");
          this.fetchInvoiceBy$ = this.invoiceServ.getInvoiceByFilter(
            filterQuery
          );
        }
      });
    });

    // Banks APi
    this.bankServ
      .fetch_bank_records()
      .subscribe((res: any) => (this.bankAccountDetails = res.payload));

    // Get Clients
    this.clientServ
      .getAllClients()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (res: any) => {
          if (res) {
            this.allClients = res;
            res.map((res2: any) => {
              this.clientsDetailArray.push({
                id: res2.id,
                name: res2.name,
              });
            });

            const newData = this.clientsDetailArray.map((el) => ({
              ...el,
              name: el.name,
            }));

            this.dropdownOptions = new Observable((observer) => {
              observer.next(newData);
            });
          }
        },
        (error) => {
          this.loadingView = false;
          console.log(error, "error on getting clients");
        }
      );

    this.fetchInvoiceBy$.pipe(takeUntil(this.unsubscribe)).subscribe(
      (res: any) => {
        if (res) {
          this.loadingView = false;
          this.dataSource = res.payload;
          this.dataTable.dataChangedObs.next(true);
          this.dataSource2 = res.payload;
          this.exportInvoice.emit();
          // console.log(this.dataSource, "Invoicepayload");
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
        if (data.action === "Copy To") {
          this.setCopyToId(data.data.id);
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter4'").click();
        } else if (data.action === "View/Edit") {
          this.router.navigate(["/sales/edit-invoice/" + data.data.id]);
        } else if (
          data.action === "Send Invoice" &&
          this.allClients.length > 0
        ) {
          this.selectedInvoice = data.data;
          this.sendInvoiceForm.controls.client.setValue(data.data.clientName);
          this.allClients.map((res2: any) => {
            if (
              res2.id === data.data.clientId &&
              data.data.clientName === res2.name
            ) {
              this.selectedClientsDetails = {
                ...res2,
              };
            }
          });
          console.log(this.selectedClientsDetails, "selectedClientsDetails");
          //@ts-ignore
          this.sendInvoice();
        }
        break;

      default:
        break;
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    const {
      filteredDataSource: { currentValue },
    } = changes;
    if (currentValue) {
      this.dataSource = currentValue;
      this.dataTable.dataChangedObs.next(true);
      this.dataSource2 = currentValue;
      console.log(currentValue, "changes");
    }
  }

  ngOnInit() {
    this.loadingView = true;
    this.getSupervisorTeams();
    this.createSendInvoiceForm();

    setTimeout(() => {
      this.activeRoute.queryParams.subscribe((res) => {
        this.handleFilterByRecurring(res.session_table);
      });
      this.dataTable.dataChangedObs.next(true);
    }, 1000);
  }

  // Get Supervisor Teams
  private getSupervisorTeams() {
    this.companyServ.getSupervisorTeams().subscribe((res) => {
      this.arrayTeams = res;
    });
  }

  private get invoiceEmailDetails() {
    const invoiceData = this.selectedInvoice;
    const result = {
      userId: this.genSer.user.id,
      invoice: {
        ...invoiceData,
      },
      templateId: this.selectedClientsDetails.invoiceTemplateId,
      organisation: {
        ...invoiceData.organisation,
      },
      client: {
        ...this.selectedClientsDetails,
      },
      accounts: [...this.bankAccountDetails],
    };
    return result;
  }

  private createSendInvoiceForm() {
    this.sendInvoiceForm = this.fb.group({
      client: ["", Validators.required],
      subject: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  handleFilterBySupervisor() {
    if (this.selectedTeamId) {
      const filterQuery = `teamId=${this.selectedTeamId}`;
      this.invoiceServ
        .getInvoiceByFilter(filterQuery)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (res: any) => {
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
      console.log(this.selectedTeamId, "if");
      this.genSer.teamIdSideBarFilter.next(this.selectedTeamId);
    }
  }

  // Handle Filter By Recurring Type
  handleFilterByRecurring(type) {
    this.loadingView = true;
    switch (type) {
      case "Recurring":
        this.dataSource = this.dataSource2.filter(
          (res2) => res2.frequency !== "none"
        );
        this.ViewSwitch = "Recurring";
        this.loadingView = false;
        this.dataTable.dataChangedObs.next(true);
        break;
      case "Non-Recurring":
        this.dataSource = this.dataSource2.filter(
          (res2) => res2.frequency === "none"
        );
        this.ViewSwitch = "Non-Recurring";
        this.loadingView = false;
        this.dataTable.dataChangedObs.next(true);
        break;
      default:
        this.ViewSwitch = "All";
        this.dataSource = this.dataSource2;
        this.loadingView = false;
        this.dataTable.dataChangedObs.next(true);
        break;
    }
  }

  handleRecurringView(view) {
    if (view === "Recurring") {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_table: "Recurring" },
      };
      this.handleFilterByRecurring("Recurring");
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    } else if (view === "Non-Recurring") {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_table: "Non-Recurring" },
      };
      this.handleFilterByRecurring("Non-Recurring");
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: { session_table: "All" },
      };
      this.handleFilterByRecurring("All");
      this.router.navigate(["/sales/invoice-list"], navigationExtras);
    }
  }

  setCopyToId(id) {
    this.copyInvoiceDetails.invoiceId = id;
  }

  handleClientSelection() {
    this.copyInvoiceDetails.clientId = this.selectedClientName.id;
    this.copyInvoiceDetails.clientName = this.selectedClientName.name;
  }

  handleCopy() {
    let selectedInvoice = this.dataSource.filter((res) => {
      return res.id === this.copyInvoiceDetails.invoiceId;
    });
    selectedInvoice = { selectedInvoice, ...this.copyInvoiceDetails };
    console.log(selectedInvoice, "selectedInvoice");

    const invoiceStorageId = Math.random().toString(36).substring(7);

    this.localStorage.saveToLocalStorage(
      `copiedInvoice_${invoiceStorageId}`,
      selectedInvoice
    );

    // Create a dummy session id
    const sessionName = invoiceStorageId;

    // Set our navigation extras object
    // that contains our global query params and fragment
    const navigationExtras: NavigationExtras = {
      queryParams: {
        session_id: sessionName,
        session_location: "invoiceListView",
      },
      fragment: "redirect",
    };
    $("#ModalCenter4 .close").click();
    this.router.navigate(["/sales/create-invoice"], navigationExtras);
  }

  sendInvoice() {
    const invoiceDetails = {
      ...this.invoiceEmailDetails,
    };

    this.emailService.sales_item.next({
      type: "invoice",
      id: invoiceDetails.invoice.id,
      payload: { ...invoiceDetails },
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
