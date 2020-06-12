import { ChatService } from './../../../../services/chat.service';
import { TicketModel } from './../../../../models/ticket/ticket.model';
import { GeneralService } from './../../../../services/general.service';
import { TicketService } from './../../../../services/ticket/ticket.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ticket-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class TicketNotesComponent implements OnInit {
  @Input() selectedTicket: TicketModel
  noteValue: string
  noteLoading = false;
  notesList: any[];
  showAgentSuggestions = false;
  filteredsearchAgentList = [];
  searchAgentList = [];
  hoverAgentIndex = 0;
  agentsTobeNotifiedList = []

  constructor(
    private ticketSrv: TicketService,
    private chatSrv: ChatService,
    private gs: GeneralService) {}

  ngOnInit() {
    this.getSearchAgent()
  }

  getSearchAgent() {
    this.ticketSrv.fetchAgent().subscribe((agents: any[]) => {
      this.filteredsearchAgentList = this.searchAgentList = agents.filter(agent => agent.id !== this.gs.user.id);
    })
  }
  
  noteTyping(e) {    
    // this.noteValue = e.target.textContent    
    if(e.data==='@') {
      this.showAgentSuggestions = true;
    }    
    this.filterAgentSug();
  }
  filterAgentSug() {
    let atIndex = this.noteValue.lastIndexOf('@');
    if(atIndex === -1) {
      return;
    }
    let nameOrEmail: string = this.noteValue.substring(atIndex+1, this.noteValue.length);    
    nameOrEmail = nameOrEmail.trim() ? nameOrEmail.toLowerCase().trim() : '';    
    this.filteredsearchAgentList = this.searchAgentList.filter(agent => agent.name.toLowerCase().includes(nameOrEmail));
    if(this.filteredsearchAgentList.length===0) {
      this.showAgentSuggestions = false;
    }
  }
  selectAgentSug(agent) {
    const atIndex = this.noteValue.lastIndexOf('@');
    const value = atIndex >=0 ? this.noteValue.substring(0, atIndex) : this.noteValue;
    this.noteValue = `${value} @${agent.name}`;
    this.showAgentSuggestions = false;
  }
  OnMouseOver() {
    const listGroupItem = document.querySelector('.list-group .list-group-item');
    listGroupItem.classList.remove('active');
  }
  handleAgentClick(event) {
    if(this.showAgentSuggestions) {
      event.preventDefault();
      const firstAgent = this.filteredsearchAgentList[0];
      this.selectAgentSug(firstAgent);
    }    
  }
  extractAgents() {
    const text = this.noteValue;
    const arrText = text.split('@');
    const resultx = [];
    if(!text.startsWith('@')) {
      arrText.shift();
    };
    arrText.forEach(ar => {
      const ax = ar.split(' ')
      const ex = `${ax[0]} ${ax[1] ? ax[1]: ''}`;
      resultx.push(ex)
    });
    for (const agentName of resultx) {
        const agentDetail = this.getAgentDetail(agentName);
        if(agentDetail) {
          if(this.agentsTobeNotifiedList.findIndex(agent => agent.email == agentDetail.email)===-1) {
              this.agentsTobeNotifiedList.push(
                {
                  uniqueId: `${agentDetail.id}-${this.gs.orgID}`,
                  email: agentDetail.email,
                  name: agentDetail.name,
                  userId: agentDetail.id
                })
          }
        }
    }
    this.notifyAgent()
  }
  getAgentDetail(agentName) {
    const agent = this.searchAgentList.find(agent => agent.name == agentName)
    return agent;
  }
  createNote() {
    if(this.noteValue) {
      this.noteLoading = true;
      const payload = {content: this.noteValue, ticketCode: this.selectedTicket.code, type: 1};
      this.extractAgents();
      this.ticketSrv.createChatExtra(payload).subscribe(() => {
        this.notifyAgent()
        this.gs.sweetAlertSucess('Note Created')
        this.noteValue = ''
        this.noteLoading = false;
      }, () => {
        this.noteLoading = false;
        alert('error occured try again!')
      })
    }
  }
  viewNotes() {
    this.notesList = null;
    this.ticketSrv.fetchTicketChatExtra({code: this.selectedTicket.code, type: 1})
      .subscribe((res: any[]) => this.notesList = res)
  }
  notifyAgent() {
    if(this.agentsTobeNotifiedList.length) {
      const payload = {agentList: this.agentsTobeNotifiedList, ticketCode: this.selectedTicket.code, message: this.noteValue}
      const userIds = this.agentsTobeNotifiedList.map(agent => agent.userId)
      const savePayload = {ticketCode: this.selectedTicket.code, userIds}
      this.chatSrv.notifyAgents(payload).subscribe(() => {
        this.chatSrv.saveAgentNotify(savePayload).subscribe((res) => {
          this.agentsTobeNotifiedList = []
          console.log('agent notified successful');
          console.log(res);
        })
      })
    }
  }
  transformText(word: string) {
    return word
  } 

}
