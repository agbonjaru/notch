import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-target-subnav',
  templateUrl: './target-subnav.component.html',
  styleUrls: ['./target-subnav.component.css']
})
export class TargetSubnavComponent implements OnInit {

  constructor(public gs: GeneralService) { }

  ngOnInit() {
  }

}
