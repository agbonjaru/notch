import { GroupService } from 'src/app/services/ticket/group.service';
import { TicketChatService } from './../../services/ticket/ticket-chat.service';
import { takeUntil } from 'rxjs/operators';
import { Subject , Observable, forkJoin} from 'rxjs';
import { map } from 'rxjs/operators';

import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from './../../services/client-services/companies.service';
import { ActivatedRoute } from '@angular/router';
import { TicketModel, TicketChatModel } from './../../models/ticket/ticket.model';
import { TicketService } from './../../services/ticket/ticket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { NgForm } from '@angular/forms';
import $ from 'jquery';
import { selectConfig } from 'src/app/utils/utils';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './ticket-view.component.html',
  styleUrls: ['./ticket-view.component.css']
})
export class TicketViewComponent implements OnInit, OnDestroy {
  spinnerType:'errorCard' | 'notch-loader' = 'notch-loader'; 
  private unscribe = new Subject();
  config = {...selectConfig}
  ticketList: any[];
  allTicketList: any[]
  agentList = [];
  onlineUserList = [];
  selectedAgent: {id: string, name: string};
  agentGroup =  {selected: '', list: null}; 
  selectedTicket: TicketModel
  ticketCode: string;
  clientInfo;
  clientType;
  chatList: any[];
  allChatList = [];

  chatMsg = '';
  replyTo;
  clientFilterBy = 'email';
  ticketPayload: TicketChatModel;
  todoList;
  constructor(
    private ticketSrv: TicketService,
    private groupSrv: GroupService,
    private route: ActivatedRoute,
    private companySrv: CompaniesService,
    private contactSrv: ContactsService,
    private gs: GeneralService,
    private ticketChatSrv: TicketChatService) {
     this.ticketCode =  this.route.snapshot.paramMap.get('code');
   }

  ngOnInit() {
    this.joinAndnewMsg();
    this.getTickets();
    this.getSearchAgent();
  }
  
  getTickets(auto?) {
    this.spinnerType = 'notch-loader';
    this.ticketSrv.fetchTicket({id: 0, type: 3}).subscribe((res: TicketModel[]) => {
      this.ticketList =  this.allTicketList = res;
      this.selectedTicket = this.ticketList.filter(ticket => ticket.code == this.ticketCode)[0];
      if(this.selectedTicket) {
        this.getOnlineUsers();
        if(!auto) {
          this.ticketPayload = {
                ticketCode: this.ticketCode, 
                subject: this.selectedTicket.subject || 'ENQUIRY', 
                channel: 2,
                message: '',
                sender: this.replyTo
            }
          this.getTicketTodos(this.ticketCode);
          this.openChat(this.selectedTicket);
        }
      }
    }, err => {
      this.spinnerType = 'errorCard';
    })
  }
  getSearchAgent() {
    this.ticketSrv.fetchAgent().subscribe((agents: any[]) => {
      this.agentList = agents;
    })
  }

  assignLoading = false;
  handleAssignTicket() {
    if(!this.selectedTicket.agentID) {
      $('#assignTicketHandler').click();
    } else {
      const msg = `<p>This ticket is already assigned to <b>${this.selectedTicket.agentName}</b></p>
                    <h6>Do you wish to proceed?</h6>`
      this.gs.sweetAlertUpdates(msg).then(res => {
        if(res.value) {
          $('#assignTicketHandler').click();
        }
      })
    }
  }
  handleAgentSelect() {
    if(this.selectedAgent && this.selectedAgent.id) {
      this.agentGroup.list = null;
      this.agentGroup.selected = ''
      this.groupSrv.fetchAgentGroups(this.selectedAgent.id).subscribe(res => {
        this.agentGroup.list = res;
      })
    }
  }
  assigneTicket(auto?) {
    this.assignLoading = true;
    const payload = {
      ticketCode: this.selectedTicket.code, 
      agentID: this.selectedAgent&&this.selectedAgent.id?this.selectedAgent.id:'', 
      agentName: this.selectedAgent&&this.selectedAgent.name?this.selectedAgent.name:'',
      groupID: this.agentGroup.selected?this.agentGroup.selected.split('+')[0]: '', 
      groupName: this.agentGroup.selected?this.agentGroup.selected.split('+')[1]: '', 
    }
   this.ticketSrv.assignTicket(payload).subscribe(() => {
     this.getTickets(auto);
     this.selectedAgent = null;
     this.agentGroup.selected = '';
    if(!auto) {
     this.gs.sweetAlertSucess('Ticket Assigned to Agent');
     this.getSearchAgent();
    }
   }, err => {
     this.gs.sweetAlertError(this.gs.getErrMsg(err))
   }).add(() =>  {
     this.assignLoading = false;
     $('#assignTicket .close').click()
    })
  }
  getChats({code , sender}) {
    this.chatList = null;
    this.ticketChatSrv.fetchChat(code).pipe(takeUntil(this.unscribe))
        .subscribe((res: any) => {
          this.allChatList = this.chatList = res;
          this.updateTicketList({ticketCode: code, sender}, true);false
          this.updateChatList({ticketCode: code, sender})    
        });
  }
  getClientInfo(ticket) {
    this.clientInfo = null;
    const query = this.getClientFilterQuery(ticket)
    forkJoin(this.getCompany(query), this.getContact(query)).pipe(map(([company, contact]) => {
      return { company, contact}
    })).subscribe(res => {
      if(res) {
        const company = res.company && res.company.success ? res.company.payload[0] : null
        const contact = res.contact && res.contact.success ? res.contact.payload[0] : null;
        this.clientType = company ? 'company' : 'contact'
        this.clientInfo = company || contact || {name: this.selectedTicket.clientName};
      }
    })
  }
  getClientFilterQuery(ticket: TicketModel) { 
    let query = 'clientId='+ticket.clientID;
    if(ticket.clientID === 0) {
      switch (ticket.src) {
        case 'EMAIL':
          query =  'email='+ ticket.clientName;
        case 'WHATSAPP':
          query = 'whatsappNumber='+ ticket.clientName
        case 'WEBSITE':
          query =  'email='+ ticket.clientName;
        default:
          query = query
      }
    }
    return query
  }
  getCompany(query) {
    return this.companySrv.getCompaniesByFilter(query)
  }
  getContact(query) {
    return this.contactSrv.getContactsByFilter(query)
  }
  openChat(ticket, ticketIndex?) {
    this.ticketCode = ticket.code;
    this.selectedTicket = ticket;
    this.getClientInfo(ticket);
    this.getChats(ticket)
    this.getTicketTodos(this.ticketCode);
    this.replyTo = ticket.ticketCode;
    this.removeNotification(ticketIndex);
  }
  msgLoading = false;
  showEmoji = false;
  toggleEmojiPicker() {
    this.showEmoji = !this.showEmoji
  }
  emojiClicked({emoji}) {
    this.chatMsg = `${this.chatMsg} ${emoji.native}`;
    this.toggleEmojiPicker();
  }
  sendMsg() {
    if(this.replyTo) {
      const message = this.chatMsg.trim();
      if(message.length >= 1) {
        this.msgLoading = true;
        const data = {message, createdDate: Date.now(), ticketCode: this.ticketCode}
        const payload = {
          ...this.ticketPayload, 
          message, 
          sender: this.replyTo, 
          ticketCode: this.ticketCode,
          subject: this.selectedTicket.subject,
          clientName: this.selectedTicket.clientName,
          agentName: this.selectedTicket.agentName
        }
        if(this.gs.user.groupID) {
          if(!this.selectedTicket.agentID) {
            console.log('automatic assign');
            this.assigneTicket(true)
          }         
          // Send Message through different medium
          this.broadCastMsg(data, payload)
        } else {
          this.msgLoading = false;
          this.gs.sweetAlertFieldValidatio('You need to be part of a group')
        }
      }
    } 
  }
  broadCastMsg(data, payload) {
    if(this.selectedTicket.clientID===0 || !this.selectedTicket.clientID){
      const ticketSource = this.selectedTicket.src;
      if(ticketSource === 'WEBSITE') {
        const checkIfUserIsOnline = this.onlineUserList.findIndex(user => user.user == this.replyTo);
        if(checkIfUserIsOnline >= 0) {
          this.sendSocetMsg(data, payload);
        } else {
          this.sendMailGunMail(data, payload);
        }
      } else if(ticketSource === 'WHATSAPP') {
        this.sendWhatsappMsg(data, payload)
      } else if(ticketSource==='TWITTER') {
        this.sendTwitterMsg(data, payload);
      } else {
        this.sendMailGunMail(data, payload);
      }
    } else {
      this.sendMailGunMail(data, {...payload, clientName: this.clientInfo.email})
    }

  }
  sendEmailMsg(data, payload) {
    const newPayload = {...payload, channel: 1, sender: payload.clientName};
    this.sendSuccessAction(data , newPayload)
  }
  sendSocetMsg(data, payload) {
    this.ticketChatSrv.sendMessage({msg: data.message, sendTo: payload.sender}).subscribe(() => {   
      this.sendSuccessAction(data, payload)
    }, err => {
      this.sendMsgError('Socket Message Failed');
    })
  }
  sendMsgError(error) {
    this.gs.sweetAlertError(this.getErrMsg(error));
    this.msgLoading = false;
  }
  getErrMsg(error) {
    console.log(error);
    let result = 'Error occured try again';
    if(error&&error.errors&&error.errors.message) {
      result = error.errors.message
    }else if(error&&error.message) {
      result = error.message;
    } else if(error && error.msg) {
      result = error.msg
    }
    return result
  }
  sendMailGunMail(data, payload) {
    const body = {to: payload.clientName, subject: payload.subject, 
      text: data.message, ticketCode: payload.ticketCode,
      agentName: payload.agentName
    }
    if(payload.clientName) {
      this.ticketSrv.sendMailgunMail(body).subscribe(res => {
        this.sendSuccessAction(data, payload)
      }, ({error}) => {
        this.sendMsgError(error);        
      })
    } else {
      this.gs.sweetAlertFieldValidatio('Email Not Available');
      this.msgLoading = false
    }
  }
  sendWhatsappMsg(data, payload) {
    this.ticketChatSrv.sendWhatsMsg({to: payload.clientName, message: data.message}).subscribe(() => {
      this.sendSuccessAction(data, payload)
    }, ({error}) => {
      this.sendMsgError(error);   
    })
  }
  sendTwitterMsg(data, payload) {        
    let body = this.selectedTicket.otherData
    body = body ? JSON.parse(body) : body;
    body = body && body.reply ? body.reply : body;
    const payloadx = {...body, body: data.message}
    this.ticketChatSrv.sendTwitterMsg(payloadx).subscribe((res: any) => {
      if(res.success) {
        this.sendSuccessAction(data, payload)
      } else {
        this.sendMsgError({msg: res.error}); 
      }
    },  ({error}) => {      
      this.sendMsgError(error);   
    })
  }
  sendFeedback() {
    const code = this.selectedTicket.code
    const surveryLink =  `${environment.baseUrl}/customer-survey/${code}`
    const url = `<br><a target="_blank" href="${surveryLink}">click here</a>`;
    const htmlMsg = `<p>Your Ticket => <b>${code}</b> 🎫 has been closed 🆑, please kindly take this survey 📝 ${url} </p>`
    const whatsappMsg =  `Your Ticket => *${code}* 🎫 has been closed 🆑, please kindly take this survey 📝 ${surveryLink}`
    const message = this.selectedTicket.src==="EMAIL" ? htmlMsg : whatsappMsg;
    const payload = {
      sender: this.replyTo, 
      ticketCode: this.ticketCode,
      subject: this.selectedTicket.subject,
      clientName: this.selectedTicket.clientName
    };
    const data ={message, feedback:true }
    this.broadCastMsg(data, payload)
  }
  sendSuccessAction(data, payload) {
    this.saveChat(data, payload);
  }
  saveChat(data, payload) {
    if(!data.feedback) {
      this.ticketChatSrv.saveChat(payload).subscribe(res => {
        this.chatMsg = '';
        this.chatList = this.allChatList = this.chatList.concat(data);
        this.updateChatList(data);
      }, error => {
        this.gs.sweetAlertError(this.gs.getErrMsg(error))
      }).add(() => {
        this.msgLoading = false;
      })
    }
  }

  get loadingPage() {
    return this.ticketList && this.selectedTicket
  }

  
  todoLoading = false;
  addTodo(form: NgForm) {
    if(form.valid) {
      this.todoLoading = true;
      const payload = {...form.value, ticketCode: this.ticketCode}
      this.ticketSrv.createTodo(payload).pipe(takeUntil(this.unscribe))
      .subscribe(res => {
        this.getTicketTodos(this.ticketCode)
        $('.close').click();
        this.todoLoading = false;
        this.gs.sweetAlertSucess('Todo Created');
        form.reset();
      }, err => {
        this.todoLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(err))
      });
    }
  }
  getTicketTodos(code) {
    this.ticketSrv.fetchTicketTodos(code).subscribe(res => {
      this.todoList = res;
    })
  }
  markTodo(todo) {    
    if(this.gs.user.id==todo.creatorID) {
      this.gs.sweetAlertUpdates('Mark Todo As Done').then(result => {
        if(result.value) {
          this.ticketSrv.saveTodoAsDone(todo.id).subscribe(res => {
            $('#showTodos .close').click();
            this.gs.sweetAlertSucess('Todo Mark As Done');
            this.getTicketTodos(this.ticketCode)
          }, err => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err))
          })
        } else {
          this.getTicketTodos(this.ticketCode)
        }
      })
    } else {
      this.getTicketTodos(this.ticketCode)
    }
  }

  // chat logic
  joinAndnewMsg(){
    this.ticketChatSrv.joinChat();
    this.ticketChatSrv.newMsg().subscribe((msgData: any) => {
      const data = { ...msgData, message: msgData.msg, createdDate: Date.now()}   
      if(this.ticketCode == data.ticketCode) {
        this.updateTicketList(data, false);
        this.getOnlineUsers();
        this.chatList = this.allChatList = this.chatList.concat(data);
        this.updateChatList(data);
      } else {
        this.updateTicketList(data, true);
        this.getOnlineUsers();
      }
      this.notification(data);
    })
  }
  getOnlineUsers() {
    this.ticketChatSrv.fectchOnlineUsersObj().pipe(takeUntil(this.unscribe))
      .subscribe((users: any) => {
        this.onlineUserList = users.data;
        this.displayOnlineUser(users.data); 
      })
    this.ticketChatSrv.fetchOnlineUsers().pipe(takeUntil(this.unscribe))
      .subscribe((users: any) => {
      this.onlineUserList = users; 
      this.displayOnlineUser( users); 
    })
  }
  displayOnlineUser(users) {        
    if(users.length && this.ticketList.length) {
      for (let i = 0; i < this.ticketList.length; i++) {
        this.ticketList[i].online = false;
      }
      for (let i = 0; i < users.length; i++) {
        if(this.ticketList.map(tick => tick.code).indexOf(users[i].user) >= 0) {
          const userIndex = this.ticketList.findIndex(tic => tic.code == users[i].user)
          this.ticketList[userIndex].online = true; 
        }
      }
    }
  }

  updateTicketList(data, NotActiveChat) {    
    const ticketIndex = this.ticketList.findIndex(ticket => ticket.code == data.ticketCode)
    if(ticketIndex == -1) {
      this.ticketList = this.allTicketList = this.ticketList.concat(
        {...data, code: data.ticketCode, clientName: data.sender})
    }
    if(NotActiveChat) {
      const newticketIndex = this.ticketList.findIndex(ticket => ticket.code == data.ticketCode);
      if(newticketIndex >= 0) {
        this.ticketList = [this.ticketList[newticketIndex], ...this.ticketList];
        this.ticketList.splice(newticketIndex+1, 1);
      }
    }    
  }
   updateChatList(data) {
    this.ticketCode = data.ticketCode;
    this.replyTo = data.ticketCode ? data.ticketCode : this.replyTo
    setTimeout(() => {
      const chatSec = document.getElementById('ticket_msg_history');
      if(chatSec) {
        chatSec.scrollTo(0, chatSec.scrollHeight);
      }
    }, 500);
  }
  notification(data) {
    const ticketIndex = this.ticketList.findIndex(ticket => ticket.code == data.ticketCode);
    if(this.ticketList[ticketIndex].notice) {
      this.ticketList[ticketIndex].notice++
    } else {
      this.ticketList[ticketIndex].notice = 1
    }
  }
  autoRemoveNotity() {
    const ticketIndex = this.ticketList.findIndex(tick => tick.code === this.selectedTicket.code);
    this.removeNotification(ticketIndex);
  }
  removeNotification(ticketIndex) {
    if(ticketIndex !== undefined && this.ticketList[ticketIndex].notice) {
      this.ticketList[ticketIndex].notice = null
    }
  }
  
  // Call Log Logic
  callLogValue
  callLogLoading = false;
  callLogList;
  createCallLog() {
    if(this.callLogValue) {
      this.callLogLoading = true;
      const payload = {content: this.callLogValue, ticketCode: this.selectedTicket.code, type: 2}
      this.ticketSrv.createChatExtra(payload).subscribe(() => {
        this.gs.sweetAlertSucess('Call Log Created')
        this.callLogValue = ''
        this.callLogLoading = false;
      }, (err) => {
        this.callLogLoading = false;
        this.gs.sweetAlertError(this.gs.getErrMsg(err))
      })
    }
  }
  viewCallLog() {
    this.callLogList = null;
    this.ticketSrv.fetchTicketChatExtra({code: this.selectedTicket.code, type: 2})
      .subscribe((res: any[]) => this.callLogList = res)
  }
  // Close Ticket
  closeorReopenTicket(type: number) {
    const msg = type === 1 ? 'Reopen' : 'Close';
    this.gs.sweetAlertUpdates(`${msg} Ticket`).then(result => {
      if(result.value) {
        const payload = {code: this.selectedTicket.code, type};
        this.ticketSrv.openOrCloseTicket(payload).subscribe(() => {
          if(type === 2) {
            this.sendFeedback();
            this.removeTicketCode();
          }
          this.getTickets(true)
          this.gs.sweetAlertSucess(`Ticket ${msg}`);
        }, (err) => {
          this.gs.sweetAlertError(this.gs.getErrMsg(err))
        })
      }
    })
  }
  resolveTicket() {
    if(this.selectedTicket.agentID) {
      this.gs.sweetAlertUpdates(`Resolve Ticket`).then(result => {
        if(result.value) {
          const payload = {...this.selectedTicket, stat: 'RESOLVED'};
          this.ticketSrv.editTicket(payload).subscribe(() => {
            this.getTickets(true)
            this.gs.sweetAlertSucess(`Ticket Resolved`);
          }, (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err))
          })
        }
      })
    } else {
      this.gs.sweetAlertFieldValidatio('This ticket cannot be resolved, it is not assigned to an Agent')
    }
  }


   removeTicketCode() {
     if(this.selectedTicket.clientID === 0) {
       this.ticketSrv.removeTicketCode(this.selectedTicket.clientName).subscribe(res => {
          console.log(res);
       }, err => {
        console.log(err.error);
       })
     }
   }
  formatLocation(location): {flag?: string, detail?: string} {
    if(location) {
      const {flag, state, city, country} = JSON.parse(location)
      return {flag, detail: `${city}, ${state}, ${country}`};
    } else {
      return {flag: 'https://ptetutorials.com/images/user-profile.png', detail: 'No Location'}
    }
  }
  formatMsg(data :string): {type: string, meta: string} {
    if(data) {
      if(data &&(data.startsWith('==image/jpeg') || data.startsWith('==video/mp4') || data.startsWith('==audio/ogg')))  {
        return { type: data.split('==')[1], meta: data.split('+')[1]}
      } else {
        return {type: 'text', meta: data}
      }
    } else {
      return {type: 'text', meta: null}
    }
  }
  // Search Ticket and Conversations
  searchTicket(e) {
    let value: string = e.target.value
    value = value ? value.toLowerCase() : '';
    this.ticketList = this.allTicketList.filter(ticket => ticket.clientName.toLowerCase().includes(value));
  }
  searchConservation(e) {
    let value: string = e.target.value;
    value = value ? value.toLowerCase() : value;
    this.chatList = this.allChatList.filter(chat => chat.message.toLowerCase().includes(value))
  }

  ngOnDestroy() {
    this.unscribe.next();
    this.unscribe.complete();
  }

}

