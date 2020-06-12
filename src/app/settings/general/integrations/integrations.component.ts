import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.css'],
})
export class IntegrationsComponent implements OnInit {
  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    // const btest = window.location.search.substr(1);
    // console.log(btest, "");
  }
}
