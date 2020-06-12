import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-teams-subnav',
  templateUrl: './teams-subnav.component.html',
  styleUrls: ['./teams-subnav.component.css']
})
export class TeamsSubNavComponent implements OnInit {

  constructor(public gs : GeneralService) {
   
  }

  ngOnInit() {
  }

}
