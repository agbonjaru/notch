import { SidebarComponent } from './../../sidebar/sidebar.component';
import { CurrencyService } from './../../../services/currency.service';
import  DateUtils from 'src/app/utils/date';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import $ from 'jquery';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeneralService } from 'src/app/services/general.service';
import { SignupLoginService } from 'src/app/services/signupLogin.service';
import { exportTableToCSV } from 'src/app/utils/utils';

import { DealModel } from './../../../models/deal.model';
import { DealsService } from './../../../services/deals.service';
import { DashStatI } from 'src/app/shared/components/dash-stats/dash-stats.component';

@Component({
  selector: "app-deal-list",
  templateUrl: "./deal-list.component.html",
  styleUrls: ["./deal-list.component.css"]
})

export class DealListComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebar: SidebarComponent;
  dateUtils = new DateUtils;
  private unsubscribe = new Subject();
  dataSource: DashStatI[] = [
    {title: 'Total Deals', figure: 0, colorClass: 'text-secondary'},
    {title: 'Deals Won', figure: 0, colorClass: 'tx-teal'},
    {title: 'Deals Lost', figure: 0, colorClass: 'tx-danger'},
    {title: 'Pipeline Value', figure: 0, colorClass: 'tx-primary', pipe: 'currency'}
  ]
  filterMeta;
  dealList$: DealModel[];
  showSidebar = false;
  filteredDeal$;
  ViewSwitch = "Dashboard";
  dashboardStyle = "col-xl-12 col-lg-12 col-md-12";
  listStyle = "col-xl-10 col-lg-9 col-md-8";
  sidebarState = "open";
  mainStyle = this.listStyle;
  selectedTeamId = "";
  spinnerType = 'notch-loader';
  failedFunc: string;
  teamList$ = this.signupSrv.fetchSupervisorTeams();
  loadingWorkflow = false;
  baseCurrency
  constructor(
    private dealSrv: DealsService,
    private signupSrv: SignupLoginService,
    public gs: GeneralService,
    private router: Router,
    private currencySrv: CurrencyService,
    route: ActivatedRoute,
  ) {
    this.loadingWorkflow = false; 
    route.queryParams.subscribe(res => {
      if(res && res.view && res.view === 'List') {
        this.ViewSwitch = 'List'
      }
    })
    this.filterMeta = {value: 'createdDate', date: this.dateUtils.getInitDate()};
    this.filteredDeal$ = this.dealList$;
    this.selectedTeamId =  this.gs.user.teamID || '';
  }

  ngOnInit() {
    this.currencySrv.org_currencies.subscribe(org_currencies => {
      this.baseCurrency = org_currencies && org_currencies.base_currency ? org_currencies.base_currency : '';
    })
    this.gs.showSpinner.next(false);
    this.gs.emitWorkflowId.pipe(takeUntil(this.unsubscribe)).subscribe(res => {
      console.log('deal list emit workflow');
      
      if(res) {
        this.loadingWorkflow = true;
      } else {
        this.loadingWorkflow = false;
      }
      
    })
    this.getDeals();
  }
  getTeamsdeal(id) {
    this.selectedTeamId = id;
    this.getDeals(id);
  }
  reloadGetDeals(){
    this.spinnerType = 'notch-loader';
    console.log(this.filterMeta);
    
    if(this.failedFunc === 'getFilteredDeals') {
      this.getFilteredDeals(this.filterMeta)
    } else {
      this.getDeals();
    }
  }
  getDeals(teamId?, filter?) {
    this.dealList$ = null;
    this.spinnerType = 'notch-loader'
    this.dealSrv
      .fetchDeals((teamId = this.selectedTeamId), filter)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((data: DealModel[]) => {
        this.dealList$ = data;
        if(this.sidebar) {
          this.sidebar.getFilters();
        }
        this.updateDashData(this.dealList$)
        $.getScript("../../../assets/js/datatableScript.js");
      }, err => {
        this.spinnerType = 'errorCard'
      });
  }
  
  clearFilter() {
    this.filterMeta = {value: 'createdDate', date: this.dateUtils.getInitDate()};
    this.getDeals();
  }
  //Pipeline
  updateProcess({pipelineList, processName}) {
    let allDeals = [];
    if(pipelineList.length) {
      for (const pipeline of pipelineList) {
       allDeals.push(...pipeline.deals)
      }      
    }
    this.dealList$ = allDeals
    this.updateDashData(this.dealList$);
  }
  updateDashData(allDeals:any[]) {
    const pipelineDeal = allDeals.filter(deal => deal.status === 0);
    const pipelineValue = this.currencySrv.get_total_converted_value(pipelineDeal);
    const total = allDeals.length;
    const won = allDeals.filter(deal => deal.status === 2).length;
    const lost = allDeals.filter(deal => deal.status === 1).length;
    this.dataSource[0].figure = total;
    this.dataSource[1].figure = won;
    this.dataSource[2].figure = lost;
    this.dataSource[3].figure = pipelineValue;
  }

  addDeal() {
    if (this.selectedTeamId) {
      this.router.navigate(['/sales/create-deals'])
    } else {
      this.gs.sweetAlertFieldValidatio('You need to be part of a team');
    }
  }

  changeTeam() { }
  handleViewSwitch(view) {
    this.ViewSwitch = view;
    // this.mainStyle = this.ViewSwitch==='List'? this.listStyle : this.dashboardStyle;
    if(view === 'List') {
      this.filterMeta = {value: 'createdDate', date: this.dateUtils.getInitDate()};
    }
  }

  toggleSidebar(type) {
    this.mainStyle = type === "open" ? this.listStyle : this.dashboardStyle;
    this.sidebarState = type === "open" ? "open" : "close";
  }

  getCreatedOnFilter(dateFilter: FormGroup) {
    if (dateFilter.valid) {
      this.filterMeta = {value: 'createdDate', date: dateFilter.value};
      this.getDeals(null, { dateFilter: dateFilter.value });
    }
  }

  getDealOwnerFilter(dealOwnerFilter: FormGroup) {
    if (dealOwnerFilter.valid) {
      this.filterMeta = {value: 'owner', ownBy: dealOwnerFilter.value.owner.name}
      this.getDeals(null, { creatorId: { owner: dealOwnerFilter.value.owner.id } });
    }
  }
  getDealStatusFilter(value) {
    this.getDeals(null, {status: value})    
  }

  getClientFilter(clientFilter: FormGroup) {
    if (clientFilter.valid) {
      this.filterMeta = {value: 'client', client: clientFilter.value.client.name}
      this.getDeals(null, { client: clientFilter.value });
    }
  }

  getDateFilter(dateFilter: FormGroup) {
    if (dateFilter.valid) {
      this.filterMeta = {value: 'closeDate', date: dateFilter.value};
      this.getDeals(null, { closeDate: dateFilter.value });
    }
  }

  getDealValueFilter(dealValueFilter: FormGroup) {
    if (dealValueFilter.valid) {
      this.dealList$ = null;
      this.spinnerType = 'notch-loader';
      this.filterMeta = {value: 'value', range: dealValueFilter.value}
      const {to, from } = dealValueFilter.value;
      let query = this.currencySrv.get_currency_range_query_string(this.baseCurrency, from, to);
      query = `range=${query}&itemType=Deals`
      this.currencySrv.filter_organisation_currencies(query).subscribe(res => {
        if(res.payload.length) {
          const ids = res.payload.map(data => data.itemId);
          this.getMultiDeals(ids)
        } else {
          this.dealList$ = []
          this.updateDashData(this.dealList$)
        }
      })
    }
  }
  
  getwinProbFilter(filter: FormGroup) {
    if (filter.valid) {
      this.filterMeta = {value: 'winProb', range: filter.value}
      this.getDeals(null, { winPro: filter.value });
    }
  }

  getProfileScoreFilter(filter: FormGroup) {
    if (filter.valid) {
      this.filterMeta = {value: 'profileScore', range: filter.value}
      this.getDeals(null, { profileScore: filter.value });
    }
  }
  updateDealWorkflow({allDeals, processName}) {
    console.log('stop load');
    this.loadingWorkflow = false;
    this.dealList$ = allDeals
    this.filterMeta = {value: 'workflow', processName}
  }
  getFilteredDeals(filter) {
    this.dealList$ = null;
    this.spinnerType = 'notch-loader'
    if (filter) {
      this.filterMeta = {value: 'customFilter', name: filter.name, id: filter.id}
      this.dealSrv
        .fetchFilteredDeals(filter.id)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((data: DealModel[]) => {
          this.dealList$ = data;
          this.updateDashData(this.dealList$);
          $.getScript("../../../assets/js/datatableScript.js");
        }, err => {
          this.failedFunc = 'getFilteredDeals';
          this.spinnerType = 'errorCard'
        });
    }
  }
  getMultiDeals(ids: any[]) {
    this.dealSrv.fetchMultiDeals(ids).subscribe((res: any) => {
      this.dealList$ = res;
      this.updateDashData(this.dealList$);
    }, () => {
      this.failedFunc = 'getMultiDeals';
      this.spinnerType = 'errorCard'
    })
  }


  exportTable(filename) {
    if(this.dealList$.length) {
      const columns = [
        { title: "Deal Name", value: "name" },
        { title: "Deal Owner", value: "source", },
        { title: "Deal Client", value: "clientName", },
        { title: "Amount", value: "amount"},
        { title: "Stage", value: "currStage", },
        { title: "Created Date", value: "createdDate"},
        { title: "Close Date", value: "closeDate"},
      ];
      const filteredDeals = this.dealList$.map(deal => ({...deal, amount: `${deal.currency}${deal.amount}`}))
      exportTableToCSV(filteredDeals, columns, "deals");
    } else {
      this.gs.sweetAlertFieldValidatio('No Data to Export')
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
