import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';
import { TargetService } from 'src/app/services/target.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { exportTableToCSV, selectConfig } from 'src/app/utils/utils';
import { format } from 'date-fns';
import { CurrencyService } from 'src/app/services/currency.service';
import { CustomValidators } from 'ngx-custom-validators';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.css']
})
export class TargetsComponent implements OnInit {
  Id;
  baseCurrency;
  currencyList: any;
  targets: Array<{}> = [];
  periods: Observable<any>;
  _isCurrencyEnabled: boolean = true;
  targetForm: FormGroup;
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;
  loadingView = false;
  targetTypeList$ = this.targetService.getTargetTypesDropdown();
  targetTypeConfig = { 
    ...selectConfig,
    displayKey: 'description'
  };
  periodConfig = { 
    ...selectConfig,
    displayKey: 'description'
  };

  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "Target Title", key: "title" },
      { title: "Target Type", key: "type", 
        transform: fieldData => this.targetService.getTargetType(fieldData)['name']
      },
      { title: "Target Value", key: "value", pipe:'currency' },
      { title: "Period", key: "period_name" },
      { title: "Start Date", key: "start" },
      { title: "End Date", key: "end" },
      { title: 'Date Created', key: 'date_created' },
      { title: "Action", key: "action" }
    ],
    options: {
      datePipe: {},
      bulkActions: [],
      singleActions: [
        'View',
        'Edit',
        'Delete'
      ]
    }
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private currencySrv: CurrencyService,
    private targetService: TargetService,
    public generalService: GeneralService
  ) { }

  ngOnInit() {
    this.getTargets();
    this.getPeriods();
    this.createForm();
    this.setCurrencyValues();
    $.getScript('../../../assets/js/datatableScript.js');

    this.currencySrv.org_currencies.subscribe ( org_currencies => {
      if (!this.generalService.checkIfObjectIsEmpty(org_currencies)) {
        this.currencyList = this.generalService.convertObjectToArray(org_currencies.currencies);
        this.baseCurrency = org_currencies.base_currency;
      }
    });
  }

  dataFeedBackObsListener = data => {
    switch (data.type) {
      case "singleaction": {
        this.Id = data.data.id;
        if (data.action === 'View') {
          this.router.navigate(["/target/targets/" + data.data.id + '/company']);
        } else if (data.action === "Edit") {
          this.viewTarget(data.data);
        } else if (data.action === "Delete") {
          this.deleteTarget();
        }
        break;
      }
      default:
        break;
    }
  };

  clearFilter = () => this.getTargets();

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  setCurrencyValues = () => { if(this._isCurrencyEnabled) this.targetForm.controls.currency.setValue(this.baseCurrency) };

  getTargets(filter?) {
    this.loadingView = true;
    this.targetService.getTargets(
      this.targetService.convertObjectToQueryString(filter)
    ).subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        this.targets = res.response;
        this.dataTable.dataChangedObs.next(true);
        localStorage.targets = JSON.stringify(this.targets);
      }
    });
  }

  private getPeriods() {
    this.targetService.getPeriods()
    .subscribe((res: any) => {
      if (res.status === 200) {
        this.periods = new Observable(observer => {
          observer.next(res.response.map(e => {
            return {id: e.id, description: e.name};
         }));
        });
      }
    });
  }

  createForm() {
    this.targetForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      period: ['', Validators.required],
      type: ['', Validators.required],
      value: ['',
        [
          Validators.required,
          CustomValidators.number
        ]
      ],
      currency: ['']
    });
  }

  setCurrencyEnabledStatus() {
    this._isCurrencyEnabled = (
      this.targetForm.value.type.id === 'revenue' || 
      this.targetForm.value.type.id === 'markup' || 
      this.targetForm.value.type.id === 'product_revenue'
    )? true : false;
    if (this._isCurrencyEnabled) {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.number]);
    } else {
      this.targetForm.get('value').setValidators([Validators.required, CustomValidators.digits]);
    }
    this.targetForm.get('value').updateValueAndValidity();
  }

  openTargetModal() {
    this.Id = null;
    this.targetForm.reset();
    this.getPeriods();
    this.setCurrencyValues();
    //@ts-ignore
    document.querySelector("[data-target='#ModalCenter4'").click();
    this.targetTypeList$ = this.targetService.getTargetTypesDropdown();
  }

  async viewTarget(obj) {
    this.openTargetModal();
    const target = Object.assign({}, obj);
    this.Id = target.id;
    const periods: any = await this.periods.pipe(take(1)).toPromise();
    const types: any = await this.targetTypeList$.pipe(take(1)).toPromise();
    target.period = (periods.filter(e => {
      return e.id === Number(target.period);
    }))[0];
    target.type = (types.filter(e => {
      return e.id === target.type;
    }))[0];
    this.targetForm.patchValue(target);
    this.setCurrencyEnabledStatus();
  }

  saveTarget() {
    let targetDetails = this.targetForm.value;
    targetDetails.period = targetDetails.period.id;
    targetDetails.type = targetDetails.type.id;
    if(!this._isCurrencyEnabled)
      delete targetDetails.currency;
    $('#ModalCenter4 .close').click();
    return (this.Id)? this.updateTarget(targetDetails) : this.addTarget(targetDetails);
  }

  addTarget(targetDetails) {
    this.generalService.sweetAlertFileCreations('Target')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.addTarget(targetDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getTargets();
                this.targetForm.reset();
                this._isCurrencyEnabled = false;
              }
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  updateTarget(targetDetails) {
    this.generalService.sweetAlertFileUpdates('Target')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.updateTarget(this.Id, targetDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getTargets();
                this.targetForm.reset();
              }
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  deleteTarget() {
    this.generalService.sweetAlertFileDeletions('Target')
      .then(result => {
        if (result.value) {
          this.loadingView = true;
          this.targetService.deleteTarget(this.Id)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getTargets();
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }

  exportTable() {
    const exportName = `Notch Company Targets - ${format(Date.now(), 'MMM d, yyyy h.mm a')}`;
    const columns = [
      { title: "Target Title", value: "title" },
      { title: "Target Type", value: "type" },
      { title: "Target Value", value: "value" },
      { title: "Period", value: "period_name" },
      { title: "Start Date", value: "start" },
      { title: "End Date", value: "end" },
      { title: 'Date Created', value: 'date_created' }
    ];
    exportTableToCSV(this.targets, columns, exportName);
  }
}
