import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-temp3',
  templateUrl: './temp3.component.html',
  styleUrls: ['./temp3.component.css']
})
export class Temp3Component implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
  }


}
