import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-commission-list',
  templateUrl: './commission-list.component.html',
  styleUrls: ['./commission-list.component.css']
})
export class CommissionListComponent implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
  }

}
