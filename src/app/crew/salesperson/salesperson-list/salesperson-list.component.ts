import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { GeneralService } from 'src/app/services/general.service';
import { TargetService } from 'src/app/services/target.service';
import { exportTableToCSV, selectConfig } from 'src/app/utils/utils';
import Swal from 'sweetalert2';
import { CustomValidators } from 'ngx-custom-validators';
import { SalespersonSiderbarComponent } from '../salesperson-siderbar/salesperson-siderbar.component';

@Component({
  selector: "app-salesperson-list",
  templateUrl: "./salesperson-list.component.html",
  styleUrls: ["./salesperson-list.component.css"]
})
export class SalespersonListComponent implements OnInit, OnDestroy {
  @ViewChild(SalespersonSiderbarComponent) salesPersonSidebar: SalespersonSiderbarComponent;

  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      // { title: "checkbox", key: "checkbox" },
      { title: "Salesperson Name", key: "name" },
      { title: "Email Address", key: "email" },
      { title: "No. of Deals", key: "totalNumberOfDeals" },
      // { title: "No. of Invoices", key: "noOfInvoice" },
      { title: "Deals Won", key: "noOfDealsWon" },
      { title: "Deals Lost", key: "noOfDealsLost" },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      singleActions: [
        "View",
        "Assign Commission",
        "Assign Target"
      ]
    }
  };

  private unsubscribe = new Subject<any>();
  salesPersonsList: any[];
  salesPerson;
  commission_accelerator;
  _isCurrencyEnabled: boolean = true;
  target_limit: Number = 0;
  commission_period_value: Number = 0;
  targetForm: FormGroup;
  commissionForm: FormGroup;
  loading: boolean = false;
  loadingView: boolean = false;
  targets: Observable<any>;
  commissions: Observable<any>;
  periods: Observable<any>;
  targetsV2: Observable<any>;
  assignPeriods: Observable<any>;
  assignedTargetsV2: Array<{}> = [];
  assignedCommissions: Array<{}> = [];
  targetList: Array<{}> = [];
  periodList: Array<{}> = [];
  commissionList: Array<{}> = [];
  selectedTarget;

  loader: any = {
    default: "notch-loader",
    // default: "sharp",
    spinnerType: "",
    spinnerStyle: {},
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load SalesPersons",
      success: true
    },
    showSpinner: false
  };

  targetStageList$ = this.targetService.getTargetStagesDropdown();
  targetStageConfig = {
    ...selectConfig,
    displayKey: 'description'
  };

  targetsConfig = {
    search: true,
    placeholder: "Select Target",
    limitTo: 10,
    noResultsFound: "No targets available!",
    searchPlaceholder: "search"
  };

  commissionsConfig = {
    search: true,
    placeholder: "Select Commissions",
    limitTo: 10,
    noResultsFound: "No commissions available!",
    searchPlaceholder: "search"
  };

  periodsConfig = {
    search: true,
    placeholder: "Select Periods",
    limitTo: 10,
    noResultsFound: "No periods available!",
    searchPlaceholder: "search"
  };

  fullList = "col-xl-12 col-lg-12 col-md-12";
  halfList = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.halfList;
  salesPersonFilters: any;

  constructor(
    private fb: FormBuilder,
    private targetService: TargetService,
    public generalService: GeneralService,
    private salepersonSrv: SalesPersonService,
    private router: Router
  ) {
    this.loader.spinnerType = this.loader.default;
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction":

        if (data.action === "View") {
          this.router.navigate(["/teams/salesperson/" + data.data.id]);

        }
        else if (data.action === "Assign Target") {
          //@ts-ignore
          document.querySelector("[data-target='#targetModal'").click()
          this.openAssignedTargetModal(data.data)
        }
        else if (data.action === "Assign Commission") {
          //@ts-ignore
          document.querySelector("[data-target='#commissionModal'").click()
          this.openAssignedCommissionModal(data.data)

        }

        break;

      default:

        break;
    }
  };

  ngOnInit() {
    this.generalService.showSpinner.next(false);
    this.getAllSalesPersons();
    this.createTargetForm();
    this.createCommissionForm();
    this.getTargets();
    this.getCommissions();
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
       this.salesPersonsList = data;
       this.loader.showSpinner = false;
     }
  }

  /**
   * Fetching all salesPerson in the organization
   */
  getAllSalesPersons() {
    this.loader.showSpinner = true;
    this.salepersonSrv
      .fetchAllSalePersons()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: any[]) => {
        this.initializeLoad(data);       
        this.dataTable.dataChangedObs.next(true);
      });
  }

  /**
   * Router To view a salesperson
   * @param saleperson 
   */
  openSaleperson(saleperson) {
    this.router.navigate(["/teams/salesperson", saleperson.id]);
  }

  /**
   * Toggling BUTTON FOR FILTER
   * @param type 
   */
  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.halfList : this.fullList;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  /**
 * Clean Filter List /SalesPerson Table to Normal List
 */
  async clearFilter() {
    await this.getAllSalesPersons();
    await this.salesPersonSidebar.getAllFilters();
  }

  /**
   * Filtering for Total Deals (RANGE)
   * @param invoice
   */
  getInvoiceFilter(invoice: FormGroup) {
    this.loading = true;
    this.salesPersonsList = null;
    this.salepersonSrv.FilteredSalesPersonsByNumberOfInvoices(invoice.value).subscribe((data: any) => {
      this.salesPersonsList = data;
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Filtering for Total Deals (RANGE)
   * @param deals 
   */
  getDealsFilter(deals: FormGroup) {
    this.loader.showSpinner = true;
    this.salesPersonsList = null;
    this.salepersonSrv.FilteredSalesPersonsDeals(deals.value).subscribe((data: any) => {
      this.loader.showSpinner = false;
      this.initializeLoad(data); 
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Filtering for Winning Deals (RANGE)
   * @param won 
   */
  getDealWonFilter(won: FormGroup) {
    this.loader.showSpinner = true;
    this.salesPersonsList = null;
    this.salepersonSrv.FilteredSalesPersonsByNumberOfDealsWon(won.value).subscribe((data: any) => {
      this.initializeLoad(data); 
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Filtering for Lost Deals (RANGE)
   * @param lost 
   */
  getDealLostFilter(lost: FormGroup) {
    this.loader.showSpinner = true;
    this.salesPersonsList = null;
    this.salepersonSrv.FilteredSalesPersonsByNumberOfDealsLost(lost.value).subscribe((data: any) => {    
      this.initializeLoad(data); 
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Filtered SalesPerson by id
   * @param id 
   */
  getFilteredSalesPersons(id) {
    this.loader.showSpinner = true;
    this.salepersonSrv.getFilteredSalesPersons(id).subscribe((data: any) => {
      this.initializeLoad(data); 
      this.dataTable.dataChangedObs.next(true);
    });
  }

  /**
   * Opening Assign Target Modal
   * @param obj 
   */
  openAssignedTargetModal(obj) {
    this.salesPerson = obj;
    this.selectedTarget = null;
  }

  /**
  * Opening Assign Commission Modal
  * @param obj
  */
  openAssignedCommissionModal(obj) {
    this.salesPerson = obj;
    this.selectedTarget = null;
    this.getAssignedCommissions();
    this.getAssignedTargetsV2();
  }

  /**
   * Get Targets
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
  * Get Commissions
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
  * Get Periods
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
  * Get Periods
  */
  getPeriods2() {
    const target = this.commissionForm.value.target;
    if (!target || !target.id) return;
    this.targetService
      .getAssignedPeriods(this.salesPerson.id, target.id)
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
  * Get Targets Limits
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
  * Get Assign Targets
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
              return { id: e.id, stage: e.stage, description: `${e.target} 
                (${this.targetService.getTargetType(e.type)['name']} -> ${this.targetService.getTargetStage(e.stage)['name']})` 
              };
            })
          );
        });
      });
  }

  /**
  * Get Assign Commissions
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
   * Target Count
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
   * Assign Target
   */
  assignTarget() {
    const targetDetails = this.targetForm.value;
    $("#targetModal .close").click();
    this.generalService.sweetAlertFileCreations("Target").then(res => {
      if (res.value) {
        let obj = {
          userId: this.salesPerson.id,
          targetId: targetDetails.target.id,
          sub_periodId: targetDetails.period.id,
          value: targetDetails.value
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
              this.getTargetLimit();
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
  * Reverse Assign Target
  * @param id
  */
  reverseAssignTarget(id) {
    $("#targetModal .close").click();
    this.generalService.sweetAlertFileDeletions("Target").then(result => {
      if (result.value) {
        this.targetService
          .deleteAssignedTarget(id, this.salesPerson.id)
          .subscribe(
            result2 => {
              if (result2) {
                Swal.fire(
                  "Deleted!",
                  "Your file has been deleted.",
                  "success"
                ).then(res => {
                  this.getTargetLimit();
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
  * Assign Commission
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
   * Reverse Assign Commission
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
   * Get Accelerator Threshold
   */
  getAcceleratorThreshold() {
    const commission_id = this.commissionForm.value.commission.id;
    if (commission_id) {
      this.commission_accelerator = this.commissionList.filter(e => {
        return e["id"] === Number(commission_id);
      })[0];
    }
  }

  checkAll() {
    if (this.salesPersonsList.every(val => val.isSelected == true))
      this.salesPersonsList.forEach(val => {
        val.isSelected = false;
      });
    else
      this.salesPersonsList.forEach(val => {
        val.isSelected = true;
      });
    this.dataTable.dataChangedObs.next(true);
  }

  onChangeCheckbox(salesperson) {
    this.salesPersonsList.filter(val => {
      if (val.id === salesperson.id && salesperson.isSelected == true)
        val.isSelected = false;
      else if (val.id === salesperson.id && salesperson.isSelected == false)
        val.isSelected = true;
    });
    this.dataTable.dataChangedObs.next(true);
  }

  /**
   * Exporting to CSV (EXCEL) for SalesPerson
   */
  exportTable() {
    const exportName = "salesperson-list-" + Date.now();
    const columns = [
      { title: "FullName", value: "name" },
      { title: "Official Email", value: "email" },
      { title: "No of Deals", value: "totalNumberOfDeals" },
      // { title: "No of Invoices", value: "noOfInvoice" },
      { title: "Deals Won", value: "noOfDealsWon" },
      { title: "Deals Lost", value: "noOfDealsLost" },
    ];
    exportTableToCSV(this.salesPersonsList, columns, exportName);
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    await this.getAllSalesPersons();
    await this.salesPersonSidebar.getAllFilters();
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