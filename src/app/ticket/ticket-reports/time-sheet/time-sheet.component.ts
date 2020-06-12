import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.css']
})
export class TimeSheetComponent implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js')
   }

  ngOnInit() {
  }


}
