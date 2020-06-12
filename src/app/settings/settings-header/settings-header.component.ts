import { OrgModel } from './../../store/storeModels/user.model';
import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.css']
})

export class SettingsHeaderComponent implements OnInit {
  org: OrgModel
  constructor(gs: GeneralService) {
    this.org = gs.org
   }

  ngOnInit() {
    
  }

}
