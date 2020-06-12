import { DocumentService } from "./../../../services/document.service";
import { SalesOrderModel } from "./../../../models/sales-order.model";
import { ActivatedRoute, Router, NavigationExtras } from "@angular/router";
import { Subject, Observable, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mergeMap,
} from "rxjs/operators";
import { DealsService } from "./../../../services/deals.service";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from "@angular/forms";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import * as $ from "jquery";
import { takeUntil } from "rxjs/operators";
import { salesWorkFlows, clients, currencies } from "src/app/data/sales-order";
import { SalesOrderService } from "src/app/services/sales-order.service";
import { GeneralService } from "src/app/services/general.service";
import {
  SalesTransitionModel,
  TransitionStageModel,
} from "src/app/models/sales-order.model";
import { ClientService } from "src/app/services/client-services/clients.service";
import {
  convertObjToArray,
  selectConfig,
  comparer,
  toCamelCase,
  capitalizeFirstLetter,
} from "src/app/utils/utils";
import Calculate from "src/app/utils/calculate";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { InvoiceService } from "src/app/services/invoice.service";
import { LibaryModel } from "src/app/shared/components/library-upload/library-upload.component";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { CurrencyService } from "src/app/services/currency.service";
import { getCurrencySymbol } from "src/app/utils/currency.util";
import { SalesOrderTransitionModalComponent } from "src/app/shared/components/sales-order-transition-modal/sales-order-transition-modal";
import { LocalStorageService } from "src/app/utils/LocalStorage";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-create-sales-order",
  templateUrl: "./create-sales-order.component.html",
  styleUrls: ["./create-sales-order.component.css"],
})
export class CreateSalesOrderComponent implements OnInit, OnDestroy {
  @ViewChild(SalesOrderTransitionModalComponent)
  salesorderTransitionModal: SalesOrderTransitionModalComponent;
  showEditPage = false;
  calculate = new Calculate();
  config = { ...selectConfig };
  configs = {
    client: { ...this.config, placeholder: "Select Client" },
    salesperson: { ...this.config, placeholder: "Select Salesperson" },
    team: { ...this.config, placeholder: "Select Team" },
    workflow: { ...this.config, placeholder: "Select Workflow" },
    currency: { ...this.config, placeholder: "Select Currency" },
  };
  private unsubcribe = new Subject<void>();
  salesItemForm: FormGroup;
  createSalesForm: FormGroup;
  salesOrderItems: FormArray;
  productList = [];
  productListWithId = [];
  workFlowList = [];
  transitionStageList: TransitionStageModel;
  salesOrderDetail: SalesOrderModel;

  clientList = [];
  salespersonList = [];
  teamList$: Observable<any[]>;
  taxList$ = this.signupSrv.getAllTaxes();
  selectedClient = { id: null, name: null };
  session = { id: null, location: null };
  salesOrderCode: string;
  invoiceId;
  editMode = false;
  disableClient = false;
  disBtn = false;
  comment = "";
  commentForm = {};
  disableCommet = false;
  commentList: any[];
  dataApproveDecline = { type: null, code: null };

  currencies: any;
  baseCurr: string;
  requiredDocument;
  currentStageDetails;
  lastStageInfo: any = {
    lastStageId: 0,
    lastStageName: "",
    transitionID: 0,
    transitionName: "",
    salesOrderID: 0,
  };
  copyFrom = false;

  taxes = [];
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
    private formBuilder: FormBuilder,
    private dealSrv: DealsService,
    private salesOrderSrv: SalesOrderService,
    public generalSrv: GeneralService,
    private router: Router,
    private localStorage: LocalStorageService,
    private clientSrv: ClientService,
    private salespersonSrv: SalesPersonService,
    private invoiceSrv: InvoiceService,
    private documentSrv: DocumentService,
    private signupSrv: SignupLoginService,
    private currencySrv: CurrencyService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    // Create Forms
    this.handleFormCreation();

    // Routing From:
    this.handleQueriesRoutes();
  }

  private handleQueriesRoutes() {
    this.route.queryParamMap.subscribe((params: any) => {
      const {
        salesOrder,
        client_name,
        client_id,
        session_id,
        session_location,
      } = params.params;
      this.salesOrderCode = salesOrder;
      this.selectedClient["id"] = client_id;
      this.selectedClient["name"] = client_name;
      this.session["id"] = session_id;
      this.session["location"] = session_location;

      if (this.salesOrderCode) {
        if (this.selectedClient.id && this.selectedClient.name) {
          this.getSalesOrder(this.salesOrderCode, this.selectedClient);
          this.editMode = false;
          this.showEditPage = true;
        } else {
          this.getSalesOrder(this.salesOrderCode);
          this.editMode = true;
          this.showEditPage = false;
        }
      } else {
        this.showEditPage = true;

        if (session_location === "quotationCreateView") {
          // Create Table/Form dependent if data is copied or not
          const copies = JSON.parse(
            this.localStorage.getFromLocalStorage(
              `copiedSaleOrder_${session_id}`
            )
          );
          console.log(copies, "copy from");
          if (copies === null || copies === undefined) {
            this.handleFormCreation();
          } else {
            this.copyFrom = true;

            let clientDetails = copies.shift();
            let productDetails = copies;
            this.selectedClient["id"] = clientDetails.clientId;
            this.selectedClient["name"] = clientDetails.clientName;
            this.createSalesFormControls.currency.setValue(
              clientDetails.currency
            );
            this.createSalesFormControls.clientName.setValue({
              id: clientDetails.clientId,
              name: clientDetails.clientName,
            });
            this.createSalesFormControls.source.setValue({});
            this.getSalesPTeams("editMode", clientDetails.team);

            this.removeItem(0);
            productDetails.forEach((element) => {
              this.copyInvoice(element);
            });
            this.editMode = false;
            this.showEditPage = true;

            // this.localStorage.deleteFromLocalStorage(
            //   `copiedSaleOrder_${session_id}`
            // );
          }
        } else {
          this.handleFormCreation();
        }
      }
    });
  }

  private handleFormCreation() {
    this.createSalesForm = new FormGroup({
      workflowName: new FormControl("", Validators.required),
      clientName: new FormControl("", Validators.required),
      currency: new FormControl("", Validators.required),
      source: new FormControl("", Validators.required),
      teamID: new FormControl("", Validators.required),
    });

    this.salesItemForm = this.formBuilder.group({
      salesOrderItems: this.formBuilder.array([this.createItem()]),
    });
  }

  private copyInvoice(data) {
    this.itemsControl.push(
      this.formBuilder.group({
        id: "",
        productName: [data.itemName],
        productID: [0],
        descrip: [data.description, Validators.required],
        purchasePrice: [data.purchasePrice, Validators.required],
        markUp: [data.markUp, Validators.required],
        markUpType: [data.markUpType, Validators.required],
        unitPrice: [data.unitPrice, Validators.required],
        quantity: [data.quantity, [Validators.required, Validators.min(1)]],
        margin: [data.margin, Validators.required],
        taxName: [data.tax, Validators.required],
        taxInclusive: [data.taxInclusive, Validators.required],
        taxAmount: [data.taxAmount, Validators.required],
        amount: [data.amount, Validators.required],
      })
    );
  }

  private handleSubscriptions() {
    // Get Clients
    this.clientSrv
      .getAllClients()
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data) => {
        const clientList = convertObjToArray(data);
        this.clientList = clientList.map((client) => ({
          id: client.id,
          name: client.name,
        }));
        if (
          this.session.id === "clientNavigation" ||
          this.session.location === "deals"
        ) {
          this.setClientValue();
        }
      });

    // Get Currencies
    this.currencySrv.org_currencies.subscribe((org_currencies: any) => {
      if (!this.generalSrv.checkIfObjectIsEmpty(org_currencies)) {
        let result = [];
        let res = this.generalSrv.convertObjectToArray(
          org_currencies.currencies
        );
        res.forEach((res2: any) => {
          result.push(res2.currency_code);
        });
        this.currencies = result;
        this.baseCurr = org_currencies.base_currency;
        this.copyFrom === false
          ? this.createSalesForm.controls.currency.setValue(this.baseCurr)
          : null;
      }
    });

    // Get Products
    this.dealSrv
      .fetchAllProducts()
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any[]) => {
        console.log(data, "producst");
        this.productListWithId = data;
        this.productListWithId.map((item) => this.productList.push(item.name));
      });

    // Sales Person
    this.salespersonSrv
      .fetchAllSalePersons()
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any[]) => {
        this.salespersonList = data.map((dat) => ({
          id: dat.id,
          name: dat.name,
        }));
        const { firstName, lastName, id: userId } = this.generalSrv.user;
        this.getSalesOrderFormControls("source").setValue({
          name: `${firstName} ${lastName}`,
          id: userId,
        });
        this.getSalesPTeams();
      });

    // Workflow Logic
    this.salesOrderSrv
      .fetchAllWorkFlows()
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any[]) => (this.workFlowList = data));
  }

  private getSalesOrder(code, client?) {
    this.getComments(code);
    this.getInvoice(code);
    this.getDocuments(code);
    this.salesOrderSrv.fetchSalesOrder(code).subscribe((data: any) => {
      const {
        salesOrderItems,
        workflowID,
        workflowName,
        stageID,
        clientID,
        clientName,
        currency,
        source,
        creatorID,
        teamID,
      } = data;
      console.log(data, "CompletedSalesOrderdata");
      this.salesOrderDetail = data;
      this.createSalesFormControls.workflowName.setValue({
        id: workflowID,
        name: workflowName,
      });
      this.createSalesFormControls.clientName.setValue({
        id: clientID,
        name: clientName,
      });
      this.createSalesFormControls.source.setValue({
        id: creatorID,
        name: source,
      });
      this.getSalesPTeams("editMode", teamID);

      if (client) {
        this.createSalesFormControls.clientName.setValue(
          client.id + "+" + client.name
        );
      }
      this.createSalesFormControls.currency.setValue(currency);
      // this.currencySymbol = getCurrencySymbol(currency);
      const datas = { salesOrderID: workflowID, startStageID: stageID };
      // this.getTransition();
      this.getLastTransitionDetails(workflowID);
      this.getTransitionStage(datas);
      this.removeItem(0);
      this.itemsControl.patchValue(salesOrderItems);
      salesOrderItems.forEach((item) => {
        this.itemsControl.push(
          this.formBuilder.group({
            id: item.id,
            productName: [item.productName],
            productID: [item.productID],
            descrip: [item.descrip],
            purchasePrice: [item.purchasePrice],
            markUp: [item.markUp],
            markUpType: [item.markUpType],
            unitPrice: [item.unitPrice],
            quantity: [item.quantity],
            margin: [item.margin],
            taxName: [item.taxName],
            taxInclusive: [item.taxInclusive],
            taxAmount: [item.taxAmount],
            amount: [item.amount],
          })
        );
      });
      this.itemsControl.controls.forEach((item, i) => this.inputChanges(i));
    });
    setTimeout(() => (this.showEditPage = true), 1000);
  }

  private getComments(saleOrderCode) {
    this.salesOrderSrv
      .fetchComment(saleOrderCode)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any[]) => (this.commentList = data));
  }

  private getInvoice(saleOrderCode: string) {
    this.invoiceSrv
      .getInvoiceByFilter(`salesOrderId=${saleOrderCode}`)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any) => {
        if (data && data.payload && data.payload.length) {
          this.invoiceId = data.payload[0].id;
          console.log(this.invoiceId, " this.invoiceId");
        }
      });
  }

  ngOnInit() {
    this.handleSubscriptions();
  }

  getSalesOrderFormControls(controls) {
    return this.createSalesForm.get(controls);
  }

  getSalesPTeams(editMode?, teamID?) {
    //  Get Sales Person Team
    this.createSalesForm.controls.teamID.setValue("");
    const source = this.createSalesForm.value.source;
    this.selfActive =
      Number(this.generalSrv.user.teamID) === Number(teamID) ? true : false;
    if (source) {
      this.teamList$ = this.signupSrv.fetchsalesPersonTeams(source.id) as any;
    }
    if (editMode) {
      this.teamList$.subscribe((res) => {
        const selectedTeams = res.filter(
          (res) => res.teamID === Number(teamID)
        );
        this.createSalesFormControls.teamID.setValue(selectedTeams[0].teamID);
      });
    }
  }

  handleSelf(event, editMode?) {
    if (event.target.checked) {
      this.teamList$.subscribe((res) => {
        const selectedTeams = res.filter(
          (res) => res.teamID === Number(this.generalSrv.user.teamID)
        );
        this.createSalesFormControls.teamID.setValue(selectedTeams[0].teamID);
        console.log(selectedTeams, "selectedTeams");
      });

      this.selfActive = true;
    } else {
      this.createSalesFormControls.teamID.setValue("");
      this.selfActive = false;
    }
  }

  setClientValue() {
    const { id, name } = this.selectedClient;
    this.createSalesFormControls.clientName.setValue(this.selectedClient);
    // this.disableClient = true
  }

  getData() {}

  parseConfig(entries) {
    return { ...this.config, ...entries };
  }
  // TypeAhead Implementation
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2
          ? []
          : this.productList
              .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
              .slice(0, 10)
      )
    );

  get createSalesFormControls() {
    return this.createSalesForm.controls;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      id: "",
      productName: [""],
      productID: ["id"],
      descrip: ["", Validators.required],
      purchasePrice: [0, Validators.required],
      markUp: [0, Validators.required],
      markUpType: ["", Validators.required],
      unitPrice: [0, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      margin: [0, Validators.required],
      taxName: ["none", Validators.required],
      taxInclusive: [{ value: false, disabled: true }, Validators.required],
      taxAmount: [0, Validators.required],
      amount: [0, Validators.required],
    });
  }

  get itemsControl() {
    return this.salesItemForm.get("salesOrderItems") as FormArray;
  }

  getItemControlGet(index, value) {
    return this.itemsControl.controls[index].get(value);
  }
  getIQuantityVal(index) {
    return this.getItemControlGet(index, "quantity").value;
  }
  getIMarkUpVal(index) {
    return this.getItemControlGet(index, "markUp").value;
  }
  getIMarkUpTypeVal(index) {
    return this.getItemControlGet(index, "markUpType").value;
  }
  getIPurchasePriceVal(index) {
    return this.getItemControlGet(index, "purchasePrice").value;
  }
  getIUnitPriceVal(index) {
    return this.getItemControlGet(index, "unitPrice").value;
  }

  addItem(): void {
    this.itemsControl.push(this.createItem());
  }
  removeItem(index) {
    this.itemsControl.removeAt(index);
  }

  setProductId(index) {
    const { productName } = this.itemsControl.value[index];
    const result = this.productListWithId.find(
      (item) => item.name.toLowerCase() == productName.toLowerCase()
    );
    if (result) {
      const id = result ? result.id : 0;
      const desc = result ? result.descrip : "";
      this.getItemControlGet(index, "productID").setValue(id);
      this.getItemControlGet(index, "descrip").setValue(desc);
    }
  }

  inputChanges(index) {
    this.setUnitPrice(index);
    this.setTaxAmount(index);
    this.setMargin(index);
    this.setAmount(index);
  }

  setTaxAmount(index) {
    const { taxName } = this.itemsControl.controls[index].value;

    const { taxInclusive } = this.itemsControl.getRawValue()[index];
    const quantity = this.getIQuantityVal(index);
    const unitPrice = this.getIUnitPriceVal(index);
    const taxAmount = this.calculate.taxAmount(
      unitPrice,
      quantity,
      taxName,
      taxInclusive
    );
    if (taxName !== "none") {
      this.getItemControlGet(index, "taxInclusive").enable();
      this.getItemControlGet(index, "taxAmount").setValue(taxAmount);
    } else {
      this.getItemControlGet(index, "taxInclusive").disable();
      this.getItemControlGet(index, "taxAmount").setValue(0);
    }
  }

  setAmount(index) {
    const { taxName } = this.itemsControl.value[index];

    const { taxInclusive } = this.itemsControl.getRawValue()[index];
    const quantity = this.getIQuantityVal(index);
    const unitPrice = this.getIUnitPriceVal(index);
    const taxAmount = this.calculate.taxAmount(
      unitPrice,
      quantity,
      taxName,
      taxInclusive
    );
    const sum = unitPrice * quantity;
    const result = taxInclusive ? sum : sum + taxAmount;
    this.getItemControlGet(index, "amount").setValue(result);
  }

  setUnitPrice(index) {
    const markUpType = this.getIMarkUpTypeVal(index);
    const purchasePrice = this.getIPurchasePriceVal(index);
    const markUp = this.getIMarkUpVal(index);
    const result = this.calculate.markup(markUpType, markUp, purchasePrice);
    this.getItemControlGet(index, "unitPrice").setValue(result);
  }

  setMargin(index) {
    const unitPrice = this.getIUnitPriceVal(index);
    const purchasePrice = this.getIPurchasePriceVal(index);
    const quantity = this.getIQuantityVal(index);
    let result: number = (unitPrice - purchasePrice) * quantity;
    this.getItemControlGet(index, "margin").setValue(result);
  }

  get subTotalAmount(): number {
    let total = 0;
    const salesOrderItems = this.itemsControl.getRawValue();
    salesOrderItems.map(
      (item) => (total += (item.amount - item.taxAmount) as number)
    );
    return parseFloat(total.toFixed(2));
  }

  get taxAmount(): number {
    let total = 0;
    const salesOrderItems = this.itemsControl.getRawValue();
    salesOrderItems.map((item) => (total += item.taxAmount));
    return parseFloat(total.toFixed(2));
  }

  get totalMargin(): number {
    let total = 0;
    const salesOrderItems = this.itemsControl.getRawValue();
    salesOrderItems.map((item) => (total += item.margin));
    return parseFloat(total.toFixed(2));
  }

  get totalAmount(): any {
    return Number(this.subTotalAmount + this.taxAmount).toFixed(2);
  }

  getFieldName(field) {
    let result = field;
    if (field === "source") {
      result = "Sales Person";
    } else if (field === "teamID") {
      result = "Team";
    } else if (field === "workflowName") {
      result = "Workflow Name";
    } else if (field === "clientName") {
      result = "Client Name";
    } else if (field === "currency") {
      result = "Currency";
    }
    return result;
  }

  save(type) {
    let transitionName = document.getElementById("selectedTransition");
    let stageName = document.getElementById("selectedStage");
    let errors = "";
    Object.keys(this.createSalesForm.controls).forEach((field) => {
      if (this.createSalesForm.controls[field].errors) {
        errors += `${this.getFieldName(field)}, `;
      }
    });

    if (errors) {
      errors += `is(are) required`;
    }

    if (this.createSalesForm.valid) {
      errors = !transitionName ? "Transition is required" : "";
    }
    if (this.createSalesForm.valid && transitionName) {
      errors = this.salesItemForm.invalid
        ? "All item field with (*) are required"
        : "";
    }

    if (this.subTotalAmount < 1) {
      errors = "Amount can not be in the negative or Zero!";
    }

    if (
      !errors &&
      transitionName &&
      stageName &&
      this.createSalesForm.valid &&
      this.salesItemForm.valid
    ) {
      transitionName = transitionName.getAttribute("data-value") as any;
      stageName = stageName.getAttribute("data-value") as any;
      const body = {
        ...this.salesItemForm.getRawValue(),
        subTotalAmount: this.subTotalAmount,
        taxAmount: this.taxAmount,
        totalAmount: this.totalAmount,
        totalMargin: this.totalMargin,
        ...this.createSalesForm.getRawValue(),
        stageName,
        transitionName,
      };

      let newBody;
      if (this.editMode) {
        newBody = { ...this.salesOrderDetail, ...body };
      } else {
        newBody = body;
        if (this.session.id && this.session.location) {
          if (this.session.location === "deals") {
            newBody = { ...newBody, dealCode: this.session.id };
          }
        }
      }
      console.log(newBody, "newBo dySales");
      this.disBtn = true;
      this.salesOrderSrv
        .createSalesOrder(
          {
            ...newBody,
            equivalents: this.currencySrv.get_cost_equivalents(
              this.baseCurr,
              newBody.currency,
              newBody.totalAmount
            ),
          },
          type
        )
        .subscribe(
          (res: any) => {
            this.disBtn = false;
            if (this.editMode) {
              this.generalSrv.sweetAlertFileUpdateSuccess(
                "Sales Order",
                "/sales/sales-order-list"
              );
              // location.reload();
              this.itemsControl.controls.forEach((item, i) =>
                this.removeItem(i)
              );
              this.getSalesOrder(res.code);
            } else {
              const query = { queryParams: { salesOrder: res.code } };
              this.generalSrv.swtAlertSuccess("Sales Order").then((result) => {
                if (result.value) {
                  this.router.navigate(["sales/create-sales-order"], query);
                  this.salesItemForm = this.formBuilder.group({
                    salesOrderItems: this.formBuilder.array([]),
                  });
                  this.itemsControl.controls.forEach((item, i) =>
                    this.removeItem(i)
                  );
                  // this.getSalesOrder(res.code);
                  this.editMode = true;
                } else {
                  this.salesItemForm.reset();
                  this.createSalesForm.reset();
                  this.transitionStageList = null;
                }
              });
            }
          },
          (err) => {
            this.disBtn = false;
            this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
          }
        );
    } else {
      this.generalSrv.sweetAlertFieldValidatio(errors);
    }
  }

  //Approve or Decline SalesOrder
  getApproveDecline(type) {
    // check all doc are uplodaded
    this.getTransition("doc");
    this.dataApproveDecline.type = type;
    this.dataApproveDecline.code = this.salesOrderCode;
  }

  approveDecline() {
    this.disBtn = false;
    this.salesOrderSrv
      .chanageStatus(this.dataApproveDecline)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe(() => {
        this.salesItemForm = this.formBuilder.group({
          salesOrderItems: this.formBuilder.array([]),
        });
        this.getSalesOrder(this.salesOrderCode);
        $("#closeModal").click();
        this.generalSrv.sweetAlertSucess(
          `Sales Order ${this.dataApproveDecline.type}d`
        );
        this.disBtn = true;
      });
  }

  // Print Page
  printPage() {
    window.print();
  }

  filterStage(stages: any[]) {
    const filStage = stages.filter(
      (st) => !(st.stageName === "Approval" && st.stageName == "Decline")
    );
    return filStage.length;
  }

  getTransition(loc?) {
    let { workflowName } = this.createSalesForm.value;
    const workflowId = workflowName ? workflowName.id : null;
    !loc ? (this.transitionStageList = null) : this.transitionStageList;
    if (workflowId) {
      this.salesOrderSrv
        .fetchAllTransitions(workflowId)
        .pipe(takeUntil(this.unsubcribe))
        .subscribe((data: SalesTransitionModel[]) => {
          if (data.length) {
            console.log(data, "alltransition");

            // Trying the upload by team and general i decided to chaange the onload to be this function instead of the one below. see commeted our session above
            this.requiredDocument = data.map((res) => {
              let obj = {
                name: res.name,
                stageName: res.startStageName,
                stageID: res.startStageID,
                salesOrderID: res.salesOrderID,
                documents: res.documents,
              };
              return obj;
            });
            if (!loc) {
              const { salesOrderID, startStageID } = data[0];
              const datas: any = { salesOrderID, startStageID };
              this.getTransitionStage(datas);
            } else {
              this.checkAllStagesDocRole(data);
            }
          } else {
            this.transitionStageList = {} as any;
          }
        });
    }
  }

  propso() {
    console.log(this.transitionStageList, "lisitng");
  }

  checkAllStagesDocRole(data) {
    let docCheck = [];
    let rolesCheck = [];
    let allDocUploadedRoleValid = "";
    console.log(data, "datas");
    data.forEach((res) => {
      let activeStage = `${res.startStageID}-${res.startStageName}`;
      docCheck.push(this.checkifDocUploaded(activeStage, res).length > 0);
      rolesCheck.push(res.roleName.includes(this.generalSrv.roleName));
    });
    console.log(docCheck, rolesCheck, "checks");
    if (docCheck.includes(true)) {
      allDocUploadedRoleValid +=
        "All Documents are not Uploaded. Sales order cannot be approved or rejected. Please transit through the stages and upload all documents<br/> ";
    } else if (rolesCheck.includes(false)) {
      allDocUploadedRoleValid +=
        "You do not have permission to approve or reject this sales order.  <br/> ";
    }
    if (allDocUploadedRoleValid) {
      this.generalSrv.sweetAlertError(allDocUploadedRoleValid);
    } else {
      $("#actionBtn").click();
    }
  }

  getLastTransitionDetails(id) {
    this.salesOrderSrv
      .fetchAllTransitions(id)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: SalesTransitionModel[]) => {
        if (data.length) {
          data.forEach((res: any) => {
            if (res.name === "End Transition") {
              this.lastStageInfo = {
                lastStageId: res.stages[0].stageID,
                lastStageName: res.stages[0].stageName,
                transitionID: res.id,
                transitionName: res.name,
                salesOrderID: res.salesOrderID,
              };
            }
          });
        }
      });
  }

  getTransitionStage(datas) {
    this.salesOrderSrv
      .fetchAllTransitionStages(datas)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((stage: TransitionStageModel) => {
        console.log(stage, "stages");
        this.transitionStageList = stage;
        if (stage.transitionName === null && !stage.transitionID) {
        }
      });
  }

  changeTransition(nextPrevStage, type, activeStage?) {
    const { workflowName } = this.createSalesForm.value;
    const datas = {
      startStageID: nextPrevStage.stageID,
      salesOrderID: workflowName.id,
    };
    if (this.editMode && type === "forward") {
      if (
        this.transitionStageList.roleNames.includes(this.generalSrv.roleName)
      ) {
        this.commentForm["workflowID"] = workflowName.id;
        this.commentForm["transitionID"] = activeStage.split("-")[0];
        this.commentForm["nextStageID"] = nextPrevStage.stageID;
        this.commentForm["salesOrderCode"] = this.salesOrderCode || 0;
        if (
          this.checkifDocUploaded(activeStage, this.transitionStageList)
            .length > 0
        ) {
          document.getElementById("auto-click-trans-modal").click();
          this.salesorderTransitionModal.getRequiredDoc(
            nextPrevStage,
            this.transitionStageList,
            activeStage
          );
          console.log("Mot doc uploaded");
        } else {
          this.activateCommentSection();
          console.log("all doc uploaded");
        }
      } else {
        this.generalSrv.sweetAlertError(
          "You Have no Permission to Make Transition"
        );
      }
    } else {
      console.log("uolij");
      this.getTransitionStage(datas);
    }
  }

  checkifDocUploaded(activeStageUnsplit, transitionStageList) {
    const extractedDocs = [];
    const activeSplit = activeStageUnsplit.split("-");
    let activeStage = {
      id: activeSplit[0],
      name: activeSplit[1],
    };
    transitionStageList.documents.forEach((doc) => {
      extractedDocs.push({
        id: `${activeStage.id}+${doc}`,
        document: doc,
      });
    });
    const arr1 = this.documentList.map((item) => ({
      id: item.stageID,
      document: item.name,
    }));
    let doc = extractedDocs.filter(comparer(arr1));
    return doc;
  }

  activateCommentSection() {
    this.getDocuments(this.salesOrderCode);
    $("#commentModalBtn").click();
  }

  saveComment() {
    const datas = {
      startStageID: this.commentForm["nextStageID"],
      salesOrderID: this.commentForm["workflowID"],
    };
    delete this.commentForm["nextStageID"]; // Remove unneeded obj from comment data list
    // Check if comment details is set
    if (!this.commentForm["workflowID"]) {
      this.commentForm["workflowID"] = this.salesOrderDetail.workflowID;
      this.commentForm["transitionID"] = this.transitionStageList.startStageID;
      this.commentForm["salesOrderCode"] = this.salesOrderCode || 0;
    }

    this.commentForm["content"] = this.comment;
    this.disableCommet = true;
    if (this.comment.length) {
      this.salesOrderSrv
        .addComment(this.commentForm)
        .pipe(takeUntil(this.unsubcribe))
        .subscribe(
          () => {
            this.disableCommet = false;
            this.comment = "";
            datas.startStageID ? this.getTransitionStage(datas) : null;
            this.getComments(this.salesOrderCode);
            $("#closeCommentModal").click();
          },
          (err) => {
            this.disableCommet = false;
            alert("Error occured try again!");
            console.log(err);
          }
        );
    } else {
      this.disableCommet = false;
      datas.startStageID ? this.getTransitionStage(datas) : null;
      $("#closeCommentModal").click();
    }
  }

  //  Document
  selectedFile: File;
  documentList = [];
  selectedDoc;
  libDocData: LibaryModel = {
    category: "salesOrder",
    keyID: this.salesOrderCode,
    stageID: "",
  };

  initFiles() {
    this.selectedFile = null;
  }

  openUploadDoc() {
    const stageID = ($("#selectedTransition").attr(
      "data-value"
    ) as string).split("+")[0];
    this.libDocData.keyID = this.salesOrderCode;
    this.libDocData.stageID = stageID;
  }

  browseFile(event) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      const stageID = this.libDocData.stageID;
      const body = {
        file: this.selectedFile,
        stageID,
        code: this.salesOrderCode,
        teamId: this.salesOrderDetail.teamID,
      };
      this.documentSrv
        .upload(body, "salesorder")
        .pipe(takeUntil(this.unsubcribe))
        .subscribe(
          () => {
            this.uploadSuccess();
          },
          (err) => {
            $("#closeDocumentModal").click();
            this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
          }
        );
    }
  }

  uploadSuccess() {
    this.initFiles();
    this.getDocuments(this.salesOrderCode);
    $("#closeDocumentModal").click();
    this.generalSrv.sweetAlertSucess("Document Uploaded");
  }

  getDocuments(code) {
    this.documentSrv
      .fetchAll(code)
      .pipe(takeUntil(this.unsubcribe))
      .subscribe((data: any[]) => (this.documentList = data));
  }

  viewDoc(doc) {
    this.selectedDoc = doc;
    this.currentStageDetails = {
      ...this.transitionStageList,
    };
  }

  handelCopyToInvoice() {
    let result = {};
    const { clientName, currency, teamID } = this.createSalesForm.value;
    console.log(clientName, "naame");
    let invoice = {
      client: { ...clientName },
      currency,
      teamID,
    };
    result = { ...invoice };
    result = this.salesOrderDetail
      ? { ...result, salesOrderId: this.salesOrderDetail.code }
      : result;
    const invoiceFormat = [];
    this.itemsControl.getRawValue().map((item) => {
      invoiceFormat.push({
        itemName: item.productName,
        description: item.descrip,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        tax: item.taxName,
        taxAmount: item.taxAmount,
        taxInclusive: item.taxInclusive,
        amount: item.amount,
      });
    });
    result["salesOrderItems"] = invoiceFormat;
    this.generalSrv
      .sweetAlertFileCreations("Create Invoice")
      .then((response) => {
        if (response.value) {
          this.salesOrderSrv.convertToInvoce(result);
          const sessionName = this.salesOrderCode;
          const navigationExtras: NavigationExtras = {
            queryParams: {
              session_id: sessionName,
              session_location: "saleOrderCreateView",
            },
            fragment: "redirect",
          };

          this.router.navigate(["/sales/create-invoice"], navigationExtras);
        }
      });
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

      this.invoiceSrv.uploadProducts(formData).subscribe(
        async (res) => {
          if (res !== null) {
            const { payload } = res;
            this.handleImportedProducts(payload);

            this.toastr.success("File import successfully!", "Import Success");
            $("#importCompany").click();
          } else {
            this.toastr.error(
              "Error importing contacts. Please try again!",
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
    this.removeItem(0);
    let newProdArr = products.map((res) => {
      return {
        id: "",
        productName: [""],
        productID: ["id"],
        descrip: res.description,
        purchasePrice: Number(res.purchasePrice),
        markUp: Number(res.margin),
        markUpType: res.marginType,
        margin: Number(res.markUp),
        unitPrice: Number(res.unitPrice),
        quantity: Number(res.quantity),
        taxName: "none",
        taxInclusive: false,
        taxAmount: 0,
        amount: Number(res.amount),
      };
    });
    console.log(newProdArr, "testirun");

    newProdArr.forEach((item) => {
      this.itemsControl.push(this.formBuilder.group(item));
    });
    this.itemsControl.controls.forEach((item, i) => this.inputChanges(i));
  }

  ngOnDestroy() {
    this.unsubcribe.next();
    this.unsubcribe.complete();
  }
}
