import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrls: ['./gamification.component.css']
})
export class GamificationComponent implements OnInit {

  constructor() {
    $.getScript('../../../assets/js/datatableScript.js');
   }

  ngOnInit() {
  }

}
