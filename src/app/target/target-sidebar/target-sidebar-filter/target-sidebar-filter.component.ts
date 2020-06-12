import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { selectConfig } from 'src/app/utils/utils';
import { SalesPersonService } from 'src/app/services/crew-services/sales-person.service';
import { TargetService } from 'src/app/services/target.service';

@Component({
  selector: 'app-target-sidebar-filter',
  templateUrl: './target-sidebar-filter.component.html',
  styleUrls: ['./target-sidebar-filter.component.css']
})
export class TargetSidebarFilterComponent implements OnInit {
  @Input() filterData;
  @Input() filterIndex
  @Output() cancelFilter = new EventEmitter();
  @Output() getEditFilter = new EventEmitter();
  filterForm = {
    name: null,
    creator: null,
    target: null,
    period: null,
    target_type: null,
    from_amount: null,
    to_amount: null,
    from_date: null,
    to_date: null,
    teamId: '',
    creator_name: null,
    target_name: null,
    period_name: null,
    periodId: null
  };
  module;
  targetList$;
  periodList$;
  editLoading = false;
  targetTypeList$ = this.targetService.getTargetTypes();
  teamMemberList$ = this.salespersonSrv.fetchAllSalePersons();
  teamMemberList: any[];
  ownerCnfig = {
    ...selectConfig,
    displayKey: 'creator_name'
  };
  targetConfig = { 
    ...selectConfig,
    displayKey: 'title'
  };
  periodConfig = { ...selectConfig };
  targetTypeConfig = { ...selectConfig };

  constructor(
    private salespersonSrv: SalesPersonService,
    private targetService: TargetService
  ) {
    this.module = targetService.getActiveTargetModule();
    this.getTargets();
  }

  ngOnInit() {
    this.filterForm = this.filterData;
    if (this.filterData.from_date) 
      this.filterForm.from_date = new Date(this.filterData.from_date);
    if (this.filterData.to_date) 
      this.filterForm.to_date = new Date(this.filterData.to_date);
    if (this.filterData.creatorID && this.filterData.creator_name) {
      this.filterForm.creator = {
        creatorID: this.filterData.creatorID,
        creator_name: this.filterData.creator_name
      }
    }
    if (this.filterData.targetId && this.filterData.target_name) {
      this.filterForm.target = {
        id: this.filterData.targetId,
        title: this.filterData.target_name,
        period: this.filterData.periodId
      }
    }
    if (this.filterData.sub_periodId && this.filterData.period_name) 
      this.getSubPeriods();
  }

  getTargets() {
    this.targetService.getTargets()
      .subscribe((res: any) => {
        if (res.status === 200)
          this.targetList$ = res.response;
      });
  }
  
  getSubPeriods() {
    this.targetService.getSubPeriods(this.filterForm.target.period)
      .subscribe((res: any) => {
        if (res.status === 200)
          this.periodList$ = res.response;
          if (this.filterData.sub_periodId && this.filterData.period_name) {
            this.filterForm.period = {
              id: this.filterData.sub_periodId,
              name: this.filterData.period_name
            }
          }
      });
  }

  cancel = () => this.cancelFilter.emit(this.filterIndex);

  editFilter() {
    const filter = this.filterForm;
    delete filter.creator_name;
    delete filter.target_name;
    delete filter.period_name;
    delete filter.periodId;
    this.getEditFilter.emit(filter);
  }

  formatOwner = (data: any[]) => data.map(owner => ({ creatorID: owner.id, creator_name: owner.name }));
}
