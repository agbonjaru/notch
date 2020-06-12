import { CurrencyService } from './../../../services/currency.service';
import { Component, OnInit, Input } from '@angular/core';

export interface DashStatI{
  title: string;
  figure: number;
  colorClass: 'text-secondary'|'tx-teal'|'tx-danger'|'tx-primary'
  pipe?: any
}

@Component({
  selector: 'app-dash-stats',
  templateUrl: './dash-stats.component.html',
  styleUrls: ['./dash-stats.component.css']
})
export class DashStatsComponent implements OnInit {
  @Input() dataSource: DashStatI[] = [];
  baseCurrency = '';
  constructor(private currenySrv: CurrencyService) {
    this.currenySrv.org_currencies.subscribe( org_currencies => {
      this.baseCurrency = org_currencies && org_currencies.base_currency ? org_currencies.base_currency : '';   
    })
   }

  ngOnInit() {
  }

}
