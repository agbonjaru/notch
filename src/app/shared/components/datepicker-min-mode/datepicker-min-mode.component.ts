import { Component, OnInit } from '@angular/core';
 
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
 
@Component({
  selector: 'datepicker-min-mode',
  templateUrl: './datepicker-min-mode.component.html'
})
export class DatepickerMinModeComponent implements OnInit {
  bsValue: Date = new Date();
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
 
  ngOnInit(): void {
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode
    });
  }
}