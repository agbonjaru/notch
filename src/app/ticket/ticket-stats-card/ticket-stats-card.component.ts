import { TicketService } from './../../services/ticket/ticket.service';
import { Component, OnInit, Input } from '@angular/core';
import { TicketStatModel } from 'src/app/models/ticket/ticket.model';

@Component({
  selector: 'app-ticket-stats-card',
  templateUrl: './ticket-stats-card.component.html',
  styleUrls: ['./ticket-stats-card.component.css']
})
export class TicketStatsCardComponent implements OnInit {
  @Input() data: {id: any, type: any} = {id: 0, type: 2}
  ticketStat: TicketStatModel;

  constructor(private ticketSrv: TicketService) { }

  ngOnInit() {
    this.getStat();
  }
  getStat() {
    this.ticketSrv.fetchStatTicket(this.data).subscribe((res: TicketStatModel) => {
      this.ticketStat = res;
    })
  }

}
