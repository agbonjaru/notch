import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-temp1',
  templateUrl: './temp1.component.html',
  styleUrls: ['./temp1.component.css']
})
export class Temp1Component implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
  }


}
