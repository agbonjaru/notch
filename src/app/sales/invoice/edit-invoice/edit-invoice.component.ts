import { Component, OnInit } from "@angular/core";
import { InvoiceProductModel } from "src/app/models/invoiceProduct.model";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { InvoiceService } from "src/app/services/invoice.service";
import { GeneralService } from "src/app/services/general.service";
import { ProductServicesService } from "src/app/services/settings-services/product-services.service";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { ActivatedRoute, Params } from "@angular/router";
import { SUBSCRIPTIONFREQUENCY, MONTHS } from "src/app/data/industries";
import * as $ from "jquery";
import { InvoiceModel } from "src/app/models/invoice.model";
import { isArray } from "util";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Observable } from "rxjs";
import { BANKS } from "src/app/data/bank";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { CurrencyService } from "src/app/services/currency.service";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { CreditMgtService } from "src/app/services/settings-services/credit-mgt.service";
import { forkJoin } from "rxjs";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { BankService } from "src/app/services/settings-services/bank.service";
import { EmailService } from "src/app/services/integrations/email/email.service";

@Component({
  selector: "app-edit-invoice",
  templateUrl: "./edit-invoice.component.html",
  styleUrls: ["./edit-invoice.component.css"],
})
export class EditInvoiceComponent implements OnInit {
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };

  arrayTeams: any;
  teamForm: FormGroup;
  invoiceForm: FormGroup;
  paymentForm: FormGroup;
  activateTaxInclusive = [];
  taxation = [];
  team;
  totalInvoiceAmountDetails: any;
  productDetails: Array<InvoiceProductModel> = [];
  productsName = [];
  loadingView = false;
  description = [];
  frequencies: Array<any>;
  months: Array<string>;
  restricDate = new Date().toISOString().slice(0, 10);
  restricDateTYP = new Date();
  recurrence = "";
  startDate;
  periodCount;
  invoiceRefNumber;
  invoiceId;
  subscriptionInvoiceId;
  paymentHistory;

  paymentDueDate;
  subStartDate;
  balancePaidInFull = false;
  clientId;
  clientName;
  selectedClientsDetails: any;
  scheduleId;
  bankName;
  orgId;
  org: OrgModel;
  validatePaymentAmount = false;

  selectedCurrency;
  currencies: any;
  baseCurr: string;

  totalBalanceDueForClient = {
    initial: 0,
    current: 0,
  };
  maxCreditAmount = 0;
  loadingCrdProfile = false;
  belowCredit;
  currencyIdAttribute = "ngx-select-resize";
  taxList$ = this.signupSrv.fetchTax();
  selectedTax = 0;
  completedInvoice: any;
  userId;
  bankAccountDetails = [];
  loading = false;

  requiredCrdProfile = this.genSer.requireCreditProfile;
  savingSpinner = false;
  savingSpinner2 = false;
  selfActive = false;

  constructor(
    private fb: FormBuilder,
    private invoiceSer: InvoiceService,
    public genSer: GeneralService,
    private productService: ProductServicesService,
    private currencyServ: CurrencyService,
    private companyServ: CompaniesService,
    private crdProfile: CreditMgtService,
    private activeRoute: ActivatedRoute,
    private signupSrv: SignupLoginService,
    private clientServ: ClientService,
    private bankServ: BankService,
    private emailService: EmailService
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.invoiceForm = this.fb.group({
      invoiceFormArray: this.fb.array([]),
    });
    this.createPaymentForm();
    this.frequencies = SUBSCRIPTIONFREQUENCY;
    this.months = MONTHS;
    this.bankName = BANKS;

    // Apply CSS when Print button is activated for Page
    this.genSer.printActivated.subscribe((res) =>
      res
        ? (this.currencyIdAttribute = "ngx-select-print")
        : (this.currencyIdAttribute = "ngx-select-resize")
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
      }
    });
  }

  ngOnInit() {
    this.createTeamForm();
    this.activeRoute.params.subscribe((par: Params) => {
      const { id } = par;
      this.invoiceId = id;
      this.handleInvoiceData(id);
      this.getOrganisationBankAccounts();
    });

    // this.invoiceSer.getPayment().subscribe(res => console.log(res, "pol"));
  }

  private getOrganisationBankAccounts() {
    this.bankServ.fetch_bank_records().subscribe((response: any) => {
      if (response.success) {
        const { payload } = response;
        this.bankAccountDetails = payload.filter(
          (account) => account.currency === this.selectedCurrency
        );
        console.log(payload, "details", this.bankAccountDetails);
      }
    });
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

  private createTeamForm() {
    this.teamForm = this.fb.group({
      team: [""],
    });
  }

  private getSalespersonTeams(teamId: number) {
    this.selfActive = Number(this.genSer.user.teamID) === teamId ? true : false;
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      this.arrayTeams = res.filter((data) => data.teamID !== teamId);
      let team = res.filter((data) => data.teamID === teamId);
      this.teamForm.controls.team.setValue(team[0]);
    });
  }

  handleSelf(event) {
    if (event.target.checked) {
      this.companyServ.getSalespersonTeams().subscribe((res) => {
        let team = res.filter(
          (team) => team.teamID === Number(this.genSer.user.teamID)
        );
        this.teamForm.controls.team.setValue(team[0]);
      });
      this.selfActive = true;
    } else {
      this.teamForm.controls.team.setValue("");
      this.selfActive = false;
    }
  }

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

  // Get Invoice
  private handleInvoiceData(id) {
    this.invoiceSer.getOneInvoice(id).subscribe((res: any) => {
      if (res) {
        const { payload } = res;
        console.log(payload, "onEdit");
        const { paymentHistory } = payload;
        this.completedInvoice = payload;
        this.invoiceRefNumber = payload.refNumber;
        this.subscriptionInvoiceId = payload.subscriptionId;
        this.paymentHistory = paymentHistory;
        this.clientName = payload.clientName;

        // Get Clients
        this.clientServ.getAllClients().subscribe(
          (res: any) => {
            if (res) {
              res.map((res2: any) => {
                if (
                  res2.id === payload.clientId &&
                  res2.name === payload.clientName
                ) {
                  this.selectedClientsDetails = {
                    ...res2,
                  };
                }
              });
            }
          },
          (error) => {
            this.loadingView = false;
            console.log(error, "error on getting clients");
          }
        );
        // Ends
        this.clientId = payload.clientId;
        this.selectedCurrency = payload.currency;

        this.requiredCrdProfile
          ? this.subscribeToCreditProfile(this.clientId, payload.totalCost)
          : null;

        this.getSalespersonTeams(payload.teamId);

        this.scheduleId = payload.scheduleId;

        this.balancePaidInFull = payload.balanceDue <= 0 ? true : false;
        const calAdd1hr = this.subscriptionInvoiceId
          ? payload.createdOn + 3600000
          : payload.createdOn;

        const calAdd1hrPaymt = this.subscriptionInvoiceId
          ? payload.paymentDueDate + 3600000
          : payload.paymentDueDate;
        this.startDate = new Date(calAdd1hr);
        this.subStartDate = new Date(calAdd1hr);
        this.paymentDueDate = new Date(calAdd1hrPaymt);

        if (payload.frequency && payload.frequency !== "none") {
          this.recurrence = payload.frequency;
        } else {
          this.recurrence = "none";
        }

        this.periodCount = payload.periodCount;
        let product = payload.products;
        product = typeof product === "string" ? JSON.parse(product) : product;
        product.forEach((element) => {
          element = typeof element === "string" ? JSON.parse(element) : element;
          element = isArray(element) ? element[0] : element;
          // console.log(element, "elemtal");
          this.invoiceFormArray.push(
            this.fb.group({
              itemName: [element.itemName, Validators.required],
              description: [element.description],
              purchasePrice: [element.purchasePrice, Validators.required],
              markUp: [element.markup, Validators.required],
              markUpType: [element.markUpType, Validators.required],
              unitPrice: [element.unitPrice, Validators.required],
              quantity: [element.quantity, Validators.required],
              tax: [element.tax, Validators.required],
              taxInclusive: [element.taxInclusive, Validators.required],
              taxAmount: [element.taxAmount, Validators.required],
              amount: [element.amount, Validators.required],
            })
          );
          element.tax === "none"
            ? this.activateTaxInclusive.push(false)
            : this.activateTaxInclusive.push(true);
          this.description.push(element.description);
          this.taxation.push({
            unitPrice: element.unitPrice,
            amountBeforeTax: element.unitPrice * element.quantity,
            taxAmount: element.taxAmount,
            taxInclusive: element.taxInclusive,
            amountAfterTax: element.amount,
          });
        });

        this.handleTotalAmountComputation();

        this.totalInvoiceAmountDetails.balanceDue =
          paymentHistory.length !== 0
            ? paymentHistory[paymentHistory.length - 1].balanceDue
            : this.totalInvoiceAmountDetails.balanceDue;
      }
    });
  }

  get invoiceFormArray(): FormArray {
    return this.invoiceForm.get("invoiceFormArray") as FormArray;
  }

  // Prepare Invoice Details
  private get invoiceDetails() {
    // InvoiceModel
    return {
      id: this.invoiceId,
      clientId: this.clientId,
      clientName: this.clientName,
      scheduleId: this.scheduleId,
      products: this.getProductDetails,
      createdBy: this.userId,
      currency: this.selectedCurrency,
      totalCost: this.totalInvoiceAmountDetails.amountAfterTax,
      subtotalCost: this.totalInvoiceAmountDetails.amountBeforeTax,
      taxAmount: this.totalInvoiceAmountDetails.taxAmount,
      frequency: this.recurrence,
      balanceDue: this.totalInvoiceAmountDetails.balanceDue,
      createdOn: Date.parse(this.startDate),
      endDate: Date.parse(this.paymentDueDate),
      paymentDueDate: Date.parse(this.paymentDueDate),
      refNumber: this.invoiceRefNumber,
      periodCount: this.periodCount || 0,
      isUpfront: "false",
      paymentHistory: [],
      teamId: this.teamForm.value.team.teamID,
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
    return amt;
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
      return Number(taxAmountBeforeInclusion.toFixed(2));
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

  // Prep payment details
  private get paymentDetails() {
    const now = new Date().toISOString();
    return {
      invoiceId: this.invoiceId,
      accountId: this.paymentForm.value.bankNameSelected,
      orgId: this.orgId,
      createdBy: 2,
      amountPaid: this.paymentForm.value.amount,
      description: this.paymentForm.value.description,
      createdOn: Date.parse(now),
      paymentHistory: this.paymentHistoryDetails,
      balanceDue: this.paymentHistoryDetails[
        this.paymentHistoryDetails.length - 1
      ].balanceDue,
    };
  }

  // Payment History
  private get paymentHistoryDetails() {
    const now = new Date().toISOString();
    const data = {
      amountBeforeTax: this.totalInvoiceAmountDetails.amountBeforeTax,
      taxAmount: this.totalInvoiceAmountDetails.taxAmount,
      amountAfterTax: this.totalInvoiceAmountDetails.amountAfterTax,
      amountPaid: this.paymentForm.value.amount,
      balanceDue:
        this.totalInvoiceAmountDetails.balanceDue -
        this.paymentForm.value.amount,
      date: Date.parse(now),
    };
    return [...this.paymentHistory, data];
  }

  // Handle Client Selection and Check Client Template
  private subscribeToCreditProfile(id, totalCost) {
    this.loadingCrdProfile = true; // Activate loading when selecting client
    this.belowCredit = ""; // Reset status when selecting client
    this.totalBalanceDueForClient = {
      initial: 0,
      current: 0,
    }; // Reset total amount when selecting client

    let rate = this.currencyServ.get_conversion_rate(this.selectedCurrency);
    let convertTotalcost = totalCost / rate;

    this.getClientCreditProfile(id).subscribe(
      (res) => {
        if (res.length > 1) {
          let total = 0;
          const { payload } = res[1];
          for (const item of payload) {
            const { balanceDue, currency } = item;

            // calculate each overdue based on currency rating
            let rate = this.currencyServ.get_conversion_rate(currency);
            // console.log(rate, "rate");
            total += balanceDue / rate;
          }
          // The balance due less the current invoice value
          this.totalBalanceDueForClient = {
            initial: total - convertTotalcost,
            current: total - convertTotalcost,
          };
          this.maxCreditAmount = res[0].maxAmount;
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

  private get invoiceEmailDetails() {
    console.log(this.selectedClientsDetails, "love");
    const result = {
      userId: this.userId,
      invoice: {
        ...this.completedInvoice,
      },
      templateId: this.selectedClientsDetails.invoiceTemplateId,
      organisation: {
        ...this.org,
      },
      client: {
        ...this.selectedClientsDetails,
      },
      accounts: [...this.bankAccountDetails],
    };
    return result;
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

  // Initiate Payment Form
  createPaymentForm() {
    this.paymentForm = this.fb.group({
      amount: ["", Validators.required],
      description: ["", Validators.required],
      bankNameSelected: ["", Validators.required],
    });
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
      balanceDue: this.taxation.reduce((accumulator, currentValue) => {
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

  // Handle invoice Update
  handleInvoiceUpdate() {
    // For validation for the header form field
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
    validationFields +=
      this.totalInvoiceAmountDetails.amountAfterTax < 1
        ? "Amount can not be in the negative or Zero! "
        : "";

    validationFields +=
      this.recurrence !== "none" && !this.periodCount
        ? "Period Count Field is Empty"
        : "";

    validationFields +=
      this.recurrence === "none" && this.periodCount
        ? "Recurrence Field is Empty"
        : "";

    validationFields += this.invoiceRefNumber ? "" : "Reference is Empty! ";

    validationFields += this.teamForm.value.team.teamID
      ? ""
      : "Kindly Set Team! ";

    validationFields +=
      this.selectedCurrency.length > 0 ? "" : "Currency Field is Empty! ";

    console.log(this.invoiceDetails, "this.invoiceDetails");

    if (!validationFields) {
      this.savingSpinner = true;
      this.genSer.sweetAlertFileUpdates("Invoice").then((response) => {
        if (response.value) {
          this.invoiceSer.updateInvoice(this.invoiceDetails).subscribe(
            (res) => {
              this.savingSpinner = false;
              if (res) {
                this.genSer.sweetAlertFileUpdateSuccess(
                  "Invoice",
                  "/sales/invoice-list"
                );
                this.getOrganisationBankAccounts();
              }
            },
            (error) => {
              console.log(error);
            }
          );
        }
        this.savingSpinner = false;
      });
    } else {
      this.genSer.sweetAlertFieldValidatio(`${validationFields}`);
    }
  }

  // Validate Amount on Payment Doesnt exceed Balance Due
  checkValue(value) {
    if (value > this.totalInvoiceAmountDetails.balanceDue) {
      this.paymentForm.controls.amount.setValue(
        this.totalInvoiceAmountDetails.balanceDue
      );
      this.validatePaymentAmount = true;
      return;
    }
    this.validatePaymentAmount = false;
    return;
  }

  // Handle Payment
  handlePaymentCreation() {
    console.log(this.paymentDetails, "payment...");
    this.savingSpinner2 = true;
    const paymentHistory = this.paymentDetails.paymentHistory;
    this.genSer.sweetAlertFileUpdates("Payment").then((response) => {
      this.savingSpinner2 = false;
      if (response.value) {
        this.invoiceSer
          .createPayment({
            ...this.paymentDetails,
            client: {
              id: this.clientId,
              name: this.clientName,
            },
          })
          .subscribe(
            (res: any) => {
              const { payload } = res;
              if (res) {
                console.log(payload, "respayment");
                // Set the Balance Due and Payment History
                this.totalInvoiceAmountDetails.balanceDue =
                  this.totalInvoiceAmountDetails.balanceDue -
                  payload.amountPaid;
                this.paymentHistory = paymentHistory;

                this.paymentForm.reset();
                this.genSer.sweetAlertFileUpdateSuccess(
                  "Invoice",
                  "/sales/invoice-list"
                );
              }
            },
            (error) => {
              console.log(error);
            }
          );
      }
      this.savingSpinner2 = false;
    });
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

  // Print Page
  handlePrint() {
    const invoiceDetails = {
      ...this.invoiceEmailDetails,
      type: "invoice",
    };
    let payload: any = { ...invoiceDetails };
    console.log(payload, "pay");
    this.genSer.printQuotationInvoice(payload).subscribe((res: any) => {
      const { payload } = res;
      const title =
        "Invoice For " + this.clientName + " - " + new Date().getTime();

      var printWindow = window.open("", "", "height=400,width=800");
      printWindow.document.write(`<html><head><title>${title}</title>`);
      printWindow.document.write("</head><body >");
      printWindow.document.write(payload);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    });
  }
}
