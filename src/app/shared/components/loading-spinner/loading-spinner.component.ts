import { retry } from "rxjs/operators";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "loading-spinner",
  templateUrl: "./loading-spinner.component.html",
  styleUrls: ["./loading-spinner.component.css"]
})
export class LoadingSpinnerComponent implements OnInit {
  //spinnerStatus: string;
  @Input() spinnerType: string;
  @Input() spinnerStyle: any = {};
  @Input() dataless: any = {
    title: "No data available.",
    subTitle: "No data available.",
    action: "Create"
  };
  // @Input() spinnerStyle: any = { top: '50%', height: '60px', width: '60px' };
  @Input() spinnerStatus: string;
  @Output() reloadSpinner = new EventEmitter();
  @Output() actionState = new EventEmitter();

  constructor() {
    this.spinnerType = "chase";
    this.spinnerStatus = "Loading...";
  }

  ngOnInit() {}

  retry(spinnerType) {
    // console.log(spinnerType, '...from loader');
    this.reloadSpinner.emit(spinnerType);
  }

  action(spinnerType) {
    this.actionState.emit(spinnerType);
  }
}
