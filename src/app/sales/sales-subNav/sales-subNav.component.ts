import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
@Component({
  selector: 'app-sales-subnav',
  templateUrl: '../sales-subNav/sales-subNav.component.html',
  styleUrls: ['../sales-subNav/sales-subNav.component.css'],
})
export class SalesSubnavComponent implements OnInit {
  constructor(public gs: GeneralService) {}

  ngOnInit() {}
}
