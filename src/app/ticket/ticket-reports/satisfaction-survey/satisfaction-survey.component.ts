import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { TicketService } from 'src/app/services/ticket/ticket.service';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
  styleUrls: ['./satisfaction-survey.component.css']
})
export class SatisfactionSurveyComponent implements OnInit {
  overviewList;
  reportList: {groups: any[], agents: any[]}
  constructor(
    private ticketSrv: TicketService,
    private gs: GeneralService) {}

  ngOnInit() {
    this.getOverview();
    this.getReport();
  }
  getOverview() {
    this.ticketSrv.fetchCustomerSatifyDashStats({id: 0, type: 3}).subscribe(res => {
      this.overviewList = res;
    })
  }
  getReport(filter?) {
    this.reportList = null;
    this.ticketSrv.fetchCustomerSatReport(filter).subscribe((results : any[]) => {
      const data = {groups: [], agents: []}
      results.forEach(res => {
        if(res.type === 1) {
          data.agents.push(res)
        } else {
          data.groups.push(res)
        }
      })
      this.reportList = data;
      $.getScript('/assets/js/datatableScript.js')
    })
  }
  toPercent(num) {
    const newList:any[] = Object.values(this.overviewList).map(field => field).slice(0, 5);
    if(newList && newList.length) {
      const total = newList.reduce((prev, current) => prev + current);
      const percent = (num/total) * 100;
      return Number(percent) + '%';
    } else {
      return Number(num) + '%'
    }    
  }
  toggle() {
    // $.getScript('/assets/js/datatableScript.js')
  }
}