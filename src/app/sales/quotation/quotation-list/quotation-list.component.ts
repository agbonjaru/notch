import { userDetails } from "./../../../utils/utils";
import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { QuotationService } from "src/app/services/quotation.service";
import { GeneralService } from "src/app/services/general.service";
import Swal from "sweetalert2";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Router, NavigationExtras } from "@angular/router";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { selectConfig, exportTableToCSV } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { EmailService } from "src/app/services/integrations/email/email.service";

@Component({
  selector: "app-quotation-list",
  templateUrl: "./quotation-list.component.html",
  styleUrls: ["./quotation-list.component.css"],
})
export class QuotationListComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Quotation Id", key: "id" },
      { title: "Customer", key: "clientName" },
      { title: "Amount", key: "totalCost", pipe: "currency" },
      { title: "Creation Date", key: "createdOn" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: [
        "View/Edit",
        "Send Quote",
        "Copy To",
        "Copy To Invoice",
        "Copy To Sales Order",
      ],
      bulkActions: ["Email", "SMS", "CHAT"],
    },
  };
  config = { ...selectConfig, placeholder: "Select Clients" };
  dropdownOptions: Observable<any>;
  unsubscribe: Subject<boolean> = new Subject<boolean>();
  teamConfig = {
    ...selectConfig,
    displayKey: "teamName",
    placeholder: "Select Team",
  };
  arrayTeams: any;
  sendQuoteForm: FormGroup;
  btnLoading: boolean = false;
  selectedTeamId = this.genSer.user.teamID;
  selectedClient: any;
  dataSource: any;
  suspendActivate = "Suspend";
  loadingView = false;
  copyQuoteDetails = {
    quoteId: null,
    clientName: "",
    clientId: null,
  };
  selectedClientName: any;
  // clientDropdownOptions: Observable<any>;
  clientsDetailArray = [];
  selectedQuotation: any;
  selectedClientsDetails: any;
  allClients;
  loading = false;
  teamId = this.genSer.teamIdSideBarFilter;

  constructor(
    private quoteServ: QuotationService,
    public genSer: GeneralService,
    private clientServ: ClientService,
    private companyServ: CompaniesService,
    private router: Router,
    private emailService: EmailService,
    private fb: FormBuilder,
    private localStorage: LocalStorageService
  ) {
    this.subscribeToAllClient();
  }

  private subscribeToAllClient() {
    // Get Clients
    this.clientServ.getAllClients().subscribe(
      (res: any) => {
        if (res) {
          this.allClients = res;
          res.map((res2: any) => {
            this.clientsDetailArray.push({
              id: res2.id,
              name: res2.name,
            });
          });

          // console.log(this.clientsDetailArray, "clientsDetailArray");

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
  }

  dataFeedBackObsListener = (data) => {
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View/Edit") {
          this.router.navigate(["/sales/edit-quotation/" + data.data.id]);
        } else if (data.action === "Send Quote" && this.allClients.length > 0) {
          this.selectedQuotation = data.data;
          this.sendQuoteForm.controls.client.setValue(data.data.clientName);
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
          this.sendQuote();
        } else if (data.action === "Copy To") {
          this.setCopyToId(data.data.id);
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter4'").click();
        } else if (data.action === "Copy To Invoice") {
          this.copyToInvoiceSalesOrder(data.data.id, "Invoice");
        } else if (data.action === "Copy To Sales Order") {
          this.copyToInvoiceSalesOrder(data.data.id, "SalesOrder");
        }

        break;

      default:
        break;
    }
  };

  ngOnInit() {
    this.loadingView = true;
    this.createSendQuoteForm();
    this.getSupervisorTeams();
    const filterQuery = `teamId=${this.selectedTeamId}`;
    this.quoteServ.getQuotationByFilter(filterQuery).subscribe(
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
  }

  private getSupervisorTeams() {
    this.companyServ.getSupervisorTeams().subscribe((res) => {
      this.arrayTeams = res;
    });
  }

  private filterApi(valid, filterQuery) {
    if (valid) {
      this.teamId.subscribe((res) => {
        const query = filterQuery
          ? `${filterQuery}&teamId=${res}`
          : `teamId=${res}`;
        this.quoteServ
          .getQuotationByFilter(query)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(
            (res: any) => {
              // console.log(res, "resOnfilrer");
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

  handleClearAllFilter() {
    this.filterApi(true, "");
  }

  handleDateFilter(quotationDateForm: FormGroup) {
    const { value, valid } = quotationDateForm;
    const fromDate = new Date(Date.parse(value.fromDate)).setHours(0, 0, 0, 0);
    const toDate = new Date(Date.parse(value.toDate)).setHours(23, 59, 59, 59);
    const jsonFilterString = { createdOn: { from: fromDate, to: toDate } };
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
      quotationOwner,
      quotationValueFrom,
      quotationValueTo,
      clientName,
    } = event;
    const jsonValueRange = {
      totalCost: { from: quotationValueFrom, to: quotationValueTo },
    };
    const id = clientName.id;
    const salespersonId = quotationOwner.id;
    const rangeAmount = `range=${JSON.stringify(jsonValueRange)}`;
    const filterQuery = `clientId=${id}&${rangeAmount}&createdBy=${salespersonId}`;
    this.filterApi(true, filterQuery);
  }

  handleFilterBySupervisor() {
    if (this.selectedTeamId) {
      const filterQuery = `teamId=${this.selectedTeamId}`;
      this.quoteServ
        .getQuotationByFilter(filterQuery)
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

  copyToInvoiceSalesOrder(id, type) {
    this.copyQuoteDetails.quoteId = id;
    const title =
      type === "Invoice" ? "Copy to invoice?" : "Copy to Sales Order?";
    this.genSer.sweetAlertContinue(title).then(
      (res) => {
        if (res.value === true) this.handleCopyToInvoiceSalesOrder(type);
      },
      (err) => {}
    );
  }

  handleClientSelection() {
    this.copyQuoteDetails.clientId = this.selectedClientName.id;
    this.copyQuoteDetails.clientName = this.selectedClientName.name;
  }

  setCopyToId(id) {
    this.copyQuoteDetails.quoteId = id;
  }

  handleCopy() {
    let selectedQuote = this.dataSource.filter((res) => {
      return res.id === this.copyQuoteDetails.quoteId;
    });
    selectedQuote = { selectedQuote, ...this.copyQuoteDetails };
    console.log(selectedQuote, "selectedQuote");

    const quoteStorageId = Math.random().toString(36).substring(7);

    this.localStorage.saveToLocalStorage(
      `copiedQuote_${quoteStorageId}`,
      selectedQuote
    );

    // Create a dummy session id
    const sessionName = quoteStorageId;

    // Set our navigation extras object
    // that contains our global query params and fragment
    const navigationExtras: NavigationExtras = {
      queryParams: {
        session_id: sessionName,
        session_location: "quotationListView",
      },
      fragment: "redirect",
    };
    $("#ModalCenter4 .close").click();
    this.router.navigate(["/sales/create-quote"], navigationExtras);
  }

  // clientId: 27
  // clientName: "LYF"
  // createdAt: 1589373774572
  // createdBy: 3090
  // createdOn: 1589373773763
  // currency: "USD"
  // dealId: "DL-3091-16"
  // displayCode: "QUO-0000010"
  // hasDeal: true
  // id: "QUO-3091-0000104"
  // isActive: true
  // isDeleted: false
  // orgId: 3091
  // orgTrackingId: 10
  // organisation: {id: 3091, name: "RMS", street: null, country: null, state: null, …}
  // products: [{…}]
  // refNumber: "a"
  // subtotalCost: 100
  // taxAmount: 0
  // teamId: 3109
  // totalCost: 100

  handleCopyToInvoiceSalesOrder(type) {
    let selectedQuote = this.dataSource.filter((res) => {
      return res.id === this.copyQuoteDetails.quoteId;
    });
    if (type === "Invoice") {
      selectedQuote = { selectedQuote, ...this.copyQuoteDetails };
      console.log(selectedQuote, "selectedQuote");

      const quoteStorageId = Math.random().toString(36).substring(7);

      this.localStorage.saveToLocalStorage(
        `copiedQuote_${quoteStorageId}`,
        selectedQuote
      );

      // Create a dummy session id
      const sessionName = quoteStorageId;

      // Set our navigation extras object
      // that contains our global query params and fragment
      const navigationExtras: NavigationExtras = {
        queryParams: {
          session_id: sessionName,
          session_type: "copyQuote",
          session_location: "invoiceListView",
        },
        fragment: "redirect",
      };
      this.router.navigate(["/sales/create-invoice"], navigationExtras);
    } else {
      console.log(selectedQuote, "selectedQuote");
      const copy = [
        {
          clientName: selectedQuote[0].clientName,
          currency: selectedQuote[0].currency,
          clientId: selectedQuote[0].clientId,
          team: selectedQuote[0].teamId,
        },
        ...selectedQuote[0].products,
      ];

      const salesorderId = Math.random().toString(36).substring(7);
      this.localStorage
        .saveToLocalStorage(`copiedSaleOrder_${salesorderId}`, copy)
        .subscribe((res) => {
          if (res) {
            // Create a dummy session id
            const sessionName = salesorderId;

            const navigationExtras: NavigationExtras = {
              queryParams: {
                session_id: sessionName,
                session_location: "quotationCreateView",
              },
              fragment: "redirect",
            };

            this.router.navigate(
              ["/sales/create-sales-order"],
              navigationExtras
            );
          }
        });
    }
  }

  createSendQuoteForm() {
    this.sendQuoteForm = this.fb.group({
      client: ["", Validators.required],
      subject: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  private get quoteEmailDetails() {
    console.log(this.selectedQuotation, "data quote");
    const quoteData = this.selectedQuotation;

    const result = {
      userId: this.genSer.user.id,
      quotation: {
        ...quoteData,
      },
      templateId: this.selectedClientsDetails.quotationTemplateId,
      organisation: {
        ...quoteData.organisation,
      },
      client: {
        ...this.selectedClientsDetails,
      },
    };
    return result;
  }

  sendQuote() {
    const payload = {
      type: "quote",
      id: this.quoteEmailDetails.quotation.id,
      payload: { ...this.quoteEmailDetails },
    };
    // console.log(payload, "paying");
    this.emailService.sales_item.next(payload);
  }

  exportTable() {
    const exportName = "Quotation" + Date.now();
    const columns = [
      { title: "Quotation Id", value: "id" },
      { title: "Customer", value: "clientName" },
      { title: "Amount", value: "totalCost" },
      { title: "Creation Date", value: "createdOn" },
    ];
    exportTableToCSV(this.dataSource, columns, exportName);
  }
}
