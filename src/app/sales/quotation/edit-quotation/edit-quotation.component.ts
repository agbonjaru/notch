import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormArray, Validators } from "@angular/forms";
import { QuotationService } from "src/app/services/quotation.service";
import { GeneralService } from "src/app/services/general.service";
import { ProductServicesService } from "src/app/services/settings-services/product-services.service";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import {
  Router,
  ActivatedRoute,
  NavigationExtras,
  Params,
} from "@angular/router";
import * as $ from "jquery";
import { QuotationProductModel } from "src/app/models/quotationProduct.model";
import { Observable } from "rxjs";
import { ClientService } from "src/app/services/client-services/clients.service";

import { selectConfig } from "src/app/utils/utils";
import { CompaniesService } from "src/app/services/client-services/companies.service";
import { OrgModel } from "src/app/store/storeModels/user.model";
import { CurrencyService } from "src/app/services/currency.service";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { EmailService } from "src/app/services/integrations/email/email.service";

@Component({
  selector: "app-edit-quotation",
  templateUrl: "./edit-quotation.component.html",
  styleUrls: ["./edit-quotation.component.css"],
})
export class EditQuotationComponent implements OnInit {
  teamConfig = { ...selectConfig, displayKey: "teamName" };
  currencyConfig = { ...selectConfig, placeholder: "Select Currency" };
  arrayTeams: any;
  team: string;
  quotesForm: FormGroup;
  sendQuoteForm: FormGroup;
  teamForm: FormGroup;
  isAdvanced = false;
  markupSelectionFlat = [false];
  activateTaxInclusive = [];
  taxation = [];
  totalQuotationAmountDetails: any;
  selectionMarkup = "20%";
  productDetails: Array<QuotationProductModel> = [];
  productsName = [];
  loadingView = false;
  description = [];
  refNumber = "";
  quoteId;
  selectedClientName = "none";
  selectedClientId;
  clientDropdownOptions: Observable<any>;
  selectedClientsDetails: any;
  orgId;
  org: OrgModel;
  userId;
  completedQuote: any;
  currencyIdAttribute = "ngx-select-resize";
  taxList$ = this.signupSrv.getAllTaxes();
  selectedTax = 0;
  loading = false;

  currencies: any;
  selectedCurrency;

  savingSpinner = false;
  taxes = [];
  selfActive = false;

  constructor(
    private fb: FormBuilder,
    private quoteSer: QuotationService,
    private genSer: GeneralService,
    private productService: ProductServicesService,
    private clientServ: ClientService,
    private currencyServ: CurrencyService,
    private companyServ: CompaniesService,
    private localStorage: LocalStorageService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private signupSrv: SignupLoginService,
    private emailService: EmailService
  ) {
    this.orgId = this.genSer.org.id;
    this.org = this.genSer.org;
    this.userId = this.genSer.user.id;

    this.quotesForm = this.fb.group({
      quotesFormArray: this.fb.array([]),
    });

    this.teamForm = this.fb.group({
      team: [""],
    });

    this.loadingView = true;
    // Apply CSS when Print button is activated for Page
    this.genSer.printActivated.subscribe((res) =>
      res
        ? (this.currencyIdAttribute = "ngx-select-print")
        : (this.currencyIdAttribute = "ngx-select-resize")
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
    this.activeRoute.params.subscribe((par: Params) => {
      // Get Subscription By Id
      this.quoteSer.getOneQuotation(par.id).subscribe((res) => {
        if (res) {
          const { payload } = res;
          this.completedQuote = payload;
          this.quoteId = payload.id;
          this.refNumber = payload.refNumber;
          this.selectedClientId = payload.clientId;

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

          this.selectedClientName = payload.clientName;
          this.selectedCurrency = payload.currency;
          // console.log(payload.currency, "payload.currency");
          console.log(payload, "payload");
          const product = payload.products;
          console.log(product, "product");
          this.isAdvanced = product[0].purchasePrice !== 0 ? true : false;
          product.forEach((element) => {
            this.quotesFormArray.push(
              this.fb.group({
                itemName: [element.itemName],
                description: [element.description, Validators.required],
                purchasePrice: [element.purchasePrice, Validators.required],
                markUp: [element.markUp, Validators.required],
                margin: [element.margin, Validators.required],
                markUpType: [element.markUpType],
                unitPrice: [element.unitPrice, Validators.required],
                quantity: [element.quantity, Validators.required],
                tax: [element.tax, Validators.required],
                taxInclusive: [element.taxInclusive],
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
              purchasePrice: element.purchasePrice,
              markUpType: element.markUpType,
              markUp: element.markUp,
              margin: element.margin,
              amountBeforeTax: element.amountBeforeTax,
              taxAmount: element.taxAmount,
              taxInclusive: element.taxInclusive,
              amountAfterTax: element.amount,
            });
          });

          this.getSalespersonTeams(payload.teamId);
          this.handleTotalAmountComputation();
        }
      });
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
          this.loadingView = false;
        }
      },
      (error) => {
        this.loadingView = false;
        console.log(error, "error on getting product");
      }
    );
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.teamForm.controls;
  }

  // Get getSalespersonTeams
  private getSalespersonTeams(teamId: number) {
    this.selfActive = Number(this.genSer.user.teamID) === teamId ? true : false;
    this.companyServ.getSalespersonTeams().subscribe((res) => {
      this.arrayTeams = res.filter((data) => data.teamID !== teamId);
      let team = res.filter((team) => team.teamID === teamId);
      this.f.team.setValue(team[0]);
    });
  }

  handleSelf(event) {
    if (event.target.checked) {
      this.companyServ.getSalespersonTeams().subscribe((res) => {
        let team = res.filter(
          (team) => team.teamID === Number(this.genSer.user.teamID)
        );
        this.f.team.setValue(team[0]);
      });
      this.selfActive = true;
    } else {
      this.team = undefined;
      this.selfActive = false;
    }
  }

  get quotesFormArray(): FormArray {
    return this.quotesForm.get("quotesFormArray") as FormArray;
  }

  // Prepare Quotation Details
  private get quotationDetails() {
    const now = new Date().toISOString();
    return {
      id: this.quoteId,
      clientId: this.selectedClientId,
      clientName: this.selectedClientName,
      products: this.getProductDetails,
      createdBy: this.userId,
      orgId: this.orgId,
      totalCost: this.totalQuotationAmountDetails.amountAfterTax,
      currency: this.selectedCurrency,
      createdOn: Date.parse(now),
      subtotalCost: this.totalQuotationAmountDetails.amountBeforeTax,
      taxAmount: this.totalQuotationAmountDetails.taxAmount,
      refNumber: this.refNumber,
      teamId: this.teamForm.value.team.teamID,
      organisation: this.org,
    };
  }

  // Get Product Info
  private get getProductDetails() {
    const returnProduct = this.quotesFormArray.value.map((element, i) => {
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
        taxInclusive: element.taxInclusive ? element.taxInclusive : false,
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

  // private get quotationDetailsForMail(){

  // }

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
        // console.log(markUpTest, 'testone');

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
        // console.log(unitpriceFromPurchase, 'testtwo');

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
        // console.log(unitpriceFromPurchase, 'testtwo');

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

  private get quoteEmailDetails() {
    const result = {
      userId: this.userId,
      quotation: {
        ...this.completedQuote,
      },
      templateId: this.selectedClientsDetails.quotationTemplateId,
      organisation: {
        ...this.org,
      },
      client: {
        ...this.selectedClientsDetails,
      },
    };
    return result;
  }

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
      // ? tax.split("_&")[1]
      // : this.taxes[index].split("(")[1].replace(")", "");
    }
    this.handleComputation(index);
  }

  // Add a form field for quotes
  addQuote() {
    this.quotesFormArray.push(
      this.fb.group({
        itemName: [""],
        description: ["", Validators.required],
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
    // this.taxes.splice(index, 1);
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
        team: this.teamForm.value.team.teamID,
      },
      ...this.getProductDetails,
    ];

    if (type === "Invoice") {
      const invoiceId = Math.random().toString(36).substring(7);
      // console.log("work", copy);
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
      const salesorderId = Math.random().toString(36).substring(7);
      console.log(copy, "Ccopiejgjgj");
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
  handleQuotationUpdate() {
    console.log(this.quotationDetails, "qulo");
    // For validation for the header form fields
    let validationFields = this.refNumber ? "" : `Reference Field is Empty! `;
    validationFields += this.teamForm.value.team.teamID
      ? ""
      : "Kindly Set Team! ";

    validationFields +=
      this.totalQuotationAmountDetails.amountAfterTax < 1
        ? "Amount can not be in the negative or Zero! "
        : "";

    // check if product is valid
    validationFields += this.quotesFormArray.valid
      ? ""
      : "Fill all asterick(*) items! ";

    if (!validationFields) {
      this.savingSpinner = true;
      this.genSer.sweetAlertFileUpdates("Quotation").then((response) => {
        if (response.value) {
          this.quoteSer.updateQuotation(this.quotationDetails).subscribe(
            (res) => {
              this.savingSpinner = false;
              if (res) {
                // Get Updated Quote
                // this.ngOnInit();

                this.genSer.sweetAlertFileUpdateSuccess(
                  "Quotation",
                  "/sales/quotation-list"
                );
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

  sendQuote() {
    const payload = {
      type: "quote",
      id: this.quoteEmailDetails.quotation.id,
      payload: { ...this.quoteEmailDetails },
    };
    // console.log(payload, "paying");
    this.emailService.sales_item.next(payload);
  }

  // Print Page
  handlePrint() {
    const quoteDetails = {
      ...this.quoteEmailDetails,
      type: "quotation",
    };
    let payload: any = { ...quoteDetails };
    console.log(payload, "pay");
    this.genSer.printQuotationInvoice(payload).subscribe((res: any) => {
      const { payload } = res;
      const title =
        "Quotation For " +
        this.selectedClientName +
        " - " +
        new Date().getTime();

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
