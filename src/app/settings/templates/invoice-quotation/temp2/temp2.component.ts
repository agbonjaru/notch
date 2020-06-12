import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-temp2',
  templateUrl: './temp2.component.html',
  styleUrls: ['./temp2.component.css']
})
export class Temp2Component implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
  }


}
