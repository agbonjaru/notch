import { OrgModel } from 'src/app/store/storeModels/user.model';
import { Endpoints } from './../../shared/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { TicketFilterModel } from './../../models/ticket/ticket.model';
import { Injectable } from '@angular/core';
import DateUtils from 'src/app/utils/date';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private api = this.endpoint.ticketUrl;
  private org: OrgModel;
  private date = new DateUtils;
  constructor(
    private http: HttpClient,
    private endpoint: Endpoints,
    private gs: GeneralService,
  ) { 
    this.org = this.gs.org
  }

  fetchHelpDeskStats(filter: TicketFilterModel) {
    return this.http.post(this.api + '/getHelpDeskStats', filter)
  }
  fetchTicketBy(type: string, filter: TicketFilterModel) {
    return this.http.post(this.api + `/getTicketsBy${type}`, filter)
  }
  fetchPerDist(dateFilter? :{endDate: any, startDate: any}) {
    const body = {
      ...this.date.getDateFilter(dateFilter),
      orgID: this.org.id,
      type: 3,
      id: ""
    }
    return this.http.post(this.api + '/getPerformanceDistribution' , body)
  }
  fetchReports(type: number, dateFilter? :{endDate: any, startDate: any}) {
    const body = {
      ...this.date.getDateFilter(dateFilter),
      type,
      id: '',
      orgID: this.org.id
    }
    return this.http.post(this.api + '/getReports', body)
  }
  fetchLifeCycle(payload) {
    const body = {
      ...payload,
      ...this.date.getDateFilter(payload),
    };
    return this.http.post(this.api + '/getTicketLifecycle', body)
  }


}
