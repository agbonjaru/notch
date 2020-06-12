import { forkJoin } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TicketFilterModel } from './../../../models/ticket/ticket.model';
import { OrgModel } from './../../../store/storeModels/user.model';
import { ReportService } from './../../../services/ticket/report.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import DateUtils from 'src/app/utils/date';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-helpdesk',
  templateUrl: './helpdesk.component.html',
  styleUrls: ['./helpdesk.component.css']
})
export class HelpdeskComponent implements OnInit, OnDestroy {
  private unsubscribe = new Subject();
  private org: OrgModel;
  public date = new DateUtils;
  startDate = new Date(this.date.getPrvMntTs()).toJSON().split('T')[0];
  endDate =new Date(this.date.getCurrentTs()).toJSON().split('T')[0];
  dateFilterLoading = false;
  private filter: TicketFilterModel;
  helpStatsList: any[];
  sourceList;
  priorityList;
  statusList;
  typeList;
  showFilter = false;
  constructor(
    private reportSrv: ReportService,
    private gs: GeneralService) {
      this.org = this.gs.org
      this.filter = {
        orgID: this.org.id,
        endDate: this.date.getCurrentTs(),
        startDate: this.date.getPrvMntTs(),
        id: '',
        type: 3
      };
    }

  ngOnInit() {
    this.getData(this.filter);
  }
  get loading() {
    return this.helpStatsList && this.sourceList && 
    this.priorityList && this.statusList && this.typeList;
  }
  toPercent(num, lists?: any[]) {
    if(lists && lists.length) {
      const total = lists.map(list => parseInt(list.total)).reduce((prev, current) => prev + current)
      const percent = (num/total) * 100;
      return Number(percent) + '%';
    } else {
      return Number(num) + '%'
    }    
  }
  toggle() {
    this.showFilter = !this.showFilter;
  }
  getData(filter) {
    forkJoin( this.reportSrv.fetchHelpDeskStats(filter), this.reportSrv.fetchTicketBy('Source', filter),
    this.reportSrv.fetchTicketBy('Priority', filter), this.reportSrv.fetchTicketBy('Status', filter),
    this.reportSrv.fetchTicketBy('Type', filter),
            ).pipe(map(([helpstat, source, priority, status, type]) => {
      return { helpstat, source, priority, status, type}
    })).subscribe((res: any) => {
      const {helpstat, source, priority, status, type } = res;
      this.helpStatsList = helpstat;
      this.sourceList = source;
      this.priorityList = priority;
      this.statusList = status;
      this.typeList = type;
    }).add(() => {
      this.dateFilterLoading = false;
    })


  }
  getHelpStats(filter) {
    this.reportSrv.fetchHelpDeskStats(filter).pipe(takeUntil(this.unsubscribe))
    .subscribe((res: any[]) => this.helpStatsList = res);
  }
  getTicketBySource(filter) {
    this.reportSrv.fetchTicketBy('Source', filter).pipe(takeUntil(this.unsubscribe))
    .subscribe(res => this.sourceList = res);
  }
  getTicketByPriority(filter) {
    this.reportSrv.fetchTicketBy('Priority', filter).pipe(takeUntil(this.unsubscribe))
    .subscribe(res => this.priorityList = res);
  }
  getTicketByStatus(filter) {
    this.reportSrv.fetchTicketBy('Status', filter).pipe(takeUntil(this.unsubscribe))
    .subscribe(res => this.statusList = res);
  }
  getTicketByType(filter) {
    this.reportSrv.fetchTicketBy('Type', filter).pipe(takeUntil(this.unsubscribe))
    .subscribe(res => this.typeList = res);
  }

  filterDate(date) {
    console.log(date);
    
    const newFilter = {
      ...this.filter,
      ...date
    }
    // this.helpStatsList = this.sourceList =
    // this.priorityList = this.statusList =
    // this.typeList = null;
    this.dateFilterLoading = true;
    this.getData(newFilter);
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
