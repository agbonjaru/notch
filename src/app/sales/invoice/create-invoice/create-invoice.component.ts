import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
import { InvoiceProductModel } from "src/app/models/invoiceProduct.model";
import { GeneralService } from "src/app/services/general.service";
import { ProductServicesService } from "src/app/services/settings-services/product-services.service";
import { InvoiceService } from "src/app/services/invoice.service";
import { InvoiceModel } from "src/app/models/invoice.model";
import { MONTHS, SUBSCRIPTIONFREQUENCY } from "src/app/data/industries";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { ActivatedRoute, NavigationExtras } from "@angular/router";
import { SubscriptionService } from "src/app/services/subscription.service";
import { Observable, Subject } from "rxjs";
import { ClientService } from "src/app/services/client-services/clients.service";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { CurrencyService } from "src/app/services/currency.service";
import { take } from "rxjs/operators";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { CreditMgtService } from "src/app/services/settings-services/credit-mgt.service";
import { forkJoin } from "rxjs";
import { SignupLoginService } from "src/app/services/signupLogin.service";

@Component({
  selector: "app-create-invoice",
  templateUrl: "./create-invoice.component.html",
  styleUrls: ["./create-invoice.component.css"],
})
export class CreateInvoiceComponent implements OnInit {
  config = { ...selectConfig, placeholder: "Select Clients" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  arrayTeams: any;
  invoiceForm: FormGroup;
  activateTaxInclusive = [false];
  taxation = [];
  totalInvoiceAmountDetails: any;
  productDetails: Array<InvoiceProductModel> = [];
  productsName = [];
  loadingView = false;
  description = [];
  frequencies: Array<any>;
  months: Array<string>;
  restricDate = new Date().toISOString().slice(0, 10);
  restricDateTYP = new Date();
  recurrence = "none";
  startDate;
  periodCount;
  invoiceRefNumber;
  schedulerStatus = false;
  paymentDueDate;
  team: any;
  subStartDate;
  selectedClientName: any;
  selectedClientId;
  clientDropdownOptions: any;
  clientsDetailArray = [];
  selectedCurrency;
  schedulerBtn = "MAKE RECURRENT";
  dealsId = "";
  dealsTeamId;
  salesOrderId = "";
  disableClientDropDown = false;
  sendDaysAllowance: number;
  sendDayType: string;
  showSendDaysAllowance: boolean = false;

  orgId;
  org: OrgModel;
  arrayTeamObservable = new Subject();
  clientTemplateSet = false;
  totalBalanceDueForClient = {
    initial: 0,
    current: 0,
  };
  maxCreditAmount = 0;
  loadingCrdProfile = false;
  belowCredit;
  userId;
  currencyIdAttribute = "ngx-select-resize";
  taxList$ = this.signupSrv.fetchTax();
  selectedTax = 0;
  requiredCrdProfile = this.genSer.requireCreditProfile;

  currencies: any;
  baseCurr: string;
  savingSpinner = false;
  selfActive = false;

  constructor(
    private fb: FormBuilder,
    private invoiceSer: InvoiceService,
    private genSer: GeneralService,
    private productService: ProductServicesService,
    private companyServ: CompaniesService,
    private clientServ: ClientService,
    private currencyServ: CurrencyService,
    private salesOrderSrv: SalesOrderService,
    private localStorage: LocalStorageService,
    private crdProfile: CreditMgtService,
    private activeRoute: ActivatedRoute,
    private signupSrv: SignupLoginService
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.invoiceForm = this.fb.group({
      invoiceFormArray: this.fb.array([]),
    });
    this.frequencies = SUBSCRIPTIONFREQUENCY;
    this.months = MONTHS;
    this.subscribeToDataOnLoad();

    // Apply CSS when Print button is activated for Page
    this.genSer.printActivated.subscribe((res) =>
      res
        ? (this.currencyIdAttribute = "ngx-select-print")
        : (this.currencyIdAttribute = "ngx-select-resize")
    );
  }

  ngOnInit() {
    // Call  Functions on Init
    this.getSalespersonTeams();
    this.handleQueries();
  }

  // Get Credit Profile and balance due
  private getClientCreditProfile(id): Observable<any> {
    const crdProfile = this.crdProfile.fetchCreditProfileForClient(
      this.orgId,
      id
    );
    const invoicesByClient = this.invoiceSer.getInvoiceByFilter(
      `clientId=${id}`
    );
    return forkJoin([crdProfile, invoicesByClient]);
  }

  // Subscribe to Client, Product and Currency Data.
  private subscribeToDataOnLoad() {
    // Get Clients
    this.clientServ.getAllClients().subscribe(
      (res: any) => {
        if (res) {
          res.map((res2: any) => {
            this.clientsDetailArray.push({
              id: res2.id,
              name: res2.name,
              invoiceTemplateId: res2.invoiceTemplateId,
              email: res2.email,
            });
          });
          this.clientDropdownOptions = this.clientsDetailArray;
        }
      },
      (error) => {
        this.loadingView = false;
        console.log(error, "error on getting clients");
      }
    );

    // Get Product
    this.productService.getAllProductByCompany().subscribe(
      (res) => {
        if (res) {
          res.map((res2: any) => {
            this.productsName.push({
              id: res2.id,
              name: res2.name,
              description: res2.descrip,
            });
          });
          this.loadingView = false;
        }
      },
      (error) => {
        this.loadingView = false;
        console.log(error, "error on getting product");
      }
    );

    // Get Currencies
    this.currencyServ.org_currencies.subscribe((org_currencies: any) => {
      if (!this.genSer.checkIfObjectIsEmpty(org_currencies)) {
        let result = [];
        let res = this.genSer.convertObjectToArray(org_currencies.currencies);
        res.forEach((res2: any) => {
          result.push(res2.currency_code);
        });
        this.currencies = result;
        this.baseCurr = org_currencies.base_currency;

        if (typeof this.selectedCurrency === "object") {
          this.selectedCurrency =
            this.selectedCurrency.length !== 0
              ? this.selectedCurrency
              : this.baseCurr;
        } else {
          this.selectedCurrency = this.selectedCurrency
            ? this.selectedCurrency
            : this.baseCurr;
        }
      }
    });
  }

  // Handle Queries -> Copy From Deals and Quotations and Invoice Type (Reecurring or Not)
  private handleQueries() {
    this.activeRoute.queryParams.subscribe((res) => {
      if (res.session_location === "deals") {
        this.dealsId = res.session_id;
        this.selectedClientName = res.client_name;
        this.selectedClientId = res.client_id;
        this.selectedCurrency = res.currency;
        this.dealsTeamId = res.team_id;
        this.clientServ
          .getOneClients(this.selectedClientId)
          .subscribe(
            (res: any) =>
              (this.clientTemplateSet =
                res.payload[0].invoiceTemplateId > 0 &&
                res.payload[0].invoiceTemplateId
                  ? true
                  : false)
          );
      }

      if (res.session_id === "recurringInvoice") {
        // Activate schedular if route is selected
        this.schedulerStatus = true;
        !this.schedulerStatus
          ? (this.schedulerBtn = "MAKE RECUURENT")
          : (this.schedulerBtn = "REMOVE RECUURENT");
        this.createForm();
      } else if (res.session_location === "saleOrderCreateView") {
        this.activateTaxInclusive = [];
        this.salesOrderSrv.currentInvoice.subscribe((data: any) => {
          if (data) {
            this.selectedClientName = data.client.name;
            this.selectedClientId = data.client.id;
            this.clientServ
              .getOneClients(this.selectedClientId)
              .subscribe(
                (res: any) =>
                  (this.clientTemplateSet =
                    res.payload[0].invoiceTemplateId > 0 &&
                    res.payload[0].invoiceTemplateId
                      ? true
                      : false)
              );

            this.arrayTeamObservable.pipe(take(1)).subscribe((res: any) => {
              if (res) {
                res.forEach((element) => {
                  if (element.teamID == data.teamID) {
                    this.team = element;
                  }
                });
              }
            });
            this.selectedCurrency = data.currency;
            this.salesOrderId = data.salesOrderId;
            data.salesOrderItems.forEach((item) => this.copyInvoice(item));
          } else {
            this.createForm();
          }
        });
      } else if (res.session_id === "clientNavigation") {
        this.createForm();
        this.selectedClientName = res.client_name;
        this.selectedClientId = res.client_id;
        this.clientServ
          .getOneClients(this.selectedClientId)
          .subscribe(
            (res: any) =>
              (this.clientTemplateSet =
                res.payload[0].invoiceTemplateId > 0 &&
                res.payload[0].invoiceTemplateId
                  ? true
                  : false)
          );
        this.disableClientDropDown = true;
      } else if (res.session_type === "copyQuote") {
        this.activateTaxInclusive = [];
        // Create Table/Form dependent if data is copied or not
        const copies = JSON.parse(
          this.localStorage.getFromLocalStorage(`copiedQuote_${res.session_id}`)
        );
        // console.log(copies, "copy from copyQuote");
        if (copies === null || copies === undefined) {
          this.createForm();
        } else {
          const { selectedQuote } = copies;
          let removeClientDetails;
          switch (res.session_location) {
            case "invoiceListView":
              let extractProducts = selectedQuote[0].products;
              this.selectedClientName = selectedQuote[0].clientName;
              this.selectedClientId = selectedQuote[0].clientId;
              this.invoiceRefNumber = selectedQuote[0].refNumber;
              this.selectedCurrency = selectedQuote[0].currency;
              this.clientServ
                .getOneClients(this.selectedClientId)
                .subscribe(
                  (res: any) =>
                    (this.clientTemplateSet =
                      res.payload[0].invoiceTemplateId > 0 &&
                      res.payload[0].invoiceTemplateId
                        ? true
                        : false)
                );
              this.arrayTeamObservable.pipe(take(1)).subscribe((res: any) => {
                if (res) {
                  res.forEach((element) => {
                    if (element.teamID == selectedQuote[0].teamId) {
                      this.team = element;
                    }
                  });
                }
              });

              extractProducts =
                typeof extractProducts === "string"
                  ? JSON.parse(extractProducts)
                  : extractProducts;
              extractProducts.forEach((element) => {
                element =
                  typeof element === "string" ? JSON.parse(element) : element;
                this.copyInvoice(element);
              });
              this.localStorage.deleteFromLocalStorage(
                `copiedQuote_${res.session_id}`
              );
              break;

            case "quotationCreateView":
              this.arrayTeamObservable.pipe(take(1)).subscribe((res: any) => {
                if (res) {
                  res.forEach((element) => {
                    if (element.teamID == selectedQuote[0].teamId) {
                      this.team = element;
                    }
                  });
                }
              });

              removeClientDetails = copies.shift();
              this.selectedClientName = removeClientDetails.clientName;
              this.invoiceRefNumber = removeClientDetails.refNumber;
              this.selectedCurrency = removeClientDetails.currency;
              this.selectedClientId = removeClientDetails.clientId;
              this.clientServ
                .getOneClients(this.selectedClientId)
                .subscribe(
                  (res: any) =>
                    (this.clientTemplateSet =
                      res.payload[0].invoiceTemplateId > 0 &&
                      res.payload[0].invoiceTemplateId
                        ? true
                        : false)
                );

              console.log(removeClientDetails, "copies to ivoice");
              copies.forEach((element) => {
                this.copyInvoice(element);
              });
              this.localStorage.deleteFromLocalStorage(
                `copiedQuote_${res.session_id}`
              );
              break;
          }
        }
      } else {
        this.activateTaxInclusive = [];
        // Create Table/Form dependent if data is copied or not
        const copies = JSON.parse(
          this.localStorage.getFromLocalStorage(
            `copiedInvoice_${res.session_id}`
          )
        );
        // console.log(copies, "copy from");
        if (copies === null || copies === undefined) {
          this.createForm();
        } else {
          const { selectedInvoice } = copies;
          let removeClientDetails;
          switch (res.session_location) {
            case "invoiceListView":
              let extractProducts = selectedInvoice[0].products;
              this.selectedClientName = copies.clientName;
              console.log(this.selectedClientName, "vm");
              this.selectedClientId = copies.clientId;

              this.clientServ
                .getOneClients(this.selectedClientId)
                .subscribe(
                  (res: any) =>
                    (this.clientTemplateSet =
                      res.payload[0].invoiceTemplateId > 0 &&
                      res.payload[0].invoiceTemplateId
                        ? true
                        : false)
                );

              this.arrayTeamObservable.pipe(take(1)).subscribe((res: any) => {
                if (res) {
                  res.forEach((element) => {
                    if (element.teamID == selectedInvoice[0].teamId) {
                      this.team = element;
                    }
                  });
                }
              });
              // console.log(selectedInvoice[0], 'odk');
              this.invoiceRefNumber = selectedInvoice[0].refNumber;
              this.selectedCurrency = selectedInvoice[0].currency;
              this.periodCount = selectedInvoice[0].periodCount;

              this.startDate = new Date(selectedInvoice[0].createdOn);

              this.subStartDate = new Date(selectedInvoice[0].createdOn);

              this.paymentDueDate = new Date(selectedInvoice[0].paymentDueDate);

              if (selectedInvoice[0].frequency !== "none") {
                this.schedulerStatus = true;
                this.recurrence = selectedInvoice[0].frequency;
              } else {
                this.recurrence = "none";
              }

              // console.log(extractProducts, "copies to ivoice");
              extractProducts =
                typeof extractProducts === "string"
                  ? JSON.parse(extractProducts)
                  : extractProducts;
              extractProducts.forEach((element) => {
                element =
                  typeof element === "string" ? JSON.parse(element) : element;
                this.copyInvoice(element);
              });
              this.localStorage.deleteFromLocalStorage(
                `copiedInvoice_${res.session_id}`
              );
              break;

            case "quotationCreateView":
              removeClientDetails = copies.shift();
              console.log(removeClientDetails, "copies to ivoice");
              this.selectedClientName = removeClientDetails.clientName;
              this.invoiceRefNumber = removeClientDetails.refNumber;
              this.selectedCurrency = removeClientDetails.currency;
              this.selectedClientId = removeClientDetails.clientId;

              this.clientServ
                .getOneClients(this.selectedClientId)
                .subscribe(
                  (res: any) =>
                    (this.clientTemplateSet =
                      res.payload[0].invoiceTemplateId > 0 &&
                      res.payload[0].invoiceTemplateId
                        ? true
                        : false)
                );

              this.arrayTeamObservable.pipe(take(1)).subscribe((res: any) => {
                if (res) {
                  res.forEach((element) => {
                    if (element.teamID == removeClientDetails.team) {
                      this.team = element;
                    }
                  });
                }
              });

              copies.forEach((element) => {
                this.copyInvoice(element);
              });
              this.localStorage.deleteFromLocalStorage(
                `copiedInvoice_${res.session_id}`
              );
              break;
          }
        }
      }
    });
  }

  // Get getSalespersonTeams
  private getSalespersonTeams() {
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      this.arrayTeams = res;
      this.arrayTeamObservable.next(res);
      if (this.dealsTeamId) {
        const team = this.arrayTeams.find(
          (team) => team.teamID == this.dealsTeamId
        );
        this.team = team;
      }
    });
  }

  handleSelf(event) {
    if (event.target.checked) {
      this.companyServ.getSalespersonTeams().subscribe((res) => {
        const team = this.arrayTeams.find(
          (team) => team.teamID == this.genSer.user.teamID
        );
        this.team = team;
      });
      this.selfActive = true;
    } else {
      this.team = undefined;
      this.selfActive = false;
    }
  }

  private copyInvoice(data) {
    this.activateTaxInclusive.push(true);

    this.invoiceFormArray.push(
      this.fb.group({
        itemName: [data.itemName],
        description: [data.description],
        unitPrice: [data.unitPrice, Validators.required],
        quantity: [data.quantity, Validators.required],
        tax: [data.tax, Validators.required],
        taxInclusive: [data.taxInclusive, Validators.required],
        taxAmount: [data.taxAmount, Validators.required],
        amount: [data.amount, Validators.required],
        teamId: [data.teamId, Validators.required],
      })
    );

    this.taxation.push({
      unitPrice: data.unitPrice,
      amountBeforeTax: data.unitPrice * data.quantity,
      taxAmount: data.taxAmount,
      taxInclusive: data.taxInclusive,
      amountAfterTax: data.amount,
    });
    this.description.push(data.description);
    this.handleTotalAmountComputation();

    this.requiredCrdProfile ? this.handleCreditProfile() : null;
  }

  get invoiceFormArray(): FormArray {
    return this.invoiceForm.get("invoiceFormArray") as FormArray;
  }

  // Prepare Invoice Details
  private get invoiceDetails(): InvoiceModel {
    return {
      clientId: this.selectedClientId,
      clientName:
        Object.keys(this.selectedClientName).length > 0 &&
        typeof this.selectedClientName === "object"
          ? this.selectedClientName.name
          : this.selectedClientName,
      products: this.getProductDetails,
      createdBy: this.userId,
      totalCost: this.totalInvoiceAmountDetails.amountAfterTax,
      subtotalCost: this.totalInvoiceAmountDetails.amountBeforeTax,
      taxAmount: this.totalInvoiceAmountDetails.taxAmount,
      frequency: this.recurrence,
      createdOn: Date.parse(this.startDate),
      paymentDueDate: Date.parse(this.paymentDueDate),
      endDate: this.schedulerStatus
        ? this.calculateRecurringEndDate(
            this.recurrence,
            this.startDate.toISOString().slice(0, 10),
            this.periodCount
          )
        : Date.parse(this.paymentDueDate),
      refNumber: this.invoiceRefNumber,
      periodCount: this.periodCount || 0,
      isUpfront: "false",
      currency: this.selectedCurrency,
      isRecurring: this.schedulerStatus ? "true" : "false",
      salesOrderId: this.salesOrderId,
      dealId: this.dealsId,
      teamId: Number(this.team.teamID),
      sendDayType: this.sendDayType,
      sendDaysAllowance: this.sendDaysAllowance,
      organisation: this.org,
    };
  }

  // Get Product Info
  private get getProductDetails() {
    const returnProduct = this.invoiceFormArray.value.map((element, i) => {
      return {
        itemName: element.itemName,
        description: element.description
          ? element.description
          : this.description[i],
        unitPrice: element.unitPrice,
        quantity: element.quantity,
        tax: element.tax,
        taxInclusive: element.taxInclusive ? element.taxInclusive : false,
        taxAmount: this.taxation[i].taxAmount,
        amount: this.taxation[i].amountAfterTax,
      };
    });
    return returnProduct;
  }

  // Calculate Invoice Date and PaymentDue Date
  private calculateRecurringInvoicePaymentDate(frequency, startDate) {
    startDate = startDate ? startDate : this.restricDate;
    // console.log(startDate, "startdate", this.restricDate);
    const startDay = Number(startDate.split("-")[2]);
    const startMonth = Number(startDate.split("-")[1]);
    const startYear = Number(startDate.split("-")[0]);

    const endDay = startDay;
    let endMonth;
    let endYear;

    let haveFullEndDate = "";

    if (frequency === "month") {
      // let b = startMonth + 1;
      let b = startMonth;
      let noOfYears = 0;
      if (b > 12) {
        b = 0;
        noOfYears++;
      }
      endMonth = this.months[b - 1];
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;
      return Date.parse(haveFullEndDate);
    } else if (frequency === "quarter") {
      // let b = startMonth + 3;
      let b = startMonth;
      let noOfYears = 0;
      if (b > 12) {
        b = b - 12;
        noOfYears++;
      }
      endMonth = this.months[b - 1];
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;
      return Date.parse(haveFullEndDate);
    } else if (frequency === "annual") {
      // let b = startMonth + 12;
      let b = startMonth;
      let noOfYears = 0;
      if (b > 12) {
        b = b - 12;
        noOfYears++;
      }
      endMonth = this.months[b - 1];
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;

      return Date.parse(haveFullEndDate);
    }
  }

  // Calculate EndDate For Recurring
  private calculateRecurringEndDate(frequency, startDate, periodCount) {
    const startDay = Number(startDate.split("-")[2]);
    const startMonth = Number(startDate.split("-")[1]);
    const startYear = Number(startDate.split("-")[0]);

    const endDay = startDay;
    let endMonth;
    let endYear;

    let haveFullEndDate = "";

    if (frequency === "month") {
      let b = startMonth;
      let noOfYears = 0;

      for (let index = 0; index < periodCount; index++) {
        if (b >= 12) {
          b = 0;
          noOfYears++;
        }
        endMonth = this.months[b];
        b++;
      }
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;
      // console.log('st', haveFullEndDate);
      return Date.parse(haveFullEndDate);
    } else if (frequency === "quarter") {
      const quater = 12 / 4;
      let b = startMonth;
      const periodCountByQuater = periodCount * quater;
      let noOfYears = 0;

      for (let index = 0; index < periodCountByQuater; index++) {
        if (b >= 12) {
          b = 0;
          noOfYears++;
        }
        endMonth = this.months[b];
        b++;
      }
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;
      // console.log('qt', haveFullEndDate);
      return Date.parse(haveFullEndDate);
    } else if (frequency === "annual") {
      const aYear = 12;
      let b = startMonth;
      const periodCountByYear = periodCount * aYear;
      let noOfYears = 0;

      for (let index = 0; index < periodCountByYear; index++) {
        if (b >= 12) {
          b = 0;
          noOfYears++;
        }
        endMonth = this.months[b];
        b++;
      }
      endYear = startYear + noOfYears;
      haveFullEndDate = `${endDay}-${endMonth}-${endYear}`;
      // console.log('yr', haveFullEndDate);
      return Date.parse(haveFullEndDate);
    }
  }

  private getCalculateAmountAfterTax(index) {
    const {
      unitPrice,
      quantity,
      tax,
      taxInclusive,
    } = this.invoiceFormArray.value[index];
    // get Tax Extract When not in advance mode
    const taxAmountExtract = Number(
      this.calculateTaxAmount(unitPrice, quantity, tax, taxInclusive)
    );
    const amt = this.getRowTotal(
      unitPrice,
      quantity,
      taxAmountExtract,
      taxInclusive
    );
    this.taxation[index] = {
      unitPrice,
      amountBeforeTax: unitPrice * quantity,
      taxAmount: taxAmountExtract,
      amountAfterTax: amt,
    };
    // return amt;
  }

  private calculateTaxAmount(unitprice, quantity, tax, taxInclusive) {
    if (tax !== "none" && taxInclusive) {
      // Vat and Inclusive
      const totalcost = unitprice * quantity;
      const totalcostPlusRate = totalcost * 100;
      const rate = Number(this.selectedTax) + 100;
      const taxAmountBeforeInclusion =
        unitprice * quantity - Number((totalcostPlusRate / rate).toFixed(2));
      // console.log(taxAmountBeforeInclusion.toFixed(2), 'Vat and Inclusive');
      return taxAmountBeforeInclusion.toFixed(2);
    } else if (tax !== "none" && !taxInclusive) {
      // Vat and Not Inclusive
      const totalcost = unitprice * quantity;
      const rate = Number(this.selectedTax) / 100;
      const taxAmountWithoutInclusion = Number((totalcost * rate).toFixed(2));
      // console.log(taxAmountWithoutInclusion, 'Vat and Not Inclusive');
      return Number(taxAmountWithoutInclusion);
    } else if (tax === "none") {
      console.log(0, "none");
      return 0;
    }
  }

  private getRowTotal(unitPrice, quantity, taxAmountExtract, taxInclusive) {
    if (taxInclusive) {
      return unitPrice * quantity;
    } else {
      return unitPrice * quantity + Number(taxAmountExtract);
    }
  }

  // Handle Sales Person/Teams Count

  private countForTeamsSalesPerson(): Observable<any> {
    const salesperson = this.companyServ.updateCountTeamsSalesPerson(
      2,
      1,
      this.userId
    );
    const teams = this.companyServ.updateCountTeamsSalesPerson(
      2,
      2,
      this.team.teamID
    );
    return forkJoin([teams, salesperson]);
  }

  // Reset Field After Invoice Creation
  private clearContent() {
    this.selectedCurrency = this.baseCurr;
    this.invoiceRefNumber = "";
    this.team = "";
    this.startDate = "";
    this.paymentDueDate = "";
    this.subStartDate = "";
    this.recurrence = "none";
    this.periodCount = "";
    this.description = [];
    this.taxation = [];
    this.totalInvoiceAmountDetails = {};
    this.belowCredit = undefined;
    this.invoiceForm = this.fb.group({
      invoiceFormArray: this.fb.array([]),
    });
    this.createForm();
    // test
    this.getSalespersonTeams();
  }

  // subscribe to credit profile
  private handleCreditProfile() {
    if (this.selectedClientId) {
      this.getClientCreditProfile(this.selectedClientId).subscribe(
        (res) => {
          if (res.length > 1) {
            let total = 0;
            const { payload } = res[1];
            for (const item of payload) {
              const { balanceDue, currency } = item;

              // calculate each overdue based on currency rating
              let rate = this.currencyServ.get_conversion_rate(currency);
              total += balanceDue / rate;
            }
            this.totalBalanceDueForClient = {
              initial: total,
              current: total,
            };
            this.maxCreditAmount = res[0].maxAmount;
            console.log(total, this.maxCreditAmount, "testhere");
            // load crumbs display
            total >= this.maxCreditAmount
              ? (this.belowCredit = "false")
              : (this.belowCredit = "true");
            this.loadingCrdProfile = false;
          } else {
            let validationFields = "Fetching Data. Kindly Wait";
            this.genSer.sweetAlertFieldValidatio(`${validationFields}`);
          }
        },
        (error) => {
          if ((error.status = 500)) {
            let validationFields =
              "Error in fetching Credit Profile for this Client.";
            this.genSer.sweetAlertFieldValidatio(`${validationFields}`);
          }
        }
      );
    }
  }

  onChangeSendDaysAllowance() {
    const sendDayType = this.sendDayType.toLowerCase();
    if (sendDayType === "on") {
      this.sendDaysAllowance = 0;
      this.showSendDaysAllowance = false;
    } else this.showSendDaysAllowance = true;
  }

  // Handle Client Selection and Check Client Template
  handleClientSelection() {
    this.loadingCrdProfile = this.selectedClientName.id ? true : false; // Activate loading when selecting client
    this.belowCredit = ""; // Reset status when selecting client
    this.totalBalanceDueForClient = {
      initial: 0,
      current: 0,
    }; // Reset total amount when selecting client

    console.log(this.selectedClientName, "lofjd");
    this.selectedClientId = this.selectedClientName.id;
    this.clientTemplateSet =
      this.selectedClientName.invoiceTemplateId > 0 &&
      this.selectedClientName.invoiceTemplateId
        ? true
        : false;
    this.requiredCrdProfile ? this.handleCreditProfile() : null;
  }

  // Handle Product Selection
  handleProductSelection(index) {
    const itemName = this.invoiceFormArray.value[index].itemName;
    this.productsName.filter((res) => {
      if (res.name === itemName) {
        this.description[index] = res.description;
        this.invoiceFormArray.controls[index]
          .get("description")
          .setValue(res.description);
      }
    });
  }

  // Handle Invoice Payment Date On Recurring
  handleInvoicePaymentDate() {
    if (
      this.schedulerStatus &&
      this.recurrence !== "none" &&
      this.subStartDate
    ) {
      const dateCalculatedNumber = this.calculateRecurringInvoicePaymentDate(
        this.recurrence,
        this.subStartDate.toISOString().slice(0, 10)
      );
      // console.log(dateCalculatedNumber, "resrtir");
      const oneDay = new Date().getTimezoneOffset() * 60000; // toISOString deducte 1day
      const dateCalculated = new Date(dateCalculatedNumber - oneDay);
      // console.log(dateCalculated, "newDate");
      this.startDate = dateCalculated;
      this.paymentDueDate = dateCalculated;
    }
  }

  // Display Scheduler button info
  displayScheduler() {
    this.schedulerStatus = !this.schedulerStatus;
    !this.schedulerStatus
      ? (this.schedulerBtn = "MAKE RECURRENT")
      : (this.schedulerBtn = "REMOVE RECURRENT");
  }

  // Select Tax Type
  handleTaxSelection(index) {
    const { tax } = this.invoiceFormArray.value[index];
    if (tax === "none") {
      this.taxation[index].taxInclusive = false;
      this.invoiceFormArray.value[index].taxInclusive = false;
      this.activateTaxInclusive[index] = false;
    } else {
      this.activateTaxInclusive[index] = true;
      this.selectedTax = tax;
    }
    this.handleComputation(index);
  }

  // Initiate a form field
  createForm() {
    this.invoiceFormArray.push(
      this.fb.group({
        itemName: [""],
        description: [""],
        unitPrice: [0, Validators.required],
        quantity: [0, Validators.required],
        tax: ["none", Validators.required],
        taxInclusive: [false, Validators.required],
      })
    );
    this.taxation.push({
      unitPrice: this.invoiceFormArray.value[0].unitPrice,
      taxInclusive: this.invoiceFormArray.value[0].taxInclusive,
      amountBeforeTax: 0,
      taxAmount: 0,
      amountAfterTax: 0,
    });
    this.description.push("");
    this.handleTotalAmountComputation();
  }

  // Add a form field for quotes
  addQuote() {
    this.invoiceFormArray.push(
      this.fb.group({
        itemName: [""],
        description: [""],
        unitPrice: [0, Validators.required],
        quantity: [0, Validators.required],
        tax: ["none", Validators.required],
        taxInclusive: [false, Validators.required],
      })
    );
    const index = this.invoiceFormArray.length - 1;
    this.taxation.push({
      unitPrice: this.invoiceFormArray.value[index].unitPrice,
      taxInclusive: this.invoiceFormArray.value[index].taxInclusive,
      amountBeforeTax: 0,
      taxAmount: 0,
      amountAfterTax: 0,
    });
    this.description.push("");
    this.handleTotalAmountComputation();
    // Add markup, taxselction and inclusive status by row
    this.activateTaxInclusive.push(false);
  }

  // Remove a form field for quotes
  deleteQuote(index: number) {
    this.invoiceFormArray.removeAt(index);
    this.taxation.splice(index, 1);
    this.handleTotalAmountComputation();
  }

  // Computation of Invoice By Row
  handleComputation(index) {
    this.getCalculateAmountAfterTax(index);
    this.handleTotalAmountComputation();
  }

  // Computation of Total Invoice
  handleTotalAmountComputation() {
    const initialValue = 0;
    const result = {
      amountBeforeTax: this.taxation.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.amountBeforeTax);
      }, initialValue),
      taxAmount: this.taxation.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.taxAmount);
      }, initialValue),
      amountAfterTax: this.taxation.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.amountAfterTax);
      }, initialValue),
    };
    if (
      Number(result.amountBeforeTax) + Number(result.taxAmount) !==
      Number(result.amountAfterTax)
    ) {
      result.amountBeforeTax =
        Number(result.amountAfterTax) - Number(result.taxAmount);
      this.totalInvoiceAmountDetails = result;
    } else {
      this.totalInvoiceAmountDetails = result;
    }
  }

  // compare ratings of credit profile with total
  private get compareInvoiceTotalWithCrdProfile() {
    this.totalBalanceDueForClient.current = this.totalBalanceDueForClient.initial; // make sure the current BD is equal to total of invoices BD
    let resultAfterRate = 0;
    // check rate of the invoice currency and calculate with base
    // calculate each overdue based on currency rating
    let rate = this.currencyServ.get_conversion_rate(this.selectedCurrency);
    console.log(rate, "rate");
    resultAfterRate = this.totalInvoiceAmountDetails.amountAfterTax / rate;

    this.totalBalanceDueForClient.current += resultAfterRate; // Add new invoice total to old overdues

    console.log(
      this.totalBalanceDueForClient.current,
      "this.totalBalanceDueForClient.current",
      this.maxCreditAmount
    );
    return this.totalBalanceDueForClient.current > this.maxCreditAmount;
  }

  // Handle Save
  handleInvoiceCreation() {
    console.log(this.invoiceDetails, "invoice");
    let validationFields = this.startDate ? "" : "Start Date Field is Empty! ";

    if (this.requiredCrdProfile) {
      validationFields += this.compareInvoiceTotalWithCrdProfile
        ? `Client's credit exceeded with new invoice! Your available credit is ${
            this.baseCurr
          }${this.maxCreditAmount}. 
        The total amount overdue was ${this.baseCurr}${
            this.totalBalanceDueForClient.initial
          } - converted to base currency.
        The total invoice plus the overdues, converted to base currency is ${
          this.baseCurr
        }${this.totalBalanceDueForClient.current.toFixed(2)}. `
        : "";
    }

    validationFields += this.clientTemplateSet
      ? ""
      : "Kindly Set Client Template! ";

    validationFields +=
      this.recurrence !== "none" && !this.periodCount
        ? "Period Count Field is Empty! "
        : "";

    validationFields +=
      this.totalInvoiceAmountDetails.amountAfterTax < 1
        ? "Amount can not be in the negative or Zero! "
        : "";

    validationFields += this.team.teamID ? "" : "Kindly Set Team! ";

    validationFields += this.paymentDueDate
      ? ""
      : "Payment Due Date Field is Empty! ";

    validationFields +=
      this.recurrence === "none" && this.periodCount
        ? "Recurrence Field is Empty"
        : "";

    validationFields += this.invoiceRefNumber ? "" : "Reference is Empty! ";

    validationFields +=
      this.selectedClientName.email !== ""
        ? ""
        : "Client Email is Required. Kindly populate client email on client profile! ";

    validationFields +=
      (this.selectedClientName.name !== undefined &&
        typeof this.selectedClientName === "object") ||
      (this.selectedClientName && typeof this.selectedClientName === "string")
        ? ""
        : "Client Field is Empty! ";

    validationFields +=
      this.selectedCurrency.length > 0 ? "" : "Currency Field is Empty! ";

    // check if product is empty
    // validationFields += this.invoiceFormArray.valid
    //   ? ""
    //   : "Fill all asterick(*) items! ";

    if (!validationFields) {
      this.savingSpinner = true;
      this.genSer.sweetAlertFileCreations("Invoices List").then((response) => {
        if (response.value) {
          const navigationExtras: NavigationExtras = {
            queryParams: { session_table: "All" },
          };
          let data = this.invoiceDetails;
          data = this.dealsId ? { ...data, dealId: this.dealsId } : data;
          data = this.salesOrderId
            ? {
                ...data,
                salesOrderId: this.salesOrderId,
              }
            : data;
          this.invoiceSer
            .createInvoice({
              ...data,
              equivalents: this.currencyServ.get_cost_equivalents(
                this.baseCurr,
                this.selectedCurrency,
                data.totalCost
              ),
            })
            .subscribe(
              (res: any) => {
                console.log(res, "result on invouce");
                this.savingSpinner = false;
                if (res.success) {
                  this.countForTeamsSalesPerson().subscribe((res: any) => {
                    console.log(res, "countforteamsalesperson");
                    if ((res.status = "SUCCESS!!!")) {
                      this.clearContent();
                    }
                  });
                  this.genSer.sweetAlertFileCreationSuccess(
                    "Invoices",
                    "/sales/invoice-list",
                    navigationExtras
                  );
                }
              },
              (error) => {
                console.log(error);
              }
            );
        }
        this.clearContent();
        this.savingSpinner = false;
      });
    } else {
      this.genSer.sweetAlertFieldValidatio(`${validationFields}`);
    }
  }
}
