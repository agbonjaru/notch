import { GeneralService } from 'src/app/services/general.service';
import { TicketModel } from './../../models/ticket/ticket.model';
import { TicketService } from './../../services/ticket/ticket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import $ from 'jquery'
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-ticket-list-type',
  templateUrl: './ticket-list-type.component.html',
  styleUrls: ['./ticket-list-type.component.css']
})
export class TicketListTypeComponent implements OnInit {
  ticketList: TicketModel[]
  ticketType;
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Client Name", key: "clientName" },
      { title: "Ticket Subject", key: "subject" },
      { title: "Ticket Type", key: "type" },
      { title: "Ticket Priority", key: "priority" },
      { title: "Ticket Status", key: "stat" },
      { title: "Ticket Source", key: "src" },
      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["Chat"],
      bulkActions: ["View / Edit"],
    },
  };
  constructor(
    private route: ActivatedRoute,
    private ticketSrv: TicketService,
    private gs: GeneralService,
    private router: Router) {
    const id = this.route.snapshot.paramMap.get('id')
    const statType = this.route.snapshot.paramMap.get('statType');
    const type = this.route.snapshot.paramMap.get('type');
    this.ticketType = this.getStatValue(Number(statType));
    const data = {id, statType, type};
    this.getStatTicketType(data);
   }
   dataFeedBackObsListener = (data) => {
    switch (data.type) {
      case "singleaction":
        if (data.action === "Chat" || data.action==='View') {
          this.openTicket(data.data.code);
        } 
        break;
      default:
        break;
    }
  };

  ngOnInit() {
  }

  getStatTicketType(data) {
    this.ticketSrv.fetchStatTicketType(data).subscribe((res: any) => {
      this.ticketList = res;
        $.getScript('../../../assets/js/datatableScript.js')
    })
  }
  openTicket(code) {
    if(this.gs.user.groupID) {
      this.router.navigate(['/ticket/ticket-view', code])
    } else {
      this.gs.sweetAlertFieldValidatio('You need to be part of a group to view a Ticket. Contact your admin for more enquiries')
    }
  }

  getStatValue(type) {
    switch (type) {
      case 1:
        return 'Unresolved'
      case 2:
        return 'Overdue'
      case 3:
        return 'About To Due'
      case 4:
        return 'Open'
      case 5:
        return 'On Hold'
      case 7:
        return 'My'
      default:
        return 'Unassigned'
    }
  }

}
