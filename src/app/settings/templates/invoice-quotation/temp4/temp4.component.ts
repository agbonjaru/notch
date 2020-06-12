import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-temp4',
  templateUrl: './temp4.component.html',
  styleUrls: ['./temp4.component.css']
})
export class Temp4Component implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
  }


}
