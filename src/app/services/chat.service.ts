import { UserModel, OrgModel } from 'src/app/store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GeneralService } from './general.service';
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  socket: any;
  readonly socketUrl: string = environment.chatServiceUrl//'http://localhost:3500'
  private orgId;
  private org: OrgModel;
  private user: UserModel;

  constructor(

    private http: HttpClient,
    private gs: GeneralService) {

    this.orgId = this.gs.orgID + '';
    this.user = this.gs.user;
    this.org = this.gs.org;
    this.socket = io(this.socketUrl);    
    this.socket.on('connect', () => {
        console.log('user chat socket connection');
      })
  }

  listen(eventName: string) {
    return new Observable((subcriber) => {
      this.socket.on(eventName, (data) => {
        subcriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) {
    return new Observable((subcriber) => {
      this.socket.emit(eventName, data, () => {
        subcriber.next()
      })
    })
  }

  joinChat() {
    return this.socket.emit('User Joined-Chat', {
      id: this.user.id + this.orgId,
      org: this.orgId
    })
  }

  joinAgentNofication() {
    return this.emit('join_agent_notification', {
      uniqueId: `${this.user.id}-${this.orgId}`,
      orgId: this.orgId
    });
  }
  getAgentIncomingNotify() {
    return this.listen('agent_incoming_notification');
  }
  notifyAgents(payload: {agentList: any[], ticketCode: string, message: string}) {
    const body = {
      creatorId: this.user.id,
      creatorName: `${this.user.firstName} ${this.user.lastName}`,
      orgName: this.org.name,
      ticketCode: payload.ticketCode,
      agentList: payload.agentList,
      message: payload.message,
      ticketPageLink: `${environment.notchFrontendServiceUrl}/ticket/ticket-view/${payload.ticketCode}`,
      orgTicketEmail: this.gs.orgEmailTicket,
      date: new Date(),
      service: 'tickets',
      subject: `@${this.user.firstName} ${this.user.lastName} mentioned you in Tickets`,
      template: 'mentioned you'
    }
    this.notifyAgentSocket(body);
    return this.notifyAgentsEmail(body);
  }
  notifyAgentSocket(payload: {agentList: any[]}) {
    payload.agentList.forEach(agent => {
      this.emit('notify_agent_socket', {
        ...payload,
        agent: agent
      }).subscribe(() => {
        console.log('emit to agent uniqueId');
      })
    })
  }
  saveAgentNotify(payload) {
    const body = {
      event: 'AGENT_MENTION',
      creatorId: this.user.id,
      creatorName: `${this.user.firstName} ${this.user.lastName}`,
      creatorTeams: [],
      itemId: payload.ticketCode,
      orgId: this.org.id,
      service: 'tickets',
      userIds: payload.userIds,
      template: payload.template
    }
    return this.http.post(environment.notificationsServiceUrl+'/notifications/action/user', body)
  }
  notifyAgentsEmail(payload) {
    const body = {
      ...payload,
      agentList: payload.agentList.map(agent => agent.email)
    }
    return this.emit('notify_agents_email', body);
  }

}
