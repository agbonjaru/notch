import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { TargetService } from 'src/app/services/target.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CurrencyService } from 'src/app/services/currency.service';
import { selectConfig } from 'src/app/utils/utils';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-view-target',
  templateUrl: './view-target.component.html',
  styleUrls: ['./view-target.component.css']
})
export class ViewTargetComponent implements OnInit {
  stage = { id: null };
  type;
  targetId;
  targetType;
  targetStageList$;
  rate: Number = 0;
  target: Object = {};
  loadingView = false;
  committals: Object = {};
  _isCurrencyEnabled: Boolean = true;
  targetStageConfig = {
    ...selectConfig,
    displayKey: 'description'
  };
  targetGuageValues: Number[];

  constructor(
    private currencySrv: CurrencyService,
    private targetService: TargetService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.targetId = params.id;
      this.targetType = params.type;
      this.getTarget();
    });
  }

  ngOnInit() {
    $('.modal-backdrop').hide();
    $.getScript('../../../assets/js/datatableScript.js');
  }

  setCurrencyEnabledStatus() {
    this._isCurrencyEnabled = (
      this.target['type'] === 'revenue' || 
      this.target['type'] === 'markup' || 
      this.target['type'] === 'product_revenue'
    )? true : false;
  }

  async getTarget() {
    const targets_ = this.targetType === 'assigned'? localStorage.target_lists : localStorage.targets
    const targets = JSON.parse(targets_);
    this.target = (targets.filter(e => {
      return e.id === Number(this.targetId);
    }))[0];
    this.type = this.targetService.getTargetType(this.target['type'])['name'];
    if (this.targetType === 'assigned') {
      if (this.target['stage']) {
        this.targetStageList$ = this.targetService.getTargetStagesDropdown();
        const stages: any = await this.targetStageList$.pipe(take(1)).toPromise();
        this.stage = (stages.filter(e => {
          return e.id === this.target['stage'];
        }))[0];
      }
      this.getCommittals();
    } else {
      this.targetStageList$ = this.targetService.getTargetStagesDropdown(this.target['type']);
      const stages: any = await this.targetStageList$.pipe(take(1)).toPromise();
      if (!this.stage.id) this.stage = stages[0] || '';
      this.getCompanyCommittals();
    }
  }

  private async displayCommittals() {
    let salesperson_key = 'owner';
    let team_key = 'teamId';
    if (
      this.stage.id === 'invoice' || 
      this.stage.id === 'payment'
    ) {
      salesperson_key = 'createdBy';
    }
    if (
      this.stage.id === 'deal' || 
      this.stage.id === 'sales_order'
    ) {
      salesperson_key = 'creatorID';
      team_key = 'teamID';
    }
    this.setCurrencyEnabledStatus();
    if (this._isCurrencyEnabled) {
      this.committals['total'] = this.currencySrv.get_total_converted_value(this.committals['data'], 'amount');
      const currency_rate = this.currencySrv.get_conversion_rate(this.target['currency']);
      this.committals['total'] = this.committals['total'] * currency_rate;
    }
    this.committals['data'] = await this.targetService.updateArrayWithSalesPersonObj(salesperson_key, this.committals['data']);
    this.committals['data'] = await this.targetService.updateArrayWithTeamObj(team_key, this.committals['data']);
    this.rate = Number(((Number(this.committals['total'] || 0) / Number(this.target['value'])) * 100).toFixed(2));
    this.targetGuageValues = [(this.rate > 100)? 100 : this.rate];
  }

  private getCommittals() {
    let Id = this.target['userId'],
      start = this.target['start'],
      end = this.target['end'],
      type = this.target['type'],
      user_type = this.target['user_type'],
      stage = this.stage? this.stage.id : '';
    this.loadingView = true;
    this.targetService.getCommittals(user_type, type, Id, start, end, stage)
    .subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        this.committals = res.response;
        this.displayCommittals();
      }
    });
  }

  private getCompanyCommittals() {
    let Id = this.target['id'],
      start = this.target['start'],
      end = this.target['end'],
      type = this.target['type'],
      stage = this.stage? this.stage.id : '';
    this.loadingView = true;
    this.targetService.getCompanyCommittals(type, Id, start, end, stage)
    .subscribe((res: any) => {
      this.loadingView = false;
      if (res.status === 200) {
        this.committals = res.response;
        this.displayCommittals();
      }
    });
  }
}
