import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-ticket-subnav',
  templateUrl: './ticket-subnav.component.html',
  styleUrls: ['./ticket-subnav.component.css']
})
export class TicketSubnavComponent implements OnInit {

  constructor(public gs: GeneralService) {}

  ngOnInit() {
  }


}
