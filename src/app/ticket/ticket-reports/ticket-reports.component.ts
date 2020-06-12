import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-ticket-reports',
  templateUrl: './ticket-reports.component.html',
  styleUrls: ['./ticket-reports.component.css']
})
export class TicketReportsComponent implements OnInit {

  constructor() { 
    $.getScript('../../../assets/js/datatableScript.js')
  }

  ngOnInit() {
  }



}
