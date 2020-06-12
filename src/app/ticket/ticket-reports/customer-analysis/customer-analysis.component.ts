import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-customer-analysis',
  templateUrl: './customer-analysis.component.html',
  styleUrls: ['./customer-analysis.component.css']
})
export class CustomerAnalysisComponent implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js')
   }

  ngOnInit() {
  }


}
