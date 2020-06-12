import { TicketChatService } from './../../services/ticket/ticket-chat.service';
import { convertObjToArray, selectConfig } from 'src/app/utils/utils';
import { ClientService } from './../../services/client-services/clients.service';
import { getPrtyColor } from './../../utils/utils';
import { Router } from '@angular/router';
import { TicketModel } from './../../models/ticket/ticket.model';
import { GeneralService } from './../../services/general.service';
import { TicketService } from './../../services/ticket/ticket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactsService } from 'src/app/services/client-services/contacts.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-all-ticket',
  templateUrl: './all-ticket.component.html',
  styleUrls: ['./all-ticket.component.css']
})
export class AllTicketComponent implements OnInit, OnDestroy {
   p: number = 1;
   groupId;
   config = selectConfig;
   loading = false;
   ticketList: TicketModel[];
   incomingTicketList = [];
   clientList = []
   ticketForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    detail: new FormControl('', Validators.required),
    prty: new FormControl('', Validators.required),
    source: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    subject: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    dueDate: new FormControl('', Validators.required)
   })

  constructor(
    private ticketSrv: TicketService,
    private ticketChatSrv: TicketChatService,
    public gs: GeneralService,
    private router: Router,
    private clientSrv: ClientService,
    private contactSrv: ContactsService,
    private companySrv: CompaniesService) {
      this.groupId = this.gs.user && this.gs.user.groupID ? this.gs.user.groupID : null;
   }

  ngOnInit() {
    this.getTickets();
    this.getClients()
    this.joinAndnewMsg()
  }
  openTicketModal() {
    if(this.groupId) {
      $('#add-ticket').attr('data-target', '#ModalCenter4')
      $('#add-ticket').click();
    } else {
      this.gs.sweetAlertFieldValidatio('You need to be part of a group to create a Ticket. Contact your admin for more enquiries');
    }
  }
  addTicket() {
    const { valid, value} = this.ticketForm;
    if (valid) {
      this.loading = true
      this.ticketSrv.createTicket({...value}).subscribe((res: any) => {
        this.loading = false;
        $('#closeModal').click();
        this.ticketForm.reset();
        this.gs.sweetAlertSucess(res.message);
        this.getTickets();
      }, err => {
        this.loading = false;
        $('#closeModal').click();
        this.gs.sweetAlertError(this.gs.getErrMsg(err))        
      })
    }
  }
  showNotify() {
    if(this.incomingTicketList.length) {
      for (const ticket of this.incomingTicketList) {
        this.notification(ticket);
      }
    }
  }

  getTickets(date?) {
    this.ticketList= null;
    this.ticketSrv.fetchTicket({id: 0, type: 3, date}).subscribe((res: TicketModel[]) => {
      this.ticketList = res;
      this.showNotify()
    })
  }
  getFilterTickets({by, value}) {
    this.ticketList = null
    this.ticketSrv.fetchFilteredTickets(by, {mode: value, date: ''}).subscribe((res: TicketModel[]) => {
      this.ticketList = res;
      this.showNotify()
    })
  }
  getCustomFilteredTickets(id) {
    this.ticketList = null
    this.ticketSrv.fetchCustomeFilteredTickets(id).subscribe((res: any) => {
      this.ticketList = res;
      this.showNotify()
    })
  }
  filterEmitted({type, value}) {
    console.log(type, value);
    this.p = 1
    switch (type) {
      case 'createdDate':
        this.getTickets(value)
        break;
      case 'Priority':case 'Status':case 'Source':case 'Type':
        this.getFilterTickets({by: type, value})
        break;
      case 'customFilter':
        this.getCustomFilteredTickets(value)
        break;
      default:
        this.getTickets()
        break;
    }
  }
  getClients() {
    this.clientSrv.getAllClients().subscribe(res => {
      this.clientList =  convertObjToArray(res);      
    })
  }
  getClientInfo(id): {contact: Observable<any>, company: Observable<any>}{
    return {
      contact: this.contactSrv.getContactsByFilter(`clientId=${id}`),
      company: this.companySrv.getCompaniesByFilter(`clientId=${id}`)
    }
  }
  updateTicket(field, ticket, payload) {
    const msg = `Update Ticket`;
    const body = {...ticket, [field]: payload};
    this.gs.sweetAlertUpdates(msg).then(result => {
      if(result.value) {
        this.ticketSrv.editTicket(body).subscribe(res => {
          this.gs.sweetAlertSucess('Ticket Updated');
        }, err => {
          this.getTickets();
          alert('Error occured try again');
        })
      } else {
        this.getTickets();
      }
    })
  }
  view(code) {
    if(this.gs.user.groupID) {
      this.router.navigate(['/ticket/ticket-view', code])
    } else {
      this.gs.sweetAlertFieldValidatio('You need to be part of a group to view a Ticket. Contact your admin for more enquiries')
    }
  }
  joinAndnewMsg(){
    this.ticketChatSrv.joinChat();
    this.ticketChatSrv.newMsg().subscribe((data: any) => {      
      this.getTickets();
      this.displayNotif(data)
    })
  }
  displayNotif(data) {
    const checkEmail = this.incomingTicketList.filter(ticket => ticket.ticketCode == data.ticketCode);
    if(!checkEmail.length) {
      this.incomingTicketList.push(data);
    }
    setTimeout(() => {
        for (let i = 0; i < this.incomingTicketList.length; i++) {
          const ticket = this.incomingTicketList[i];        
          this.notification(ticket);
        }
    }, 2000);
  }
  notification(data) {
    const ticketIndex = this.ticketList.findIndex(ticket => ticket.code == data.ticketCode);
    if(this.ticketList[ticketIndex].notice) {
      this.ticketList[ticketIndex].notice++  
    } else {
      this.ticketList[ticketIndex].notice = 1 
    }
    this.ticketList = [this.ticketList[ticketIndex], ...this.ticketList];
    this.ticketList.splice(ticketIndex+1, 1);
  }

  getPrityColor(prty) {
    return getPrtyColor(prty);
  }
  



  ngOnDestroy() {
    this.ticketChatSrv.disconnect()
  }
}
