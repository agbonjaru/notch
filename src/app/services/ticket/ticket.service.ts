import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DateUtils from 'src/app/utils/date';
import { environment } from 'src/environments/environment';

import { GeneralService } from '../general.service';
import { TicketModel } from './../../models/ticket/ticket.model';
import { Endpoints } from './../../shared/config/endpoints';
import { OrgModel, UserModel } from './../../store/storeModels/user.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private api = this.endpoint.ticketUrl;
  private websiteUrl = environment.notchWebsite;
  private signupApi = this.endpoint.signUpEndpoint;
  private chatUrl = environment.chatServiceUrl;
  private newDate = new DateUtils;
  private user: UserModel;
  private org: OrgModel
  private powerBy = `<footer style="margin-top: 50px">
  <b>Powered by <a href="${this.websiteUrl}">NotchCX</a></b></footer>`
  private group: { id: any, name: string } = { id: '', name: '' };
  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService) {
    this.user = this.gs.user;
    this.org = this.gs.org;
    if (this.user.groupID) {
      this.group = { id: this.user.groupID, name: this.user.groupName }
    }
  }


  createTicket(payload) {
    const body = {
      ...payload,
      clientID: payload.clientName.id,
      clientName: payload.clientName.name,
      sender: payload.clientName.email,
      agentID: this.user.id,
      groupID: this.group.id,
      lastResponse: this.newDate.getCurrentTs(),
      dueDate: this.newDate.getTimeStp(payload.dueDate),
      orgID: this.org.id,
      agentName: this.user.firstName + ' ' + this.user.lastName,
      groupName: this.group.name,
      agentPix: this.user.userImg
    }
    return this.http.post(this.api + '/newTicket', body);
  }

  fetchTicket(data: { id: any, type: any , date?: {endDate: any, startDate: any}}) {
    const payload = {
      ...this.newDate.getDateFilter(data.date),
      id: data && data.id ? data.id : this.group.id,
      orgID: this.org.id,
      type: data.type
    }
    return this.http.post(this.api + '/getTickets', payload)
  }
  fetchFilteredTickets(by, payload: {date: any, mode: any}) {
    const body = {
      ...this.newDate.getDateFilter(payload.date),
      "id": "",
      "mode": Number(payload.mode),
      "orgID": this.org.id,
      "type": 3,
      "year": 0
    }
    return this.http.post(this.api+`/getFilteredTicketsBy${by}`, body)
  }
  fetchCustomeFilteredTickets(id) {
    return this.http.get(this.api+`/${id}/getFilteredTickets`);
  }

  editTicket(payload: TicketModel) {
    let body = {
      ...payload,
      prty: payload.priority,
      source: payload.src,
      status: payload.stat
    }
    return this.http.post(this.api + '/editTicket', body)
  }
  fetchCustomFilters() {
    return this.http.get(this.api+`/${this.org.id}/${this.user.id}/getTicketCustomFilters`)
  }
  createCustomFilter(payload) {
    const body = {
      "agentID": '',
      "creatorID": this.user.id,
      "groupID": '',
      "name": payload.name,
      "orgID": this.org.id,
      "priority": payload.priority || '',
      "source": payload.source || '',
      "status": payload.status || '',
      "type": payload.type || ''
    }
    return this.http.post(this.api + '/newTicketCustomFilter', body)
  }
  deleteCustomFilter(id) {
    return this.http.post(this.api+`/${id}/deleteTicketCustomFilter`, {})
  }
  fetchStatTicket(data: { id: any, type: number }) {
    const payload = {
      orgID: this.org.id,
      id: data && data.type == 2 && data.id == 0 ? this.group.id : data.id,
      type: data && data.type ? data.type : 2
    }
    return this.http.post(this.api + '/getTicketsStatistics', payload);
  }
  fetchGraphStat(dateFilter?: { endDate: any, startDate: any }, year?: number) {
    const body = {
      // ...this.newDate.getDateFilter(dateFilter),
      orgID: this.org.id,
      type: 3,
      id: this.user.groupID || '',
      year,
      endDate: 1,
      startDate: 1
    }
    return this.http.post(this.api + '/getGraphStats', body);
  }
  fetchStatTicketType(data: { type: number, id: any, statType: '' }) {
    const payload = {
      orgID: this.org.id,
      statType: data.statType,
      id: data && data.type == 2 && data.id == 0 ? this.group.id : data.id,
      type: data && data.type ? data.type : 2
    }
    return this.http.post(this.api + '/getTicketsOnStats', payload)
  }
  getUnresolvedTicket() {
    return this.http.get(this.api + `/${this.org.id}/getUnresolved`)
  }
  assignTicket(payload) {
    // let body = { ...payload }
    // if (!payload.agentID) {
    // }
    const body = {
          // ...body,
          ticketCode: payload.ticketCode,
          agentID: payload.agentID?payload.agentID:this.user.id,
          agentName: payload.agentName?payload.agentName:(this.user.lastName + ' ' + this.user.firstName),
          groupID: payload.groupID?payload.groupID:this.group.id,
          groupName: payload.groupName?payload.groupName:this.group.name,
        }
    return this.http.post(this.api + '/assignTicket', body);
  }
  fetchAgent() {
    return this.http.get(this.signupApi + '/getAllAgents/' + this.org.id);
  }
  createTodo(payload) {
    const body = {
      ...payload,
      agentID: this.user.id,
      groupID: this.group.id,
      orgID: this.org.id,
      creatorID: this.gs.user.id,
      creatorName: `${this.gs.user.firstName} ${this.gs.user.lastName}`,
      status: 'UNDONE'
    }
    return this.http.post(this.api + '/newTodo', body)
  }
  getTodo(data) {
    const body = {
      orgID: this.org.id,
      id: data && data.type == 2 && data.id == 0 ? this.group.id : data.id,
      type: data && data.type ? data.type : 2
    }
    return this.http.post(this.api + '/getUndoneTodos', body)
  }
  fetchTicketTodos(code) {
    return this.http.get(this.api + `/${code}/getTicketTodos`);
  }
  saveTodoAsDone(id) {
    return this.http.post(this.api + `/${id}/saveAsDone`, {})
  }
  createChatExtra(payload) {
    const body = { 
      title: 'Title', 
      ...payload,
      creatorID: this.gs.user.id,
      creatorName: `${this.gs.user.firstName} ${this.gs.user.lastName}`
     }
    return this.http.post(this.api + '/newChatExtra', body)
  }
  fetchTicketChatExtra({ code, type }) {
    return this.http.get(this.api + `/${code}/${type}/getTicketChatExtras`);
  }
  openOrCloseTicket({ code, type }) {
    return this.http.post(this.api + `/${code}/${type}/openOrCloseTicket`, {})
  }
  fetchCustomerSatifyDashStats({ type, id }) {
    return this.http.get(this.api + `/${type}/${id}/${this.org.id}/getCustSatisfactionDashboardStats`);
  }
  fetchCustomerSatReport(dateFilter) {
    const body = {
      ...this.newDate.getDateFilter(dateFilter),
      orgID: this.org.id,
    }
    return this.http.post(this.api + '/getCustomerSatisfactionReports', body)
  }
  fetchGeneralStats(dateFilter?) {
    const body = {
      ...this.newDate.getDateFilter(dateFilter),
      orgID: this.org.id,
      type: 3,
      id: ""
    }
    return this.http.post(this.api + '/getGeneralStats', body)
  }
  removeTicketCode(sender) {
    const body = { org: this.org.id + '', sender }
    return this.http.post(this.chatUrl + '/ticket/remove-code', body)
  }
  sendMailgunMail({ to, agentName, subject, text, ticketCode }) {
    const agent = agentName ? agentName.split(' ')[0] : this.user.firstName;
    const htmlMsg = `<section><main>
                        <p>${text.replace(/\r\n|\r|\n/g,"<br />")}</p>
                        <br>
                        <b>${agent || 'Agent'}</b> from ${this.org.name}
                        <hr>
                        ${this.powerBy}
                    </main></section>`
    const body = {
      from: `${agent} from ${this.org.name} <${this.gs.orgEmailTicket}>`,
      to, subject, text: htmlMsg, ticketCode
    }
    return this.http.post(this.chatUrl + '/bots/email/mailgun/send', body)
  }
  fetchCustomerRating(rating) {
    return this.http.get(this.api+`/${this.org.id}/${rating}/getReportsByCustomerRating`)
  }
}
