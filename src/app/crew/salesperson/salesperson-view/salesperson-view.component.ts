import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { SalesPersonService } from "src/app/services/crew-services/sales-person.service";
import { SalesPersonModel } from "src/app/models/crew/salesperson.model";
import { QuotationService } from "src/app/services/quotation.service";
import { GeneralService } from "src/app/services/general.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TargetService } from 'src/app/services/target.service';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { SalepersonNavComponent } from './saleperson-nav/saleperson-nav.component';
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { InvoiceService } from 'src/app/services/invoice.service';
import { CustomValidators } from 'ngx-custom-validators';
import { selectConfig } from 'src/app/utils/utils';
import { LeadSourceService } from 'src/app/services/filters/lead-source.service';
import { AppState } from 'src/app/store/app.state';
import { Store } from '@ngrx/store';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { SalesOrderService } from 'src/app/services/sales-order.service';

@Component({
  selector: "app-salesperson-view",
  templateUrl: "./salesperson-view.component.html",
  styleUrls: ["./salesperson-view.component.css"]
})
export class SalespersonViewComponent implements OnInit, OnDestroy {
  p: number = 1;
  @ViewChild(SalepersonNavComponent) personComponent: SalepersonNavComponent;
  private unsubscribe = new Subject();
  org;
  id;
  _isCurrencyEnabled: boolean = true;
  targets: Observable<any>;
  periods: Observable<any>;
  targetList: Array<{}> = [];
  periodList: Array<{}> = [];
  commissionList: Array<{}> = [];
  assignedCommissions: Array<{}> = [];
  assignedTargetsV2: Array<{}> = [];
  assignPeriods: Observable<any>;
  commissions: Observable<any>;
  targetsV2: Observable<any>
  quoteList: any;
  invoiceList: any;
  assignedSalesOrder: any;
  salesPerson: SalesPersonModel;
  salesPersonPic: any;
  salesPersonPic2;
  loading: boolean = false;
  loadingView: boolean = false;
  targetForm: FormGroup;
  commissionForm: FormGroup;
  commission_accelerator;
  target_limit: Number = 0;
  commission_period_value: Number = 0;
  selectedTarget;
  leadsList;
  contactList;
  companyLists;
  targetStageList$ = this.targetService.getTargetStagesDropdown();
  targetStageConfig = {
    ...selectConfig,
    displayKey: 'description'
  };

  commissionsConfig = {
    search: true,
    placeholder: "Select Commissions",
    limitTo: 10,
    noResultsFound: "No commissions available!",
    searchPlaceholder: "search"
  };
  targetsConfig = {
    search: true,
    placeholder: "Select Target",
    limitTo: 10,
    noResultsFound: "No targets available!",
    searchPlaceholder: "search"
  };
  periodsConfig = {
    search: true,
    placeholder: "Select Periods",
    limitTo: 10,
    noResultsFound: "No periods available!",
    searchPlaceholder: "search"
  };
  loader: any = {
    default: "notch-loader",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Teams",
      success: true
    },
    showSpinner: false
  };

  constructor(
    private fb: FormBuilder,
    route: ActivatedRoute,
    store: Store<AppState>,
    private quoteSrv: QuotationService,
    private salepersonSrv: SalesPersonService,
    private targetService: TargetService,
    public generalService: GeneralService,
    private emailSrv: EmailService,
    private salesOrderSrv: SalesOrderService,
    private invoiceServ: InvoiceService,
    private leadSrv: LeadSourceService,
    private contactSrv: ContactsService,
    private CompaniesSrv: CompaniesService,
    private router: Router,
  ) {
    this.loader.spinnerType = this.loader.default;
    this.id = route.snapshot.paramMap.get("id");
    store.select("userInfo").subscribe(info => {
      this.org = info.organization;
    });
  }

  ngOnInit() {
    this.generalService.showSpinner.next(false);
    this.getSaleperson();
    this.getSalepersonPics();
    this.getSalepersonQuotation();
    this.getSalesPersonInvoice();
    this.getSalesPersonLeads();
    this.getSalesPersonContacts();
    this.getAssignedSalesOrder();
    this.getSalesPersonCompany();
    this.getTargets();
    this.getCommissions();
    this.createCommissionForm();
    this.createTargetForm();
  }

  /**
   * Get SalesPersons By ID
   */
  getSaleperson() {
    this.loader.showSpinner = true;
    this.salepersonSrv
      .fecthUser(this.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: SalesPersonModel) => {
        this.initializeLoad(data)
        this.passDataToEmailConText(data);
      });
  }

  /**
  * Internet Loading
  * @param data 
  */
  initializeLoad(data) {
    if (data === null || data === undefined) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Kindly Check your Internet & Click Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      this.salesPerson = data;
      this.loader.showSpinner = false;
    }
  }

  /**
   * Commission Form
   */
  createCommissionForm() {
    this.commissionForm = this.fb.group({
      commission: ["", Validators.required],
      target: ["", Validators.required],
      period: ["", Validators.required],
      threshold: ["",
        [
          Validators.required,
          CustomValidators.number
        ]
      ],
      accelerator_threshold: ["", CustomValidators.number]
    });
  }

  /**
   * Target Form
   */
  createTargetForm() {
    this.targetForm = this.fb.group({
      target: ["", Validators.required],
      period: ["", Validators.required],
      value: ["",
        [
          Validators.required,
          CustomValidators.number
        ]
      ],
      stage: [""]
    });
  }

  /**
   * Enable Current Status
   */
  setCurrencyEnabledStatus() {
    this._isCurrencyEnabled = (
      this.selectedTarget.type === 'revenue' ||
      this.selectedTarget.type === 'markup' ||
      this.selectedTarget.type === 'product_revenue'
    ) ? true : false;
    if (this._isCurrencyEnabled) {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.number]);
    } else {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.digits]);
    }
    this.targetForm.get('value').updateValueAndValidity();
  }

  /**
  * Get SalesPerson Target
  */
  private getTargets() {
    this.targetService.getTargets()
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.targetList = res.response;
          this.targets = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: `${e.title} (${e.type})` };
              })
            );
          });
        }
      });
  }

  /**
   * Get SalesPerson Commission
   */
  private getCommissions() {
    this.targetService.getCommissionProfiles()
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.commissionList = res.response;
          this.commissions = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: `${e.title} (${e.type})` };
              })
            );
          });
        }
      });
  }

  /**
   * Passing Email COntent Data
   */
  passDataToEmailConText(salesperson: SalesPersonModel) {
    const context_data = {
      name: "salesPerson", // One of the following 'salesperson'
      data: {
        id: salesperson.id, // ID of the item in view eg leadId, contactID etc
        email: salesperson.email, // The email of th item in view
      }
    }
    this.emailSrv.email_context.next(context_data)
  }

  /**
  * Get SalesPersons pic By ID
  */
  getSalepersonPics() {
    this.salepersonSrv
      .fecthUserPic(this.id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        if (data === null) {

        } else {
          this.salesPersonPic = data;
          this.salesPersonPic2 = this.salesPersonPic.displayUriPath
        }
      });
  }

  /**
  * Get Sales Person Quotation
  */
  getSalepersonQuotation() {
    const query = `createdBy=${this.id}`;
    this.quoteSrv.getQuotationByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.quoteList = data.payload
      });
  }

  /**
   * Get SalesPerson Invoice By ID
   */
  getSalesPersonInvoice() {
    const query = `createdBy=${this.id}`;
    this.invoiceServ.getInvoiceByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.invoiceList = data.payload
      });
  }

  /**
   * Fetch assigned salesOrder by ID && TYPE 
   * WHERE SALESPERSON = 1
   */
  getAssignedSalesOrder() {
    this.salesOrderSrv
      .getMultipleSalesOrders(this.id, 1)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.assignedSalesOrder = data;
      });
  }

  /**
   * Fetch Leads Assigns to a Salesperson
   */
  getSalesPersonLeads() {
    const query = `owner=${this.id}`;
    this.leadSrv.filterLead(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.leadsList = data.payload
      });
  }

  /**
   * Fetch Contacts Assigns to a Salesperson
   */
  getSalesPersonContacts() {
    const query = `owner=${this.id}`;
    this.contactSrv.getContactsByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.contactList = data.payload
      });
  }

  /**
  * Fetch Contacts Assigns to a Salesperson
  */
  getSalesPersonCompany() {
    const query = `owner=${this.id}`;
    this.CompaniesSrv.getCompaniesByFilter(query).pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any) => {
        this.companyLists = data.payload
      });
  }

  /**
   * Assign Target
   */
  assignTarget() {
    const targetDetails = this.targetForm.value;
    $("#targetModal .close").click();
    this.generalService.sweetAlertFileCreations("Target").then(res => {
      if (res.value) {
        let obj = {
          userId: this.id,
          targetId: targetDetails.target.id,
          sub_periodId: targetDetails.period.id,
          value: targetDetails.value,
        };
        if (targetDetails.stage)
          obj['stage'] = targetDetails.stage.id;
        if (!obj.targetId || !obj.sub_periodId || !obj.value)
          return this.generalService.notification(
            "Kindly fill all required field(s)",
            "",
            "warning"
          );
        if (parseFloat(obj.value) > this.target_limit)
          return this.generalService.notification(
            `Insufficient unallocated target (${this.target_limit})`,
            "",
            "warning"
          );
        obj["periodId"] = this.targetList.filter(e => {
          return e["id"] === Number(obj.targetId);
        })[0]["period"];
        this.loading = true;
        this.targetService.addAssignedTarget(obj)
          .subscribe((response: any) => {
            this.loading = false;
            if (response.status === 200) {
              this.generalService.notification(
                "Target assigned successfully!",
                "",
                "success"
              );
              this.targetForm.reset();
              this.personComponent.refresh();
              this.getTargetLimit();
            } else {
              this.generalService.notification(response.error, "", "error");
            }
          },
            error => {
              this.loading = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            });
      }
    });
  }

  /**
   * Get Target Limits
   */
  private getTargetLimit() {
    const target = this.targetForm.value.target;
    if (!target || !target.id) return;
    this.targetService.getTargetLimit(target.id)
      .subscribe((res: any) => {
        if (res.status === 200)
          this.target_limit = res.response.unallocated;
      });
  }

  /**
   * Get Period By Target ID (For target)
   */
  getPeriods() {
    const target = this.targetForm.value.target;
    if (!target || !target.id) return;
    const target_obj = (this.targetList.filter(e => {
      return e['id'] === Number(target.id);
    }))[0];
    this.selectedTarget = target_obj;
    this.setCurrencyEnabledStatus();
    this.targetForm.get('period').reset();
    this.targetForm.get('stage').reset();
    this.targetStageList$ = this.targetService.getTargetStagesDropdown(target_obj['type']);
    this.targetService.getTargetPeriods(target.id)
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.periods = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: e.name };
              })
            );
          });
          this.getTargetLimit();
        }
      });
  }

  /**
    * Get Period By Target ID & SalesPerson ID (For Commission)
    */
  getPeriods2() {
    const target = this.commissionForm.value.target;
    if (!target || !target.id) return;
    this.targetService
      .getAssignedPeriods(this.id, target.id)
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.periodList = res.response;
          this.assignPeriods = new Observable(observer => {
            observer.next(
              res.response.map(e => {
                return { id: e.id, description: e.name };
              })
            );
          });
          this.getTargetLimit();
        }
      });
  }

  /**
   * Get Assigned Target
   */
  private getAssignedTargetsV2() {
    this.targetService
      .getAssignedTargetsV2(this.salesPerson.id)
      .subscribe((res: any) => {
        if (res.status === 200) this.assignedTargetsV2 = res.response;
        res.response = res.response.filter(e => {
          return this.targetService.getTargetType(e.type)['commissionEnabled'];
        });
        this.targetsV2 = new Observable(observer => {
          observer.next(
            res.response.map(e => {
              return {
                id: e.id, stage: e.stage, description: `${e.target} 
                (${this.targetService.getTargetType(e.type)['name']} -> ${this.targetService.getTargetStage(e.stage)['name']})`
              };
            })
          );
        });
      });
  }


  /**
   * Get Accelerator Threshold Commission
   */
  getAcceleratorThreshold() {
    this.getAssignedTargetsV2();
    const commission_id = this.commissionForm.value.commission.id;
    if (commission_id) {
      this.commission_accelerator = this.commissionList.filter(e => {
        return e["id"] === Number(commission_id);
      })[0];
    }
  }

  /**
   * Get Assigned Commission By SalesPerson ID
   */
  private getAssignedCommissions() {
    this.loadingView = true;
    this.targetService
      .getAssignedCommissions(this.salesPerson.id)
      .subscribe((res: any) => {
        this.loadingView = false;
        if (res.status === 200) this.assignedCommissions = res.response;
      });
  }

  /**
   * Reverse Assigned Commission
   * @param id 
   */
  reverseAssignCommission(id) {
    $("#commissionModal .close").click();
    this.generalService.sweetAlertFileDeletions("Commission").then(result => {
      if (result.value) {
        this.targetService
          .deleteAssignedCommission(id, this.salesPerson.id)
          .subscribe(
            result2 => {
              if (result2) {
                Swal.fire(
                  "Deleted!",
                  "Your file has been deleted.",
                  "success"
                ).then(res => {
                  this.getAssignedCommissions();
                });
              }
            },
            error => {
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
      }
    });
  }

  /**
   * Get Commission Period Value
   */
  getCommissionPeriodValue() {
    const commission_period = this.commissionForm.value.period.id;
    if (commission_period) {
      this.commission_period_value = Number(
        this.periodList.filter(e => {
          return e["id"] === Number(commission_period);
        })[0]["value"]
      );
    }
  }

  /**
   * Assign Commission to a SalesPerson
   */
  assignCommission() {
    const commissionDetails = this.commissionForm.value;
    $("#commissionModal .close").click();
    this.generalService.sweetAlertFileCreations("Commission").then(res => {
      if (res.value) {
        let obj = {
          userId: this.salesPerson.id,
          targetId: commissionDetails.target.id,
          commissionId: commissionDetails.commission.id,
          sub_periodId: commissionDetails.period.id,
          threshold: Number(commissionDetails.threshold),
          accelerator_threshold: Number(commissionDetails.accelerator_threshold)
        };
        if (
          !obj.targetId ||
          !obj.commissionId ||
          !obj.sub_periodId ||
          !obj.threshold
        )
          return this.generalService.notification(
            "Kindly fill all required field(s)",
            "",
            "warning"
          );
        if (obj.threshold < 1 || obj.threshold > 100) {
          return this.generalService.notification(
            `Commission threshold rate (${obj.threshold}%)
              must be at least 1% and at most 100%. (Total allocated target is valued at ${this.commission_period_value})`,
            "",
            "warning"
          );
        }
        if (
          obj.accelerator_threshold &&
          obj.accelerator_threshold <= obj.threshold
        ) {
          return this.generalService.notification(
            `Accelerator threshold (${obj.accelerator_threshold}%)
              must be greater than ${obj.threshold}%.`,
            "",
            "warning"
          );
        }
        obj["type"] = this.commissionList.filter(e => {
          return e["id"] === Number(obj.commissionId);
        })[0]["type"];
        let target = this.assignedTargetsV2.filter(e => {
          if (commissionDetails.target.stage) {
            return e["id"] === Number(obj.targetId) &&
              e["stage"] === commissionDetails.target.stage;
          } else {
            return e["id"] === Number(obj.targetId);
          }
        })[0];
        let period = this.periodList.filter(e => {
          return e["id"] === Number(obj.sub_periodId);
        })[0];
        if (obj["type"] !== target["type"])
          return this.generalService.notification(
            "Commission and Target must be of the same type",
            "",
            "warning"
          );
        obj["periodId"] = target["period"];
        obj["target_value"] = period["value"];
        if (target["stage"]) obj["stage"] = target["stage"];

        this.loading = true;
        this.targetService.addAssignedCommission(obj)
          .subscribe((response: any) => {
            this.loading = false;
            if (response.status === 200) {
              this.generalService.notification(
                "Commission assigned successfully!",
                "",
                "success"
              );
              this.commissionForm.reset();
              this.personComponent.refresh();
              this.getAssignedCommissions();
            } else {
              this.generalService.notification(response.error, "", "error");
            }
          },
            error => {
              this.loading = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
      }
    });
  }

  /**
   * Open SalesOrder
   * @param salesOrder 
   */
  openSalesOrder(salesOrderId) {
    this.router.navigate(["/sales/create-sales-order"], {
      queryParams: { salesOrder: salesOrderId },
    });
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    window.location.reload();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
