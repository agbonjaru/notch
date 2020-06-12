import { EventEmitter } from '@angular/core';
import { PipelineComponent } from '../../../../shared/components/pipeline/pipeline.component';
import { Component, OnInit, Input, Output } from '@angular/core';
import { DealModel } from 'src/app/models/deal.model';
import { Observable } from 'rxjs';
import { GeneralService } from 'src/app/services/general.service';
import { getCurrencySymbol } from 'src/app/utils/currency.util';
import { CurrencyService } from 'src/app/services/currency.service';

@Component({
  selector: 'app-deal-dashboard',
  templateUrl: './deal-dashboard.component.html',
  styleUrls: ['./deal-dashboard.component.css']
})
export class DealDashboardComponent implements OnInit {
  @Input() deals: DealModel[];
  @Input() teamId;
  @Output() emitDealWorkflow = new EventEmitter();
  dealList: DealModel[] = [];
  dealWon: number = 0;
  dealLost: number = 0;
  totalPipelineVal = 0
  ViewSwitch = 'List';
  dashBoardResult: any;
  baseCun
  constructor(
    private gs: GeneralService,
    private currencySrv: CurrencyService) {
   }

  ngOnInit() {
    this.currencySrv.org_currencies.subscribe( org_currencies => {
      if (!this.gs.checkIfObjectIsEmpty(org_currencies)) {
        this.baseCun = org_currencies.base_currency;
      }
    });

    this.getDeals()
  }
  getDeals() {
    this.dealList = this.deals;
    this.dealWon = this.dealList.filter(deal => deal.status === 2).length;
    this.dealLost = this.dealList.filter(deal => deal.status === 1).length;
    let value = this.dealList.filter(deal => deal.status === 0);
    this.totalPipelineVal = this.currencySrv.get_total_converted_value(value);
    // this.totalPipelineVal = value.reduce((curr, deal) =>  curr + (parseFloat(deal.amount) || 0), 0)
  }

  updateProcess({pipelineList, processName}) {
    let allDeals = [];
    if(pipelineList.length) {
      for (const pipeline of pipelineList) {
       allDeals.push(...pipeline.deals)
      }      
    }
    const pipelineDeal = allDeals.filter(deal => deal.status === 0);
    this.totalPipelineVal = this.currencySrv.get_total_converted_value(pipelineDeal);
    this.dealList = allDeals;
    this.emitDealWorkflow.emit({allDeals, processName});
    this.dealWon = this.dealList.filter(deal => deal.status === 2).length;
    this.dealLost = this.dealList.filter(deal => deal.status === 1).length;
  }
}
