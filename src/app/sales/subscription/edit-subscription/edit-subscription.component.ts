import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
} from "@angular/core";
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
import { ActivatedRoute, Params } from "@angular/router";
import * as $ from "jquery";
import { InvoiceService } from "src/app/services/invoice.service";
import { Observable, Observer } from "rxjs";
import { isArray } from "util";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { selectConfig } from "src/app/utils/utils";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { CurrencyService } from "src/app/services/currency.service";
import { CurrencyPipe } from "@angular/common";
import { SignupLoginService } from "src/app/services/signupLogin.service";

@Component({
  selector: "app-edit-subscription",
  templateUrl: "./edit-subscription.component.html",
  styleUrls: ["./edit-subscription.component.css"],
})
export class EditSubscriptionComponent implements OnInit {
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };
  arrayTeams: any;
  subscriptionForm: FormGroup;
  descriptionForm: FormGroup;
  loadingView = false;
  dropdownOptions: Observable<any>;
  frequencies: Array<any> = SUBSCRIPTIONFREQUENCY;
  months: Array<string> = MONTHS;
  restricDate = new Date().toISOString().slice(0, 10);
  restricDateTYP = new Date();
  productsName = [];
  clients = [];
  subscriptionClientId;
  createdDate: string;
  subId: number;
  dataSource: Observable<[]>;
  todayDate = new Date();
  description;
  activateTaxInclusive;
  invoiceId;
  taxation = {
    taxAmount: 0,
    amountAftertax: 0,
  };
  refNumber;
  disableUpfront = false;
  disableStartDate = false;
  orgId;
  org: OrgModel;
  formattedAmount;
  formattedAmountAT;
  fullPayloadSub: any;
  taxList$ = this.signupSrv.getAllTaxes();
  selectedTax = 0;

  currencies: any;
  selectedCurrency;
  userId;

  savingSpinner = false;
  selfActive = false;

  constructor(
    private fb: FormBuilder,
    private subService: SubscriptionService,
    private productService: ProductServicesService,
    private invoiceService: InvoiceService,
    private companyServ: CompaniesService,
    private genSer: GeneralService,
    private currencyServ: CurrencyService,
    private currencyPipe: CurrencyPipe,
    private signupSrv: SignupLoginService,
    private route: ActivatedRoute,
    store: Store<AppState>
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.subscriptionForm = this.fb.group({});
    this.loadingView = true;
    this.route.params.subscribe((par: Params) => {
      const { id } = par;
      if (id) {
        console.log("id", id);
        this.handleSingleSubscription(id);
      }
    });

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
        }
      },
      (error) => {
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
      }
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.loadingView = false;
    }, 1200);
  }

  private handleSingleSubscription(id) {
    this.subService.getOneSubscription(id).subscribe((res) => {
      if (res) {
        const { payload } = res;
        console.log(payload, "payload");
        this.fullPayloadSub = payload;
        this.subId = payload.id;
        this.createdDate = new Date(payload.createdOn + 3600000)
          .toISOString()
          .slice(0, 10);
        const product = isArray(payload.product)
          ? payload.product[0]
          : typeof payload.product === "string"
          ? JSON.parse(payload.product)
          : payload.product;
        this.taxation.taxAmount = product.taxAmount;
        this.taxation.amountAftertax = product.amount;
        this.subscriptionClientId = payload.clientId;
        this.description = payload.description;
        this.refNumber = payload.refNumber;
        this.selectedCurrency = payload.currency;
        this.formattedAmount = payload.totalCost;
        this.formattedAmountAT = product.amount;

        this.subscriptionForm = this.fb.group({
          clientName: [payload.clientName, Validators.required],
          frequency: [payload.frequency, Validators.required],
          productName: [product.itemName, Validators.required],
          startDate: [new Date(this.createdDate), Validators.required],
          amount: [product.unitPrice, Validators.required],
          description: [payload.description, Validators.required],
          isUpfront: [JSON.parse(payload.isUpfront), Validators.required],
          tax: [product.tax, Validators.required],
          refNumber: [payload.refNumber, Validators.required],
          periodCount: [payload.periodCount, Validators.required],
          taxInclusive: [product.taxInclusive, Validators.required],
          taxAmount: [product.taxAmount, Validators.required],
          team: [""],
          currency: [payload.currency, Validators.required],
        });

        product.tax !== "none"
          ? (this.activateTaxInclusive = true)
          : (this.activateTaxInclusive = false);

        this.getSalespersonTeams(payload.teamId);
        this.transformAmount("Amount-Onload");

        //   // Load Invoice
        let id = Number(payload.id.split("-")[2]);
        this.getInvoiceDetails(this.subscriptionClientId, id);
      }
    });
  }

  // Get getSalespersonTeams
  private getSalespersonTeams(teamId: number) {
    this.selfActive = Number(this.genSer.user.teamID) === teamId ? true : false;
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      this.arrayTeams = res;
      let team = res.filter((team) => team.teamID === teamId);
      this.subscriptionForm.controls.team.setValue(team);
    });
  }

  handleSelf(event) {
    if (event.target.checked) {
      let team = this.arrayTeams.filter(
        (team) => team.teamID === Number(this.genSer.user.teamID)
      );
      this.subscriptionForm.controls.team.setValue(team);
      this.selfActive = true;
    } else {
      this.subscriptionForm.controls.team.setValue("");
      this.selfActive = false;
    }
  }

  // Get Related Invoices
  private getInvoiceDetails(clientId, subscriptionId) {
    subscriptionId =
      subscriptionId.length > 4
        ? parseInt(subscriptionId.slice(4))
        : parseInt(subscriptionId);
    this.invoiceService
      .getInvoiceByFilter(
        `clientId=${clientId}&subscriptionId=${subscriptionId}` // &isUpfront='true'&createdOn=dueDate
      )
      .subscribe((res3: any) => {
        console.log(res3, "godkl");

        this.dataSource = new Observable((observer) => {
          observer.next(res3.payload);
        });
        res3.payload.length !== 0
          ? (this.invoiceId = res3.payload[0].id)
          : undefined;
      });
  }

  // Prepare Subscription Details
  private get subscriptionDetails() {
    const selectionT =
      this.subscriptionForm.value.taxInclusive === true
        ? "inclusive"
        : this.subscriptionForm.value.tax === "none"
        ? "none"
        : "predefined";
    return {
      id: this.subId,
      invoiceId: this.invoiceId,
      clientId: this.subscriptionClientId,
      product: JSON.stringify(this.getProductDetails),
      createdBy: this.userId,
      orgId: this.orgId,
      description: this.subscriptionForm.value.description,
      frequency: this.subscriptionForm.value.frequency,
      totalCost: this.taxation.amountAftertax,
      taxSelection: selectionT,
      taxAmount: this.taxation.taxAmount, // 2decimal place
      createdOn: Date.parse(this.subscriptionForm.value.startDate),
      endDate: this.calculateDate(
        this.subscriptionForm.value.frequency,
        this.subscriptionForm.value.startDate.toISOString().slice(0, 10),
        this.subscriptionForm.value.periodCount
      ),
      isUpfront: this.subscriptionForm.value.isUpfront.toString(),
      refNumber: this.subscriptionForm.value.refNumber,
      periodCount: this.subscriptionForm.value.periodCount,
      currency: this.subscriptionForm.value.currency,
      teamId: this.subscriptionForm.value.team.teamID
        ? this.subscriptionForm.value.team.teamID
        : undefined,
      organisation: this.org,
    };
  }

  // Calculate EndDate
  private calculateDate(frequency, startDate, periodCount) {
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

  // Get Product details
  private get getProductDetails() {
    return {
      itemName: this.subscriptionForm.value.productName,
      description: this.subscriptionForm.value.description,
      unitPrice: this.subscriptionForm.value.amount,
      quantity: 1,
      tax: this.subscriptionForm.value.tax,
      taxInclusive: this.subscriptionForm.value.taxInclusive,
      taxAmount: this.taxation.taxAmount,
      amount: this.taxation.amountAftertax,
    };
  }

  onKeyUp() {
    //  this.formatCurrency(value, '');

    $("input[data-type='currency']").on({
      keyup: function () {
        console.log("wokring");
        formatCurrency($(this), "");
      },
    });

    function formatNumber(n) {
      // format number 1000000 to 1,234,567
      return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function formatCurrency(input, blur) {
      // appends $ to value, validates decimal side
      // and puts cursor back in right position.

      // get input value
      var input_val = input.val();

      // don't validate empty input
      if (input_val === "") {
        return;
      }

      // original length
      var original_len = input_val.length;

      // initial caret position
      var caret_pos = input.prop("selectionStart");

      // check for decimal
      if (input_val.indexOf(".") >= 0) {
        // get position of first decimal
        // this prevents multiple decimals from
        // being entered
        var decimal_pos = input_val.indexOf(".");

        // split number by decimal point
        var left_side = input_val.substring(0, decimal_pos);
        var right_side = input_val.substring(decimal_pos);

        // add commas to left side of number
        left_side = formatNumber(left_side);

        // validate right side
        right_side = formatNumber(right_side);

        // On blur make sure 2 numbers after decimal
        if (blur === "blur") {
          right_side += "00";
        }

        // Limit decimal to only 2 digits
        right_side = right_side.substring(0, 2);

        // join number by .
        input_val = left_side + "." + right_side;
      } else {
        // no decimal entered
        // add commas to number
        // remove all non-digits
        input_val = formatNumber(input_val);
        input_val = input_val;

        // final formatting
        if (blur === "blur") {
          input_val += ".00";
        }
      }

      // send updated string to input
      input.val(input_val);

      // put caret back in the right position
      var updated_len = input_val.length;
      caret_pos = updated_len - original_len + caret_pos;
      input[0].setSelectionRange(caret_pos, caret_pos);
    }
  }

  transformAmount(type) {
    switch (true) {
      case type === "Amount-Onload":
        let result = this.currencyPipe.transform(
          this.formattedAmount,
          `${this.selectedCurrency} `
        );
        this.formattedAmount = result;

        break;

      case type === "Edit":
        this.formattedAmount = this.fullPayloadSub.totalCost;

        break;

      case type === "amountAT":
        break;
    }

    //  this.formattedAmount = this.currencyPipe.transform(
    //    this.formattedAmount,
    //    "$"
    //  );

    //  element.target.value = this.formattedAmount;
  }

  // Handle Client Selection
  handleClientSelection() {
    const arr = this.subscriptionForm.value.clientName.split(" ");
    const id = arr[arr.length - 1];
    this.subscriptionClientId = id;
  }

  // Handle Product Selection
  handleProductSelection() {
    const productName = this.subscriptionForm.value.productName;
    this.productsName.filter((res) => {
      if (res.name === productName) {
        this.description = res.description;
        this.subscriptionForm.value.description = this.description;
      }
    });
    console.log();
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

  handleSubscriptionUpdate() {
    console.log(this.subscriptionDetails, "subscription Send data");
    let validationFields =
      this.subscriptionDetails.totalCost < 1
        ? `Subscription value must be greater than Zero !`
        : "";
    validationFields += !this.subscriptionDetails.teamId
      ? "Please select a team! "
      : "";
    if (!validationFields) {
      this.savingSpinner = true;
      this.genSer.sweetAlertFileUpdates("Subscription").then((res) => {
        if (res.value) {
          this.subService
            .updateSubscription(this.subscriptionDetails)
            .subscribe((response) => {
              this.savingSpinner = false;
              console.log(response, "regSub");
              if (response) {
                this.genSer.sweetAlertFileUpdateSuccess(
                  "Subscription",
                  "/sales/Subscriptions-list"
                );
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
