import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { GeneralService } from 'src/app/services/general.service';
import { selectConfig } from 'src/app/utils/utils';
import { NgForm } from '@angular/forms';
import { format } from 'date-fns';
import { TargetSidebarFilterComponent } from './target-sidebar-filter/target-sidebar-filter.component';
import { TargetService } from 'src/app/services/target.service';

@Component({
  selector: 'app-target-sidebar',
  templateUrl: './target-sidebar.component.html',
  styleUrls: ['./target-sidebar.component.css']
})
export class TargetSidebarComponent implements OnInit {
  @Output() getFilter = new EventEmitter();
  @Output() toggleSidebar = new EventEmitter();
  @Output() getClearFilter = new EventEmitter();
  @ViewChild(TargetSidebarFilterComponent) targetSidebarFilter: TargetSidebarFilterComponent;
  @ViewChild('createdForm') createdForm: NgForm;
  @ViewChild('targetForm') targetForm: NgForm;
  @ViewChild('valueForm') valueForm: NgForm;
  @ViewChild('filterX') filterX: NgForm;
  orgId;
  teamId;
  module;
  filterList$;
  targetList$;
  periodList$;
  targetTypeList$ = this.targetService.getTargetTypes();
  teamMemberList$ = this.salespersonSrv.fetchAllSalePersons();
  ownerConfig = { ...selectConfig };
  targetConfig = { 
    ...selectConfig,
    displayKey: 'title'
  };
  periodConfig = { ...selectConfig };
  targetTypeConfig = { ...selectConfig };

  creator;
  target_type;
  createLoading = false;
  filterForm = {
    name: null,
    creator: null,
    target: null,
    period: null,
    target_type: null,
    from_amount: null,
    to_amount: null,
    from_date: null,
    to_date: null
  };
  showFilter = null;

  constructor(
    private salespersonSrv: SalesPersonService,
    private targetService: TargetService,
    private gs: GeneralService
  ) {
    this.orgId = gs.org.id;
    this.teamId = gs.user.teamID;
    this.module = targetService.getActiveTargetModule();
    this.filterList$ = targetService.getTargetFilters(this.teamId, this.module);
  }

  ngOnInit() {
    this.getTargets();
  }

  toggle = type => this.toggleSidebar.emit(type);
  
  getTargets() {
    this.targetService.getTargets()
      .subscribe((res: any) => {
        if (res.status === 200)
          this.targetList$ = res.response;
      });
  }
  
  getSubPeriods() {
    this.targetService.getSubPeriods(this.targetForm.value.target.period)
      .subscribe((res: any) => {
        if (res.status === 200)
          this.periodList$ = res.response;
      });
  }
  
  getSubPeriods2() {
    this.targetService.getSubPeriods(this.filterForm.target.period)
      .subscribe((res: any) => {
        if (res.status === 200)
          this.periodList$ = res.response;
      });
  }

  clearFilter() {
    const resetForm = []
    if(this.createdForm) resetForm.push(this.createdForm);
    if(this.valueForm) resetForm.push(this.valueForm);
    if(this.targetForm) resetForm.push(this.targetForm);
    if(this.filterX) resetForm.push(this.filterX);
    this.creator = '';
    this.target_type = '';
    resetForm.forEach(form => form.reset())
    this.getFilter.emit();
  }

  OwnerFilter = () => this.getFilter.emit({ userId: this.creator.id });

  TypeFilter = () => this.getFilter.emit({ type: this.target_type.value });

  createdOnFilter(date) {
    date.startDate = format(new Date(date.startDate), "yyyy-MM-dd");
    date.endDate = format(new Date(date.endDate), "yyyy-MM-dd");
    this.getFilter.emit(date)
  };

  TargetFilter(data) {
    let payload = {
      target: data.target.id,
      sub_period: data.period.id || ''
    };
    this.getFilter.emit(payload)
  };

  ValueFilter = value => this.getFilter.emit(value);

  createFilter() {
    const payload = {
      ...this.filterForm,
      orgId: this.orgId,
      teamId: this.teamId,
      module: this.module
    }
    if (this.filterForm.creator)
      payload['creatorId'] = this.filterForm.creator.id;
    if (this.filterForm.target)
      payload['targetId'] = this.filterForm.target.id;
    if (this.filterForm.period)
      payload['sub_periodId'] = this.filterForm.period.id;
    if (this.filterForm.target_type)
      payload.target_type = this.filterForm.target_type.value;
    if (this.filterForm.from_date) 
      payload.from_date = format(this.filterForm.from_date, "yyyy-MM-dd");
    if (this.filterForm.to_date) 
      payload.to_date = format(this.filterForm.to_date, "yyyy-MM-dd");
    delete payload.creator;
    delete payload.target;
    delete payload.period;
    this.createLoading = true;
    this.targetService.addTargetFilter(payload).subscribe(
      (res: any) => {
        this.filterX.reset();
        this.createLoading = false;
        this.targetTypeList$ = this.targetService.getTargetTypes();
        this.teamMemberList$ = this.salespersonSrv.fetchAllSalePersons();
        this.filterList$ = this.targetService.getTargetFilters(this.teamId, this.module);
        this.gs.sweetAlertSucess(res.message);
      },
      error => {
        this.createLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(error));
      }
    );
  }

  customFilter(data) {
    let filter = {};
    if (data.creatorId) filter['userId'] = data.creatorId;
    if (data.targetId) filter['target'] = data.targetId;
    if (data.sub_periodId) filter['sub_period'] = data.sub_periodId;
    if (data.target_type) filter['type'] = data.target_type;
    if (data.from_amount) filter['fromValue'] = data.from_amount;
    if (data.to_amount) filter['toValue'] = data.to_amount;
    if (data.from_date) filter['startDate'] = data.from_date;
    if (data.to_date) filter['endDate'] = data.to_date;
    this.getFilter.emit(filter);
  }

  activateEdit(index) {
    document.getElementById(`collapseHead-${index}`).click();
  }

  editFilter(index) {
    this.showFilter = index;
  }

  cancelFilter(index) {
    this.showFilter = !index;
  }

  getEditFilter(data) {
    const payload = {
      ...data,
      orgId: this.orgId,
      teamId: this.teamId,
      module: this.module
    }
    if (data.creator)
      payload['creatorId'] = data.creator.id;
    if (data.target)
      payload['targetId'] = data.target.id;
    if (data.period)
      payload['sub_periodId'] = data.period.id;
    if (data.target_type)
      payload.target_type = data.target_type.value;
    delete payload.creator;
    delete payload.target;
    delete payload.period;
    this.targetSidebarFilter.editLoading = true;
    this.targetService.updateTargetFilter(data.id, payload).subscribe(
      (res: any) => {
        this.cancelFilter(0);
        this.targetSidebarFilter.editLoading = false;
        this.filterList$ = this.targetService.getTargetFilters(this.teamId, this.module);
        this.gs.sweetAlertSucess(res.message);
      },
      error => {
        this.targetSidebarFilter.editLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(error));
      }
    );
  }

  deleteFilter(filter) {
    this.gs.sweetAlertFileDeletions(`${filter.name} Filter`).then(res => {
      if (res.value) {
        this.targetService.deleteTargetFilter(filter.id).subscribe(
          (res: any) => {
            this.filterList$ = this.targetService.getTargetFilters(this.teamId, this.module);
            this.gs.sweetAlertSucess(res.message);
          },
          error => {
            this.gs.sweetAlertError(this.gs.getErrMsg(error));
          }
        );
      }
    });
  }
}
