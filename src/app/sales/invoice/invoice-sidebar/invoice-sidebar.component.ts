import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { GeneralService } from "src/app/services/general.service";
import { Subject, Observable } from "rxjs";
import { DealsService } from "src/app/services/deals.service";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { ClientService } from "src/app/services/client-services/clients.service";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { CustomFilterService } from "src/app/services/customFilter.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { ContactsService } from "src/app/services/client-services/contacts.service";
import { selectConfig } from "src/app/utils/utils";
import { CurrencyService } from "src/app/services/currency.service";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";

@Component({
  selector: "app-invoice-sidebar",
  templateUrl: "./invoice-sidebar.component.html",
  styleUrls: ["./invoice-sidebar.component.css"],
})
export class InvoiceSidebarComponent implements OnInit, OnDestroy {
  config = { ...selectConfig, placeholder: "Select" };
  teamConfig = {
    ...selectConfig,
    displayKey: "name",
    placeholder: "Select",
  };
  showFilter = null;
  unsubscribe = new Subject();
  @Output() getInvoiceDateFilter = new EventEmitter();
  @Output() getInvoicePaymentDateFilter = new EventEmitter();
  @Output() getClientNameFilter = new EventEmitter();
  @Output() getInvoiceOwnerFilter = new EventEmitter();
  @Output() getInvoiceValueFilter = new EventEmitter();
  @Output() getInvoiceBalanceValueFilter = new EventEmitter();
  @Output() getInvoiceCustomFilter = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @Output() getInvoiceCurrencyFilter = new EventEmitter();

  invoiceDateForm = new FormGroup({
    fromDate: new FormControl("", [Validators.required]),
    toDate: new FormControl("", [Validators.required]),
  });

  invoicePaymentDateForm = new FormGroup({
    fromDate: new FormControl("", [Validators.required]),
    toDate: new FormControl("", [Validators.required]),
  });

  clientForm = new FormGroup({
    clientName: new FormControl("", Validators.required),
    // clientId: new FormControl(''),
  });

  currencyForm = new FormGroup({
    currencyName: new FormControl("", Validators.required),
  });

  invoiceOwnerForm = new FormGroup({
    owner: new FormControl("", Validators.required),
  });

  invoiceValueForm = new FormGroup({
    fromAmount: new FormControl(0, Validators.required),
    toAmount: new FormControl(0, Validators.required),
  });

  invoiceBalanceValueForm = new FormGroup({
    fromAmount: new FormControl(0, Validators.required),
    toAmount: new FormControl(0, Validators.required),
  });

  createFilterForm = new FormGroup({
    filterName: new FormControl("", Validators.required),
    invoiceOwner: new FormControl("", Validators.required),
    invoiceValueFrom: new FormControl(0, Validators.required),
    invoiceValueTo: new FormControl(0, Validators.required),
    clientType: new FormControl("", Validators.required),
    clientName: new FormControl("", Validators.required),
  });

  filterList = [];
  initialCreateFilterValue = {};

  dropdownOptions: Observable<any>;
  clientsDetailArray = [];
  createClientList = [];
  contactList$ = [];
  companyList$ = [];

  userId;
  orgId;
  salesPerson: Observable<any>;
  currencies: any;

  constructor(
    private dealSrv: DealsService,
    private generalSrv: GeneralService,
    private clientServ: ClientService,
    private companySrv: CompaniesService,
    private contactServ: ContactsService,
    private salespersonSrv: SalesPersonService,
    private customFilterServ: CustomFilterService,
    private currencyServ: CurrencyService
  ) {
    this.orgId = this.generalSrv.org.id;
    this.userId = this.generalSrv.user.id;
    this.initialCreateFilterValue = this.createFilterForm.value;

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
            Object.keys(res).forEach((key) => {
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
              dropDown.push(`${element.name}`);
            });
            this.dropdownOptions = new Observable((observer) => {
              observer.next(dropDown);
            });
          }
        },
        (error) => {
          // this.loadingView = false;
          console.log(error, "error on getting clients");
        }
      );

    // Get Currencies
    this.currencyServ.org_currencies.subscribe((org_currencies: any) => {
      if (!this.generalSrv.checkIfObjectIsEmpty(org_currencies)) {
        let result = [];
        let res = this.generalSrv.convertObjectToArray(
          org_currencies.currencies
        );
        res.forEach((res2: any) => {
          result.push(res2.currency_code);
        });
        this.currencies = result;
      }
    });
  }

  ngOnInit() {
    this.getFilters();
    this.getAllCompanies();
    this.getAllContacts();
    this.getSalesperson();
  }

  // Get getSalesperson
  private getSalesperson() {
    this.salespersonSrv.fetchAllSalePersons().subscribe((res) => {
      this.salesPerson = new Observable((observer) => {
        observer.next(res);
      });
    });
  }

  getAllCompanies() {
    this.companySrv.getAllCompanies().subscribe((data: any) => {
      if (data) {
        let container = [];
        data.payload.forEach((element) => {
          container.push({
            id: element.clientId,
            name: `${element.name}`,
          });
        });
        this.companyList$ = container;
      }
    });
  }

  getAllContacts() {
    this.contactServ.getAllContacts().subscribe((data: any) => {
      if (data) {
        let container = [];
        data.payload.forEach((element) => {
          container.push({
            id: element.clientId,
            name: `${element.firstName} ${element.surName}`,
          });
        });
        this.contactList$ = container;
      }
    });
  }

  fetchCreateClient() {
    this.createFilterForm.controls.clientName.setValue("");
    const { clientType } = this.createFilterForm.value;
    this.createClientList =
      clientType === "Contact" ? this.contactList$ : this.companyList$;
  }

  clearAllFilter() {
    this.getClearFilter.emit();
    this.invoiceDateForm.reset();
    this.invoiceValueForm.reset();
    this.invoiceBalanceValueForm.reset();
    this.clientForm.reset();
  }

  filterByInvoiceDate() {
    this.getInvoiceDateFilter.emit();
  }

  filterByInvoicePaymentDate() {
    this.getInvoicePaymentDateFilter.emit();
  }

  filterByClientName() {
    this.getClientNameFilter.emit();
  }

  filterByCurrency() {
    this.getInvoiceCurrencyFilter.emit();
  }

  invoiceValueFilter() {
    this.getInvoiceValueFilter.emit();
  }

  invoiceBalanceValueFilter() {
    this.getInvoiceBalanceValueFilter.emit();
  }

  invoiceOwnerFiter() {
    this.getInvoiceOwnerFilter.emit();
  }

  customFilter(filter) {
    this.getInvoiceCustomFilter.emit(filter);
  }

  createUpdateFilter(type) {
    if (this.createFilterForm.valid) {
      const payload = {
        id: "",
        userId: this.userId,
        service: "invoice",
        filter: this.createFilterForm.value,
        name: this.createFilterForm.value.filterName,
      };
      if (type === "create") {
        this.customFilterServ
          .createCustomFilter(payload)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.createFilterForm.reset();
            this.getFilters();
          });
      } else {
        payload.id = this.filterList[0].id;
        this.customFilterServ
          .updateCustomFilter(payload)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe(() => {
            this.createFilterForm.reset();
            this.getFilters();
            this.showFilter = null;
          });
      }
    }
  }

  setValue(filterData) {
    if (filterData) {
      const { clientType } = filterData;
      this.createFilterForm.patchValue(filterData);
      this.createClientList =
        clientType === "Contact" ? this.contactList$ : this.companyList$;
    }
  }

  getFilters() {
    this.customFilterServ
      .getCustomFilter(this.userId, "invoice")
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.filterList = data.payload;
        // console.log(this.filterList, "loglid");
      });
  }

  deleteFilter(filter) {
    this.generalSrv
      .sweetAlertFileDeletions(`${filter.filter.filterName} Filter`)
      .then((result) => {
        if (result.value) {
          this.customFilterServ
            .deleteCustomFilter(filter.id)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
              this.getFilters();
            });
        }
      });
  }

  toStr(value) {
    return JSON.stringify(value);
  }

  toJson(value) {
    return JSON.parse(value);
  }
  editFilter(index, data?) {
    console.log(data, "edittiem");
    this.showFilter = index;
    this.setValue(data.filter);
  }

  cancelFiter(index) {
    this.showFilter = !index;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
