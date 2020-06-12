import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  SUBSCRIPTIONCLIENTS,
  SUBSCRIPTIONFREQUENCY,
  MONTHS,
} from "src/app/data/industries";
import { SubscriptionModel } from "src/app/models/subscription.model";
import { SubscriptionService } from "src/app/services/subscription.service";
import { GeneralService } from "src/app/services/general.service";
import { ProductServicesService } from "src/app/services/settings-services/product-services.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { CreateSubscription } from "src/app/store/actions/subscription.actions";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Observable } from "rxjs";
import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { CurrencyService } from "src/app/services/currency.service";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { InvoiceService } from "src/app/services/invoice.service";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import DateUtils from "src/app/utils/date";

@Component({
  selector: "app-create-subscription",
  templateUrl: "./create-subscription.component.html",
  styleUrls: ["./create-subscription.component.css"],
})
export class CreateSubscriptionComponent implements OnInit {
  config = { ...selectConfig, placeholder: "Select Clients" };
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };
  arrayTeams: any;
  subscriptionForm: FormGroup;
  descriptionForm: FormGroup;
  loadingView = false;
  dropdownOptions: Observable<any>;
  frequencies: Array<any>;
  months: Array<string>;
  restricDate = new Date().toISOString().slice(0, 10);
  restricDateTYP = new Date();
  productsName = [];
  clients = [];
  subscriptionClientId;
  description;
  activateTaxInclusive = false;
  taxation = {
    taxAmount: 0,
    amountAftertax: 0,
  };
  orgId;
  org: OrgModel;
  clientTemplateSet = false;
  taxList$ = this.signupSrv.getAllTaxes();
  selectedTax = 0;

  base_currency: string;
  currencies: any;
  userId;
  savingSpinner = false;
  selfActive = false;

  /** UTILITY */
  private dateUtil = new DateUtils();

  constructor(
    private fb: FormBuilder,
    private subService: SubscriptionService,
    private clientServ: ClientService,
    private productService: ProductServicesService,
    private companyServ: CompaniesService,
    private genSer: GeneralService,
    private currencyServ: CurrencyService,
    private invoiceSer: InvoiceService,
    private signupSrv: SignupLoginService,
    store: Store<AppState>
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.frequencies = SUBSCRIPTIONFREQUENCY;
    this.months = MONTHS;
    this.loadingView = true;

    // Get Clients
    this.clientServ.getAllClients().subscribe(
      (res: any) => {
        console.log(res);
        if (res) {
          res.map((res2: any) => {
            this.clients.push({
              ...res2,
            });
          });

          const newData = this.clients.map((el) => ({
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
  }

  ngOnInit() {
    this.createForm();
    this.getSalespersonTeams();
  }

  // Get getSalespersonTeams
  private getSalespersonTeams() {
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      // console.log(res, 'arrayTeam');
      this.arrayTeams = res;
    });
  }

  handleSelf(event) {
    if (event.target.checked) {
      const team = this.arrayTeams.find(
        (team) => team.teamID == Number(this.genSer.user.teamID)
      );
      this.subscriptionForm.controls.team.setValue(team);
      this.selfActive = true;
    } else {
      this.subscriptionForm.controls.team.setValue("");
      this.selfActive = false;
    }
  }

  // Prepare Subscription Details
  private get subscriptionDetails() {
    const selectionT =
      this.subscriptionForm.value.taxInclusive === true
        ? "inclusive"
        : this.subscriptionForm.value.tax === "none"
        ? "none"
        : "predefined";
    const selectedClient = this.clients.filter(
      (client) => client.id === this.subscriptionClientId
    );
    // console.log(selectedClient);
    return {
      clientId: this.subscriptionClientId,
      clientMail: selectedClient[0].email,
      clientName:
        Object.keys(this.subscriptionForm.value.clientName).length > 0 &&
        typeof this.subscriptionForm.value.clientName === "object"
          ? this.subscriptionForm.value.clientName.name
          : this.subscriptionForm.value.clientName,
      product: this.getProductDetails,
      createdBy: this.userId,
      orgId: this.orgId,
      description: this.subscriptionForm.value.description,
      frequency: this.subscriptionForm.value.frequency,
      totalCost: this.taxation.amountAftertax,
      taxSelection: selectionT,
      taxAmount: this.taxation.taxAmount, // 2decimal place
      createdOn: this.dateUtil.convertDateStringToTimestamp(
        this.subscriptionForm.value.startDate
      ), // minus 1hr
      endDate: this.calculateDate(
        this.subscriptionForm.value.frequency,
        this.subscriptionForm.value.startDate,
        this.subscriptionForm.value.periodCount
      ),
      isUpfront: this.subscriptionForm.value.isUpfront ? "true" : "false",
      refNumber: this.subscriptionForm.value.refNumber,
      periodCount: this.subscriptionForm.value.periodCount,
      currency: this.subscriptionForm.value.currency,
      teamId: this.subscriptionForm.value.team.teamID
        ? this.subscriptionForm.value.team.teamID
        : undefined,
      organisation: this.org,
      equivalents: this.currencyServ.get_cost_equivalents(
        this.base_currency,
        this.subscriptionForm.value.currency,
        this.taxation.amountAftertax
      ),
    };
  }

  // Calculate EndDate
  private calculateDate(frequency, startDate, periodCount) {
    const start_date_obj = new Date(startDate);
    const startDay = start_date_obj.getDate();
    const startMonth = start_date_obj.getMonth() + 1;
    const startYear = start_date_obj.getFullYear();

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

  // Get Product Name
  private get getProductDetails() {
    return {
      itemName: this.subscriptionForm.value.productName,
      description: this.subscriptionForm.value.description,
      unitPrice: this.subscriptionForm.value.amount,
      quantity: 1,
      tax: this.subscriptionForm.value.tax,
      taxInclusive: this.subscriptionForm.value.taxInclusive
        ? this.subscriptionForm.value.taxInclusive
        : false,
      taxAmount: this.taxation.taxAmount,
      amount: this.taxation.amountAftertax,
    };
  }

  // Get amount After
  private calculateAmountAfterTax() {
    const { amount, tax, taxInclusive } = this.subscriptionForm.value;
    // get Tax Extract
    const taxAmountExtract = Number(
      this.calculateTaxAmount(amount, 1, tax, taxInclusive)
    );
    this.taxation.taxAmount = taxAmountExtract;
    this.taxation.amountAftertax = this.getRowTotal(
      amount,
      1,
      taxAmountExtract,
      taxInclusive
    );
  }

  // Calculate Tax
  private calculateTaxAmount(unitprice, quantity = 1, tax, taxInclusive) {
    if (tax !== "none" && taxInclusive) {
      // Vat and Inclusive
      const totalcost = unitprice * quantity;
      const totalcostPlusRate = totalcost * 100;
      const rate = this.selectedTax + 100;
      const taxAmountBeforeInclusion =
        unitprice * quantity - Number((totalcostPlusRate / rate).toFixed(2));
      // console.log(taxAmountBeforeInclusion.toFixed(2), 'Vat and Inclusive');
      return totalcost - Number(taxAmountBeforeInclusion.toFixed(2));
    } else if (tax !== "none" && !taxInclusive) {
      // Vat and Not Inclusive
      const totalcost = unitprice * quantity;
      const rate = this.selectedTax / 100;
      const taxAmountWithoutInclusion = Number((totalcost * rate).toFixed(2));
      console.log(taxAmountWithoutInclusion, "Vat and Not Inclusive");
      return Number(taxAmountWithoutInclusion);
    } else if (tax === "none") {
      console.log(0, "none");
      return 0;
    }
  }

  // get total amount by row check the inclusive
  private getRowTotal(unitPrice, quantity = 1, taxAmountExtract, taxInclusive) {
    if (taxInclusive) {
      return unitPrice * quantity;
    } else {
      return unitPrice * quantity + Number(taxAmountExtract);
    }
  }

  // Handle Client Selection and Check Client Template
  handleClientSelection() {
    const id = this.subscriptionForm.value.clientName.id;
    this.subscriptionClientId = id;
    this.clientTemplateSet =
      this.subscriptionForm.value.clientName.invoiceTemplateId > 0 &&
      this.subscriptionForm.value.clientName.invoiceTemplateId
        ? true
        : false;
  }

  handleProductSelection() {
    const productName = this.subscriptionForm.value.productName;
    this.productsName.filter((res) => {
      if (res.name === productName) {
        this.description = res.description;
        this.subscriptionForm.value.description = this.description;
      }
    });
  }

  // Create form
  createForm() {
    this.subscriptionForm = this.fb.group({
      clientName: ["", Validators.required],
      frequency: ["", Validators.required],
      productName: ["", Validators.required],
      startDate: ["", Validators.required],
      periodCount: ["", Validators.required],
      description: ["", Validators.required],
      isUpfront: [false],
      refNumber: ["", Validators.required],
      tax: ["", Validators.required],
      taxInclusive: [false],
      currency: ["", Validators.required],
      amount: [0, Validators.required],
      team: [""],
    });
    // Get Currencies
    this.currencyServ.org_currencies.subscribe((org_currencies: any) => {
      if (!this.genSer.checkIfObjectIsEmpty(org_currencies)) {
        this.base_currency = org_currencies.base_currency;
        let result = [];
        let res = this.genSer.convertObjectToArray(org_currencies.currencies);
        res.forEach((res2: any) => {
          result.push(res2.currency_code);
        });
        this.currencies = result;
        this.subscriptionForm.controls.currency.setValue(
          org_currencies.base_currency
        );
      }
    });
  }

  // Select Tax Type
  handleTaxSelection() {
    const { tax } = this.subscriptionForm.value;

    if (tax === "none") {
      this.subscriptionForm.value.taxInclusive = false;
      this.activateTaxInclusive = false;
    } else {
      this.activateTaxInclusive = true;
      this.selectedTax = tax;
    }
    this.handleComputation();
  }

  // Computation of Invoice By Row
  handleComputation() {
    this.calculateAmountAfterTax();
    // console.log(this.getProductDetails, 'productDetails');
  }

  handleSubscriptionCreation() {
    console.log(this.subscriptionDetails, "subscription Send data");
    let validationFields = this.clientTemplateSet
      ? ""
      : "Kindly Set Client Template! ";

    validationFields +=
      this.subscriptionDetails.totalCost < 1
        ? "Subscription value must be greater than Zero! "
        : "";

    validationFields += !this.subscriptionDetails.teamId
      ? "Please select a team! "
      : "";

    if (!validationFields) {
      this.savingSpinner = true;
      this.genSer.sweetAlertFileCreations("Subscription").then((res) => {
        console.log(res, "res sub");
        if (res.value) {
          this.subService
            .registerSubscription(this.subscriptionDetails)
            .subscribe((response) => {
              this.savingSpinner = false;
              console.log(response, "regSub");
              if (response.success) {
                this.genSer.sweetAlertFileCreationSuccess(
                  "Subscription",
                  "/sales/Subscriptions-list"
                );
                this.subscriptionForm.reset();
              }
            });
        }
        this.savingSpinner = false;
      });
    } else {
      this.genSer.sweetAlertFieldValidatio(`${validationFields}`);
    }
  }
}
