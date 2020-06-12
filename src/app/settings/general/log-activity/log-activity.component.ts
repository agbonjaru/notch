import { Component, OnInit } from '@angular/core';
declare var $: any;
import { LogActivityService } from 'src/app/services/settings-services/log-activity.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';

@Component({
  selector: 'app-log-activity',
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css']
})
export class LogActivityComponent implements OnInit {
  p: number = 1;
  orgActivityTypes: any = [];
  editedOrgActType: any = {};
  showLoading: boolean = false;


  loader: any = {
    default: "notch-loader",
    spinnerType: "jsBin",
    spinnerStyle: { top: '25%' },
    dataless: {
      title: "No Data Available!",
      subTitle: "Please  try again",
      action: "Load Notification",
      success: true
    },
    showSpinner: false
  };

  constructor(
    private logActSrv: LogActivityService,
    private generalSrv: GeneralService
  ) {
    this.loader.spinnerType = this.loader.default;
   }

  ngOnInit(
  ) {
    this.fetchActivityTypes();
  }

  addActivityTypeForm = new FormGroup({
    name: new FormControl('', [Validators.required, noWhitespaceValidator])
  })

  editActivityTypeForm = new FormGroup({
    name: new FormControl('', [Validators.required, noWhitespaceValidator]),
    id: new FormControl('')
  })

  onAddActivityType() {
    this.addActivityType();
  }

  onFetchSingleActivityType(name) {
    this.logActSrv.getSingleActivityType(name).subscribe((editedOrgActType) => {
      this.editedOrgActType = editedOrgActType;
    });
  }

  onSaveEditedActType(id) {
    this.editActivityType();
  }

  /**
   * Get Activity Type
   */
  private fetchActivityTypes() {
    this.loader.showSpinner = true;
    this.logActSrv.getActivityTypes().subscribe((orgActivityTypes) => {
      this.initializeLoad(orgActivityTypes);
    });
  }

  /**
  * Internet Loading
  * @param data 
  */
  initializeLoad(data) {
    if (data === null || data === undefined) {
      const setError = {
        title: "We couldn't load the data.",
        subTitle: "Kindly Check your Internet & Click Reload to try again.",
        action: "Reload",
        success: false
      };
      this.loader.dataless = setError;
      this.loader.spinnerType = "dataless";
    } else {
      this.orgActivityTypes = data;
      this.loader.showSpinner = false;
    }
  }

  /**
   * ADD Activity Type
   */
  private addActivityType() {
    this.showLoading = true;
    if(this.addActivityTypeForm.valid) {
      this.logActSrv.createActivityType(this.addActivityTypeForm.getRawValue()).subscribe((data: any)=> {
        this.showLoading = false;
        $("#addModal").click();
        this.addActivityTypeForm.reset();
        this.fetchActivityTypes();
        this.generalSrv.sweetAlertCreateSuccessWithoutNav('Activity Type');
      }, (error) => {
          $("#addModal").click();
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

  /**
   * edit Activity Type
   */
  private editActivityType() {
    this.showLoading = true;
    this.editActivityTypeForm.patchValue({id: this.editedOrgActType.id})
    if(this.editActivityTypeForm.valid) {
      this.logActSrv.updateActivityType(this.editActivityTypeForm.getRawValue()).subscribe((data: any)=> {
        this.showLoading = false;
        $("#updateModal").click();
        this.fetchActivityTypes();
        this.generalSrv.sweetAlertFileUpdateSuccessWithoutNav('Activity Type');
      }, (error) => {
          $("#updateModal").click();
        this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
      })
    }
  }

  // Reload Spinner
  async reloadSpinner() {
    this.loader.spinnerType = this.loader.default;
    await this.fetchActivityTypes();
  }

  // Allow user to add a lead when there is none.
  async onActionState() {
    if (this.loader.dataless.success === true) $("#ModalCenter4").show();
    else await this.reloadSpinner();
  }

}
