import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';
import { TargetService } from 'src/app/services/target.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { addDays, isLeapYear, format } from 'date-fns';
import { exportTableToCSV } from 'src/app/utils/utils';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css']
})
export class PeriodComponent implements OnInit {
  dataTable = {
    dataChangedObs:  new BehaviorSubject(null),
    heads : [
      {title: 'ID', key: 'id', transform: (a,b) => {
        return a;
      }},
      {title: 'Title', key: 'name'},
      {title: 'Start Date', key: 'start'},
      {title: 'End Date', key: 'end'},
      {title: 'Sub Period', key: 'type'},
      {title: 'Date Created', key: 'date_created'},
      {title: 'Action', key: 'action'}
    ],
    options :{
      bulkActions: [],
      singleActions: [
        'View/Edit Period',
        'View Sub Periods'
      ]
    }
  }
  Id;
  period = {};
  bsValue: Date = null;
  bsValue2: Date = null;
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  periods: Array<{}> = [];
  periodForm: FormGroup;
  loadingView = false;
  sub_periods: Array<{}> = [];
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;

  constructor(
    private fb: FormBuilder,
    private targetService: TargetService,
    public generalService: GeneralService
  ) {}

  ngOnInit() {
    this.generalService.showSpinner.next(false)
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode
    });
    this.getPeriods();
    this.createForm();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  dataFeedBackObsListener = (data) => {
    switch (data.type) {
      case 'singleaction': {
        this.Id = data.data.id;
        this.period = data.data;
        if(data.action === 'View/Edit Period') {
          this.viewPeriod(this.period);
        } else if(data.action === 'Delete Period') {
          this.deletePeriod();
        } else if(data.action === 'View Sub Periods') {
          this.showSubPeriods();
        }
        break;
      }
      default:
        break;
    }
  }

  clearFilter = () => this.getPeriods();

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  setPeriodEnd(event) {
    if (event) {
      let annual_days = 364;
      const start = new Date(event);
      if (isLeapYear(start)) annual_days = 365;
      this.bsValue2 = new Date(addDays(start, annual_days));
    }
  }

  getPeriods(filter?) {
    this.loadingView = true;
    this.targetService.getPeriods(
      this.targetService.convertObjectToQueryString(filter)
    ).subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200)
        this.periods = res.response;
        this.dataTable.dataChangedObs.next(true)
    });
  }

  createForm() {
    this.periodForm = this.fb.group({
      name: ['', Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required],
      type: ['', Validators.required]
    });
  }

  openPeriodModal() {
    this.Id = null;
    this.periodForm.reset();
    //@ts-ignore
    document.querySelector("[data-target='#ModalCenter4'").click();
  }

  viewPeriod(obj) {
    this.openPeriodModal();
    const period = Object.assign({}, obj);
    this.Id = period.id;
    this.bsValue = new Date(period.start);
    this.bsValue2 = new Date(period.end);
    delete period.start;
    delete period.end;
    this.periodForm.patchValue(period);
  }

  savePeriod() {
    let periodDetails = this.periodForm.value;
    periodDetails.start = format(periodDetails.start, "yyyy-MM-dd");
    periodDetails.end = format(periodDetails.end, "yyyy-MM-dd");
    $('#ModalCenter4 .close').click();
    return (this.Id)? this.updatePeriod(periodDetails) : this.addPeriod(periodDetails);
  }

  addPeriod(periodDetails) {
    this.generalService.sweetAlertFileCreations('Period')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.addPeriod(periodDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getPeriods();
                this.periodForm.reset();
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

  updatePeriod(periodDetails) {
    this.generalService.sweetAlertFileUpdates('Period')
      .then(res => {
        if (res.value) {
          this.loadingView = true;
          this.targetService.updatePeriod(this.Id, periodDetails)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200) {
                this.getPeriods();
                this.periodForm.reset();
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

  deletePeriod() {
    this.generalService.sweetAlertFileDeletions('Period')
      .then(result => {
        if (result.value) {
          this.targetService.deletePeriod(this.Id)
            .subscribe((response: any) => {
              this.loadingView = false;
              if (response.status === 200)
                this.getPeriods();
            },
            error => {
              this.loadingView = false;
              this.generalService.sweetAlertError(this.generalService.getErrMsg(error));
            }
          );
        }
      });
  }
  
  showSubPeriods() {
    this.loadingView = true;
    this.targetService.getSubPeriods(this.Id)
      .subscribe((res: any) => {
        this.loadingView = false;
        if (res.status === 200)
          this.sub_periods = res.response;
        //@ts-ignore
        document.querySelector("[data-target='#SubPeriodsModal'").click();
      });
  }

  exportTable() {
    const exportName = `Notch Periods List - ${format(Date.now(), 'MMM d, yyyy h.mm a')}`;
    const columns = [
      { title: "Id", value: "id" },
      { title: "Title", value: "name" },
      { title: "Start Date", value: "start" },
      { title: "End Date", value: "end" },
      { title: "Sub Period", value: "type" },
      { title: 'Date Created', value: 'date_created' }
    ];
    exportTableToCSV(this.periods, columns, exportName);
  }
}