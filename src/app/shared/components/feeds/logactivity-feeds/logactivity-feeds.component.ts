import { Component, OnInit } from '@angular/core';
import { LogActivityService } from '../../../../services/settings-services/log-activity.service';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import * as $ from 'jquery';
@Component({
  selector: 'app-logactivity-feeds',
  templateUrl: './logactivity-feeds.component.html',
  styleUrls: ['./logactivity-feeds.component.css']
})
export class LogactivityFeedsComponent implements OnInit {

  showLoading: boolean = false;
  showEditLoading: boolean = false;
  selectedActivityID: string = '';

  activityType: any = [];
  activityLogs: any = [];
  editedOrgAct: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private logActSrv: LogActivityService,
    private generalSrv: GeneralService
  ) { }


  editActivityForm = this.formBuilder.group({
    content: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    id: new FormControl('')
  });



  ngOnInit() {
    this.FetchAllActivityLogs();
    this.fetchLogActivityTypes();

    //refresh logs
    this.logActSrv.refreshNeeded$
      .subscribe(() => {
        this.FetchAllActivityLogs()
      })
  }

  /**
   * View Activity Log
   * @param id
   */
  onViewSingleActivity(id) {
    this.editedOrgAct = {};
    this.showLoading = true;
    this.selectedActivityID = id;
    this.viewSingleActivity(id);
  }

  /**
  * Edit Activity Log
  */
  onEditActivity() {
    this.editActivityForm.patchValue({ id: this.selectedActivityID });
    this.editActivity();
  }

  get f() { return this.editActivityForm.controls; }

  /**
   * View Activity Log
   * @param id 
   */
  private viewSingleActivity(id) {
    this.logActSrv.getSingleActivityLog(id)
      .subscribe((editedOrgAct) => {
        this.showLoading = false;
        this.editedOrgAct = editedOrgAct;
        this.f.content.setValue(this.editedOrgAct.content);
        this.f.type.setValue(this.editedOrgAct.type);
        this.f.id.setValue(this.editedOrgAct.id);
      });
  }

  /**
   * Edit Activity Log
   */
  private editActivity() {
    this.showEditLoading = true;
    this.logActSrv.updateActivityLog(this.editActivityForm.getRawValue()).subscribe((data: any) => {
      this.showEditLoading = false;
      $("#closeLogModal").click();
      this.generalSrv.sweetAlertFileUpdateSuccessWithoutNav('Activity');
      this.activityLogs = this.FetchAllActivityLogs();
    }, (error) => {
      this.showEditLoading = false;
      $("#closeLogModal").click();
      this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
    })

  }

  /**
   * Fetch Activity Type
   */
  private fetchLogActivityTypes() {
    this.logActSrv.getActivityTypes().subscribe(activityType => {
      this.activityType = activityType;
    })
  }

  /**
   * Fetch All Activity Logs
   */
  private FetchAllActivityLogs() {
    this.logActSrv.getActivityLogs()
      .subscribe((activityLogs) => {
        this.activityLogs = activityLogs;
      })
  }

}
