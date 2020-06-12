import { environment } from './../../../environments/environment';
import { UserModel } from './../../store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { TicketChatModel } from 'src/app/models/ticket/ticket.model';
import { GeneralService } from '../general.service';
@Injectable({
  providedIn: 'root'
})
export class TicketChatService {

  socket: any;
  readonly socketUrl: string = environment.chatServiceUrl;
  readonly api: string = this.endpoint.ticketUrl; 
  private orgId;
  private user: UserModel;

  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService) {

    this.orgId = this.gs.orgID + '';
    this.user = this.gs.user;

    this.socket = io(this.socketUrl);

    this.socket.on('connect', () => {
      console.log('ticket chat socket connection');
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
    return this.socket.emit('join PM', {
      user: this.orgId,
      org: this.orgId,
      source: 'admin'
    })
  }

  newMsg() {
    return this.listen('new message')
  }

  fetchOnlineUsers() {
    return this.listen('usersList');
  }

  sendMessage({ msg, sendTo }) {
    const data = {
      msg,
      sender: this.orgId,
      sendTo,
      agentID: this.user.id,
      groupID: this.user.groupID,
      agentName: `${this.user.firstName} ${this.user.lastName}`,
      agentPix: this.user.userImg || 'https://icon-library.net//images/avatar-icon-png/avatar-icon-png-8.jpg'
    }
    return this.emit('private message', data)
  }

  sendWhatsMsg(payload) {
    const body = {
      orgID: this.orgId,
      to: payload.to,
      body: payload.message
    }
    return this.http.post(this.socketUrl + '/bots/whatsapp/sender', body)
  }
  sendTwitterMsg(payload) {
    const body = {
      ...payload,
      body: `${payload.body}\n\n From ${this.user.firstName}`
    }
    return this.http.post(environment.commsServiceUrl + '/twitter/message/reply', body)
  }


  saveChat(payload: TicketChatModel) {
    const body = {
      ...payload,
      agentID: this.user.id,
      groupID: this.user.groupID,
      orgID: this.orgId,
      agentPix: this.user.userImg,
      agentName: `${this.user.firstName} ${this.user.lastName}`,
      subject: payload.subject ? payload.subject : 'ENQUIRY'
    }
    return this.http.post(this.api + '/sendToSite', body)
  }

  fetchChat(code) {
    return this.http.get(this.api + `/${code}/getTicketChats`);
  }

  fectchOnlineUsersObj() {
    return this.http.get(this.socketUrl + `/ticket/online-user/${this.orgId}`)
  }

  disconnect() {
    return this.socket.emit('disconnect')
  }
}
