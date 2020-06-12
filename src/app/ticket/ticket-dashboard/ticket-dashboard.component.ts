import { Router } from '@angular/router';
import { TicketStatModel } from './../../models/ticket/ticket.model';
import { TicketService } from './../../services/ticket/ticket.service';
import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-ticket-dashboard',
  templateUrl: './ticket-dashboard.component.html',
  styleUrls: ['./ticket-dashboard.component.css']
})
export class TicketDashboardComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  todoList;
  unresolvedTikList;
  graphStats;
  customerStats;
  generalStats;
  statsData = {id: this.gs.user.id, type: 3}
  dateFormat = 'days'
  public chartLabel = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  public chartLegend = true;
  public chartData = [
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'New Tickets' , backgroundColor: 'rgb(6,102,198, 0.7)'},
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Closed Tickets',  backgroundColor: 'rgb(75,176,154, 0.8)' },
    { data: [0, 0, 0, 0, 0, 0, 0], label: 'Resolved Tickets' , backgroundColor: 'rgb(221,68,69,0.6)' }
  ];
  constructor(
    private ticketSrv: TicketService,
    private router: Router,
    private gs: GeneralService) {
      this.statsData.id = this.gs.user.id;
   }

  ngOnInit() {
    this.gs.showSpinner.next(false)
    this.getGraphStat(null);
    this.getTodo();
    this.getUnresTick();
    this.getGeneralStats();
    this.getCustomerStats();
  }
  get pageLoading() {
    return this.todoList && this.unresolvedTikList;
  }
  getTodo() {
    this.ticketSrv.getTodo({id: 0, type: 2}).subscribe(res => {
      this.todoList = res;
    })
  }
  getUnresTick() {
    this.ticketSrv.getUnresolvedTicket().subscribe(res => {
      this.unresolvedTikList = res;
    })
  }
  getGraphStat(dateFilter, year= this.selectedYear) {
    this.graphStats = false;
    // if(dateFilter) {
    //   this.setDateFormat(dateFilter)
    // }
    this.ticketSrv.fetchGraphStat(dateFilter,year).subscribe((res: any[]) => {
      if(res.length) {
        const data = {newTicket: [], closedTicket: [], resolvedTicket: [],  months: []}
        res.forEach(res => {
          if(res.month){
            if(res.type === 'New Tickets') {
              data.newTicket.push(Number(res.total))
            } else if(res.type === 'Closed Tickets') {
              data.closedTicket.push(Number(res.total))
            } else if(res.type === 'Resolved Tickets') {
              data.resolvedTicket.push(Number(res.total))
            }
          }
        })                    
        // this.chartLabel = data.months;
        this.chartData[0].data = data.newTicket
        this.chartData[1].data = data.closedTicket
        this.chartData[2].data = data.resolvedTicket
      }
       this.graphStats = true;
    })
  }
  getCustomerStats() {
    this.ticketSrv.fetchCustomerSatifyDashStats({type:3,id:0}).subscribe(res => {
      this.customerStats = res;
    })
  }
  getGeneralStats() {
    this.ticketSrv.fetchGeneralStats().subscribe(res => {
      this.generalStats = res;
    })
  }
  markTodo(id) {
    this.gs.sweetAlertUpdates('Mark Todo As Done').then(result => {
      if(result.value) {
        this.ticketSrv.saveTodoAsDone(id).subscribe(res => {
          this.gs.sweetAlertSucess('Todo Mark As Done');
          this.getTodo();
        }, err => {
          alert('Error occured try again')
        })
      } else {
        this.getTodo();
      }
    })
  }
  submitYear(filter) {
      this.getGraphStat(filter, this.selectedYear)
  }
  setDateFormat(dateFilter) {
    const { endDate, startDate } = dateFilter;
    const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
    if(timeDiff <= 86400000) {
      this.dateFormat = 'time'
    } else {
      this.dateFormat = 'day'
    }
  }
  getTimeFormat(date) {
    if(this.dateFormat === 'time') {
      return this.getTime(date)
    } else {
      return this.getDay(date)
    }
  }
  getTime = (date) => new Date(date).toLocaleTimeString()
  getDay = (date) => new Date(date).toDateString()
  openComment(type) {
    this.router.navigate(['/ticket/Customer-Survey-Comments', type])
  }


}
