import { Component, OnInit, Input } from '@angular/core';
import { LogActivityModel } from '../../../../models/log-activity.model';
import { LogActivityService } from '../../../../services/settings-services/log-activity.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, } from 'rxjs';
import { Router } from '@angular/router'
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GeneralService } from 'src/app/services/general.service';
import { ClientTaskService } from 'src/app/services/task/client-task.service';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { noWhitespaceValidator } from 'src/app/utils/no-whitespace.validator';
import EmailAnimations from '../email/animations';

@Component({
  selector: 'app-log-activity',
  templateUrl: './log-activity.component.html',
  styleUrls: ['./log-activity.component.css']
})
export class LogActivityComponent implements OnInit {
  mytime: any = "00 : 00 : 00 AM";

  @Input() component_id: any;
  html_ids: any = {};
  emailAnimations;
  showLoading: boolean = false;
  activityLogs: any = [];

  addLogActivityForm = new FormGroup({
    type: new FormControl(''),
    content: new FormControl('', [Validators.required, noWhitespaceValidator]),
    date: new FormControl(''),
    time: new FormControl('')
  });

  constructor(
    private logActSrv: LogActivityService,
    private generalSrv: GeneralService
  ) { }

  ngOnInit() {
    this.fetchLogActivityTypes();
    this.emailAnimations = new EmailAnimations(this.component_id);
  }

  /**
   * Fetch Activity Type
   */
  private fetchLogActivityTypes() {
    this.logActSrv.getActivityTypes().subscribe(activityLogs => {
      this.activityLogs = activityLogs;
    })
  }

  /**
  * Add New Activity Log
  */
  onAddNewActivityLog() {
    this.addNewActivityLog();
  }

  resetForm() {
    this.addLogActivityForm.patchValue({
      type: '',
      content: '',
      date: '',
      time: '',
    });
    this.mytime = "00 : 00 : 00 AM";
  }

  /**
   * Add New Activity Log
   */
  addNewActivityLog() {
    this.showLoading = true;    
    console.log(this.addLogActivityForm.getRawValue(), 'this.addLogActivityForm.getRawValue()');
    this.logActSrv.createNewActivityLog(this.addLogActivityForm.getRawValue()).subscribe((data: any) => {
      this.showLoading = false;
      this.generalSrv.sweetAlertCreateSuccessWithoutNav('Activity Log');
      this.resetForm();
    }, (error) => {
      this.showLoading = false;
      this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(error));
    })
  }

}
