import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import { FormArray, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { QuotationProductModel } from "src/app/models/quotationProduct.model";
import { QuotationModel } from "src/app/models/quotation.model";
import { QuotationService } from "src/app/services/quotation.service";
import { GeneralService } from "src/app/services/general.service";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import { ProductServicesService } from "src/app/services/settings-services/product-services.service";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { Store } from "@ngrx/store";
import { AppState } from "src/app/store/app.state";
import { CreateInvoice } from "src/app/store/actions/invoice.actions";
import { ClientService } from "src/app/services/client-services/clients.service";
import { Observable } from "rxjs";
import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { OrganizationModel } from "src/app/models/organization.model";
import { CurrencyService } from "src/app/services/currency.service";
import { InvoiceService } from "src/app/services/invoice.service";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { take } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-create-quote",
  templateUrl: "./create-quote.component.html",
  styleUrls: ["./create-quote.component.css"],
})
export class CreateQuoteComponent implements OnInit {
  config = { ...selectConfig, placeholder: "Select Clients" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  arrayTeams: any;
  team: any;
  dropdownOptions: Observable<any>;
  dealsId;
  dealsTeamId;
  quotesForm: FormGroup;
  isAdvanced = false;
  markupSelectionFlat = [false];
  activateTaxInclusive = [false];
  taxation = [];
  totalQuotationAmountDetails: any;
  selectionMarkup = "20%";
  productDetails: Array<QuotationProductModel> = [];
  productsName = [];
  loadingView = false;
  description = [];
  refNumber = "";
  selectedClientName: any;
  selectedClientId;
  clientDropdownOptions: Observable<any>;
  clientsDetailArray = [];
  disableClientDropDown = false;
  orgId;
  org: OrgModel;
  clientTemplateSet = false;
  currencyIdAttribute = "ngx-select-resize";
  taxList$ = this.signupSrv.getAllTaxes();
  selectedTax = 0;

  selectedCurrency;
  currencies: any;
  baseCurr;
  userId;

  savingSpinner = false;
  uploadedProduct;
  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please add a company and try again",
      action: "Add Company",
      success: true,
    },
    showSpinner: false,
    btnSpinner: false,
    importSpinner: false,
    export: false,
  };
  selfActive = false;

  constructor(
    private fb: FormBuilder,
    private quoteSer: QuotationService,
    private genSer: GeneralService,
    private productService: ProductServicesService,
    private clientServ: ClientService,
    private currencyServ: CurrencyService,
    private companyServ: CompaniesService,
    private toastr: ToastrService,
    private localStorage: LocalStorageService,
    private invoiceSer: InvoiceService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private signupSrv: SignupLoginService
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.loadingView = true;

    // Apply CSS when Print button is activated for Page
    this.genSer.printActivated.subscribe((res) =>
      res
        ? (this.currencyIdAttribute = "ngx-select-print")
        : (this.currencyIdAttribute = "ngx-select-resize")
    );

    this.signupSrv.getAllTaxes().subscribe((res) => console.log(res, "taes"));
    // Get Clients
    this.clientServ.getAllClients().subscribe(
      (res: any) => {
        if (res) {
          // this.generateRandomRefNumber();
          res.map((res2: any) => {
            this.clientsDetailArray.push({
              id: res2.id,
              name: res2.name,
              quotationTemplateId: res2.quotationTemplateId,
            });
          });

          this.clientDropdownOptions = new Observable((observer) => {
            observer.next(this.clientsDetailArray);
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

    this.quotesForm = this.fb.group({
      quotesFormArray: this.fb.array([]),
    });
  }

  ngOnInit() {
    // Create Table/Form dependent if data is copied or not
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
      if (res.session_id === "clientNavigation") {
        this.createForm();
        this.selectedClientName = res.client_name;
        this.selectedClientId = res.client_id;
        this.disableClientDropDown = true;

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
      } else {
        const copies = JSON.parse(
          this.localStorage.getFromLocalStorage(`copiedQuote_${res.session_id}`)
        );
        console.log(copies, "copy from");
        if (copies === null || copies === undefined) {
          this.createForm();
        } else {
          const { selectedQuote } = copies;
          switch (res.session_location) {
            case "quotationListView":
              let extractProducts = selectedQuote[0].products;
              this.selectedClientName = copies.clientName;
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

              this.selfActive =
                Number(this.genSer.user.teamID) === selectedQuote[0].teamId
                  ? true
                  : false;
              this.companyServ.getSalespersonTeams().subscribe((res: any) => {
                if (res) {
                  res.forEach((element) => {
                    if (element.teamID == selectedQuote[0].teamId) {
                      this.team = element;
                    }
                  });
                }
              });

              this.refNumber = selectedQuote[0].refNumber;
              this.selectedCurrency = selectedQuote[0].currency;

              console.log(extractProducts, "copies to quote");
              extractProducts =
                typeof extractProducts === "string"
                  ? JSON.parse(extractProducts)
                  : extractProducts;
              this.isAdvanced =
                extractProducts[0].purchasePrice !== 0 ? true : false;
              extractProducts.forEach((element) => {
                element =
                  typeof element === "string" ? JSON.parse(element) : element;
                this.copyQuote(element);
              });
              this.localStorage.deleteFromLocalStorage(
                `copiedQuote_${res.session_id}`
              );
              break;
          }
        }
      }
    });
    this.getSalespersonTeams();
  }

  // Get getSalespersonTeams
  private getSalespersonTeams() {
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      this.arrayTeams = res;
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
        const team = res.find(
          (team) => team.teamID == Number(this.genSer.user.teamID)
        );
        this.team = team;
      });
      this.selfActive = true;
    } else {
      this.team = [];
      this.selfActive = false;
    }
  }

  private copyQuote(data) {
    this.quotesFormArray.push(
      this.fb.group({
        itemName: [data.itemName, Validators.required],
        description: [data.description],
        purchasePrice: [data.purchasePrice, Validators.required],
        markUp: [data.markUp, Validators.required],
        markUpType: [data.markUpType, Validators.required],
        margin: [data.margin, Validators.required],
        unitPrice: [data.unitPrice, Validators.required],
        quantity: [data.quantity, Validators.required],
        tax: [data.tax, Validators.required],
        taxInclusive: [data.taxInclusive, Validators.required],
      })
    );

    this.taxation.push({
      unitPrice: data.unitPrice,
      taxInclusive: data.taxInclusive,
      amountBeforeTax: data.unitPrice * data.quantity,
      taxAmount: data.taxAmount,
      amountAfterTax: data.amount,
      purchasePrice: data.purchasePrice,
      markUp: data.markUp,
      markUpType: data.markUpType,
      margin: data.margin,
    });
    this.description.push(data.description);
    this.handleTotalAmountComputation();
  }

  get quotesFormArray(): FormArray {
    return this.quotesForm.get("quotesFormArray") as FormArray;
  }

  // Prepare Quotation Details
  private get quotationDetails(): QuotationModel {
    const now = new Date().toISOString();
    return {
      clientId: this.selectedClientId,
      clientName:
        Object.keys(this.selectedClientName).length > 0 &&
        typeof this.selectedClientName === "object"
          ? this.selectedClientName.name
          : this.selectedClientName,
      products: this.getProductDetails,
      createdBy: this.userId,
      orgId: this.orgId,
      totalCost: this.totalQuotationAmountDetails.amountAfterTax,
      currency: this.selectedCurrency,
      createdOn: Date.parse(now),
      subtotalCost: this.totalQuotationAmountDetails.amountBeforeTax,
      taxAmount: this.totalQuotationAmountDetails.taxAmount,
      refNumber: this.refNumber,
      dealId: 0,
      teamId: Number(this.team.teamID),
      organisation: this.org,
    };
  }

  // Get Product Info
  private get getProductDetails() {
    const returnProduct = this.quotesFormArray.value.map((element, i) => {
      console.log(element.description, "tais", this.description[i]);

      const taxInclusiveCheck = this.taxation[i].taxInclusive
        ? this.taxation[i].taxInclusive
        : element.taxInclusive;
      return {
        itemName: element.itemName,
        description: element.description
          ? element.description
          : this.description[i],
        unitPrice: element.unitPrice
          ? element.unitPrice
          : this.taxation[i].unitPrice,
        quantity: element.quantity,
        tax: element.tax,
        taxInclusive: taxInclusiveCheck ? taxInclusiveCheck : false,
        taxAmount: this.taxation[i].taxAmount,
        amount: this.taxation[i].amountAfterTax,
        purchasePrice: this.taxation[i].purchasePrice
          ? this.taxation[i].purchasePrice
          : 0,
        markUpType: this.taxation[i].markUpType
          ? this.taxation[i].markUpType
          : "none",
        markUp: this.taxation[i].markUp ? this.taxation[i].markUp : 0,
        margin: this.taxation[i].margin ? this.taxation[i].margin : 0,
      };
    });
    return returnProduct;
  }

  private getCalculateAmountAfterTax(index) {
    const {
      unitPrice,
      quantity,
      purchasePrice,
      markUp,
      tax,
      taxInclusive,
      markUpType,
    } = this.quotesFormArray.value[index];
    if (!this.isAdvanced) {
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
    } else {
      if (markUpType === "flat") {
        const markUpTest = markUp || 0;
        const unitpriceFromPurchase = purchasePrice + markUpTest;

        this.quotesFormArray.value[index].unitPrice = unitpriceFromPurchase;
        this.quotesFormArray.value[index].margin = markUp * quantity;

        console.log(markUpTest, "testone");

        const taxAmountExtract = Number(
          this.calculateTaxAmount(
            unitpriceFromPurchase,
            quantity,
            tax,
            taxInclusive
          )
        );

        const amt = this.getRowTotal(
          unitpriceFromPurchase,
          quantity,
          taxAmountExtract,
          taxInclusive
        );

        this.taxation[index] = {
          unitPrice: unitpriceFromPurchase,
          purchasePrice,
          markUpType,
          markUp,
          margin: markUp * quantity,
          amountBeforeTax: unitpriceFromPurchase * quantity,
          taxAmount: taxAmountExtract,
          amountAfterTax: amt,
        };
      } else if (markUpType === "percent") {
        const amount = (purchasePrice * markUp) / 100;
        const unitpriceFromPurchase = amount + purchasePrice;
        console.log(unitpriceFromPurchase, "testtwo");

        this.quotesFormArray.value[index].unitPrice = unitpriceFromPurchase;
        this.quotesFormArray.value[index].margin = amount * quantity;

        const taxAmountExtract = Number(
          this.calculateTaxAmount(
            unitpriceFromPurchase,
            quantity,
            tax,
            taxInclusive
          )
        );
        const amt = this.getRowTotal(
          unitpriceFromPurchase,
          quantity,
          taxAmountExtract,
          taxInclusive
        );

        this.taxation[index] = {
          unitPrice: unitpriceFromPurchase,
          purchasePrice,
          markUpType,
          markUp,
          margin: amount * quantity,
          amountBeforeTax: unitpriceFromPurchase * quantity,
          taxAmount: taxAmountExtract,
          amountAfterTax: amt,
        };
        return amt;
      } else {
        const unitpriceFromPurchase = purchasePrice;
        console.log(unitpriceFromPurchase, "testtwo");

        this.quotesFormArray.value[index].unitPrice = unitpriceFromPurchase;

        const taxAmountExtract = Number(
          this.calculateTaxAmount(
            unitpriceFromPurchase,
            quantity,
            tax,
            taxInclusive
          )
        );
        const amt = this.getRowTotal(
          unitpriceFromPurchase,
          quantity,
          taxAmountExtract,
          taxInclusive
        );

        this.taxation[index] = {
          unitPrice: unitpriceFromPurchase,
          purchasePrice,
          markUpType,
          markUp,
          amountBeforeTax: unitpriceFromPurchase * quantity,
          taxAmount: taxAmountExtract,
          amountAfterTax: amt,
        };
        // return amt;
      }
    }
  }

  private calculateTaxAmount(unitprice, quantity, tax, taxInclusive) {
    if (tax !== "none" && taxInclusive) {
      // Vat and Inclusive
      const totalcost = unitprice * quantity;
      const totalcostPlusRate = totalcost * 100;
      const rate = this.selectedTax + 100;
      const taxAmountBeforeInclusion =
        unitprice * quantity - Number((totalcostPlusRate / rate).toFixed(2));
      // console.log(taxAmountBeforeInclusion.toFixed(2), 'Vat and Inclusive');
      return Number(taxAmountBeforeInclusion).toFixed(2);
    } else if (tax !== "none" && !taxInclusive) {
      // Vat and Not Inclusive
      const totalcost = unitprice * quantity;
      const rate = this.selectedTax / 100;
      const taxAmountWithoutInclusion = Number((totalcost * rate).toFixed(2));
      // console.log(taxAmountWithoutInclusion, 'Vat and Not Inclusive');
      return Number(taxAmountWithoutInclusion);
    } else if (tax === "none") {
      // console.log(0, 'none');
      return 0;
    }
  }

  private getRowTotal(unitPrice, quantity, taxAmountExtract, taxInclusive) {
    // console.log(taxInclusive, 'inclusivity');
    if (taxInclusive) {
      return unitPrice * quantity;
    } else {
      return unitPrice * quantity + Number(taxAmountExtract);
    }
  }

  // Reset Field After Invoice Creation
  private clearContent() {
    this.selectedClientName = "";
    this.selectedCurrency = this.baseCurr;
    this.team = "";
    this.refNumber = "";
    this.description = [];
    this.taxation = [];
    this.totalQuotationAmountDetails = {};
    this.quotesForm = this.fb.group({
      quotesFormArray: this.fb.array([]),
    });
    this.createForm();
  }

  // Handle product Selection
  handleProductSelection(index) {
    const itemName = this.quotesFormArray.value[index].itemName;
    this.productsName.filter((res) => {
      if (res.name === itemName) {
        this.description[index] = res.description;
        this.quotesFormArray.controls[index]
          .get("description")
          .setValue(res.description);
      }
    });
  }

  // Handle Client Selection and Check Client Template
  handleClientSelection() {
    this.selectedClientId = this.selectedClientName.id;
    console.log(this.selectedClientName, "lofjd");
    this.clientTemplateSet =
      this.selectedClientName.quotationTemplateId > 0 &&
      this.selectedClientName.quotationTemplateId
        ? true
        : false;
    // this.getClientTemplate(this.selectedClientId);
  }

  // Select Markup Selection By Row
  handleMarkSelection(index) {
    const { markUpType } = this.quotesFormArray.value[index];
    this.selectionMarkup = markUpType;
    markUpType === "flat"
      ? (this.markupSelectionFlat[index] = true)
      : (this.markupSelectionFlat[index] = false);
  }

  handleTaxSelection(index) {
    const { tax } = this.quotesFormArray.value[index];
    // let taxNameParse = tax === "none" ? "none" : JSON.parse(tax).rate;
    if (tax === "none") {
      this.taxation[index].taxInclusive = false;
      this.quotesFormArray.value[index].taxInclusive = false;
      this.activateTaxInclusive[index] = false;
    } else {
      this.activateTaxInclusive[index] = true;
      this.selectedTax = tax;
    }
    this.handleComputation(index);
  }

  // Initiate a form field
  createForm() {
    this.quotesFormArray.push(
      this.fb.group({
        itemName: [""],
        description: [""],
        purchasePrice: [0, Validators.required],
        markUp: [0, Validators.required],
        markUpType: [""],
        unitPrice: [0, Validators.required],
        quantity: [0, Validators.required],
        margin: [0, Validators.required],
        tax: ["none", Validators.required],
        taxInclusive: [false],
      })
    );

    this.taxation.push({
      unitPrice: this.quotesFormArray.value[0].unitPrice,
      taxInclusive: this.quotesFormArray.value[0].taxInclusive,
      amountBeforeTax: 0,
      taxAmount: 0,
      amountAfterTax: 0,
      margin: 0,
    });
    this.description.push("");
    this.handleTotalAmountComputation();
  }

  // Add a form field for quotes
  addQuote() {
    this.quotesFormArray.push(
      this.fb.group({
        itemName: [""],
        description: [""],
        purchasePrice: [0, Validators.required],
        markUp: [0, Validators.required],
        markUpType: [""],
        unitPrice: [0, Validators.required],
        quantity: [0, Validators.required],
        margin: [0, Validators.required],
        tax: ["none", Validators.required],
        taxInclusive: [false],
      })
    );

    const index = this.quotesFormArray.length - 1;
    this.taxation.push({
      unitPrice: this.quotesFormArray.value[index].unitPrice,
      taxInclusive: this.quotesFormArray.value[index].taxInclusive,
      amountBeforeTax: 0,
      taxAmount: 0,
      amountAfterTax: 0,
      margin: 0,
    });
    this.description.push("");
    this.handleTotalAmountComputation();
    // Add markup, taxselction and inclusive status by row
    this.markupSelectionFlat.push(false);
    this.activateTaxInclusive.push(false);
  }

  // Remove a form field for quotes
  deleteQuote(index: number) {
    this.quotesFormArray.removeAt(index);
    this.taxation.splice(index, 1);
    this.handleTotalAmountComputation();
  }

  // Computation of Quotation By Row
  handleComputation(index) {
    this.getCalculateAmountAfterTax(index);
    this.handleTotalAmountComputation();
  }

  // Computation of Total Quotation
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
      totalMarkup: this.taxation.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.margin);
      }, initialValue),
    };
    if (
      Number(result.amountBeforeTax) + Number(result.taxAmount) !==
      Number(result.amountAfterTax)
    ) {
      // console.log(result, 'test');
      result.amountBeforeTax =
        Number(result.amountAfterTax) - Number(result.taxAmount);
      this.totalQuotationAmountDetails = result;
    } else {
      this.totalQuotationAmountDetails = result;
    }
  }

  // Copy to
  handleCopyTo(type) {
    const copy = [
      {
        clientName: this.selectedClientName,
        currency: this.selectedCurrency,
        clientId: this.selectedClientId,
        refNumber: this.refNumber,
        team: this.team,
      },
      ...this.getProductDetails,
    ];
    if (type === "Invoice") {
      const invoiceId = Math.random().toString(36).substring(7);
      this.genSer
        .sweetAlertFileCreations("Copy To Invoice")
        .then((response) => {
          if (response.value) {
            this.localStorage
              .saveToLocalStorage(`copiedInvoice_${invoiceId}`, copy)
              .subscribe((res) => {
                if (res) {
                  // Create a dummy session id
                  const sessionName = invoiceId;

                  // Set our navigation extras object
                  // that contains our global query params and fragment
                  const navigationExtras: NavigationExtras = {
                    queryParams: {
                      session_id: sessionName,
                      session_location: "quotationCreateView",
                    },
                    fragment: "redirect",
                  };

                  this.router.navigate(
                    ["/sales/create-invoice"],
                    navigationExtras
                  );
                }
              });
          }
        });
    } else {
      const copy = [
        {
          clientName: this.selectedClientName,
          currency: this.selectedCurrency,
          clientId: this.selectedClientId,
          refNumber: this.refNumber,
          team: this.team.team.teamID,
        },
        ...this.getProductDetails,
      ];

      const salesorderId = Math.random().toString(36).substring(7);
      this.genSer
        .sweetAlertFileCreations("Copy To Sales Order")
        .then((response) => {
          if (response.value) {
            this.localStorage
              .saveToLocalStorage(`copiedSaleOrder_${salesorderId}`, copy)
              .subscribe((res) => {
                if (res) {
                  // Create a dummy session id
                  const sessionName = salesorderId;

                  // Set our navigation extras object
                  // that contains our global query params and fragment
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
        });
    }
  }

  // Handle Save
  handleQuotationCreation() {
    console.log(this.quotationDetails, "qulo");
    // For validation for the header form fields
    let validationFields = this.refNumber ? "" : `Reference Field is Empty! `;
    validationFields += this.clientTemplateSet
      ? ""
      : "Kindly Set Client Template! ";
    validationFields += this.team.teamID ? "" : "Kindly Set Team! ";

    validationFields +=
      this.totalQuotationAmountDetails.amountAfterTax < 1
        ? "Amount can not be in the negative or Zero! "
        : "";

    validationFields +=
      (this.selectedClientName.name !== undefined &&
        typeof this.selectedClientName === "object") ||
      (this.selectedClientName && typeof this.selectedClientName === "string")
        ? ""
        : "Client Field is Empty! ";

    // check if product is valid
    validationFields += this.quotesFormArray.valid
      ? ""
      : "Fill all asterick(*) items! ";

    if (!validationFields) {
      this.savingSpinner = true;
      let payload = {
        ...this.quotationDetails,
        equivalents: this.currencyServ.get_cost_equivalents(
          this.baseCurr,
          this.selectedCurrency,
          this.quotationDetails.totalCost
        ),
      };

      payload = this.dealsId ? { ...payload, dealId: this.dealsId } : payload;
      this.genSer.sweetAlertFileCreations("Quotation").then((response) => {
        if (response.value) {
          this.quoteSer.createQuotation(payload).subscribe(
            (res) => {
              this.savingSpinner = false;
              if (res) {
                console.log(res, "response");
                this.genSer.sweetAlertFileCreationSuccess(
                  "Quotation",
                  `/sales/edit-quotation/${res.payload.id}`
                );
                this.clearContent();
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

  async onImportProduct(files) {
    console.log(files, "file");
    this.loader.importSpinner = true;
    //if isFile
    if (files.length > 0) {
      let file: File = files.item(0);
      let formData = new FormData();
      let newFile = new File([file], file.name, { type: "text/csv" });
      formData.append("products", newFile);

      this.invoiceSer.uploadProducts(formData).subscribe(
        async (res) => {
          if (res !== null) {
            const { payload } = res;
            this.handleImportedProducts(payload);

            this.toastr.success("File import successfully!", "Import Success");
            $("#importCompany").click();
          } else {
            this.toastr.error(
              "Error importing quotation. Please try again!",
              "Import Error"
            );
          }
        },
        (err) => {
          console.log(err, "err import");
          this.toastr.error(err.message, "Error Occurred!");
        }
      );
    }
  }

  handleImportedProducts(products) {
    this.deleteQuote(0);
    this.description = [];
    let newProdArr = products.map((res) => {
      return {
        itemName: "",
        description: res.description,
        purchasePrice: Number(res.purchasePrice),
        markUp: Number(res.margin),
        markUpType: res.marginType,
        margin: Number(res.markUp),
        unitPrice: Number(res.unitPrice),
        quantity: Number(res.quantity),
        tax: "none",
        taxInclusive: false,
        taxAmount: 0,
        amount: Number(res.amount),
      };
    });

    newProdArr.forEach((item) => {
      this.quotesFormArray.push(this.fb.group(item));
      item.tax === "none"
        ? this.activateTaxInclusive.push(false)
        : this.activateTaxInclusive.push(true);
      this.description.push(item.description);

      this.taxation.push({
        unitPrice: item.unitPrice,
        purchasePrice: item.purchasePrice,
        markUpType: item.markUpType,
        markUp: item.margin,
        margin: item.markUp,
        amountBeforeTax: item.purchasePrice || item.unitPrice,
        taxAmount: 0,
        taxInclusive: false,
        amountAfterTax: item.amount,
      });
    });
    this.handleTotalAmountComputation();
  }
}
