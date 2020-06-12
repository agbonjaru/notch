import { Component, OnInit, AfterViewInit } from '@angular/core';
import dropDownToggle from 'src/app/utils/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import $ from 'jquery';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { LeadWorkflowService } from 'src/app/services/client-services/lead-workflow.service';
import { GeneralService } from 'src/app/services/general.service';
import DateUtils from 'src/app/utils/date';
import FormValidator from 'src/app/utils/form-validator';

// MODELS
import { CategorizedLeadWorkflows } from '../../models/categorized-lead-workflows.model';

@Component({
  selector: 'app-lead-nav',
  templateUrl: './lead-nav.component.html',
  styleUrls: ['./lead-nav.component.css']
})


export class LeadNavComponent implements OnInit, AfterViewInit {
  private dateHandler = new DateUtils;
  private formValidator;
  editMode = false;
  //
  userId: number;
  leadInfoIsFetched = false;
  leadWorkflowIsFetched = false;
  leadInfo: any;
  leadWorkflow: CategorizedLeadWorkflows;
  max_date_of_birth: Date = new Date();

  callsInfo = {
    data: [[80, 20]],
    title: 'Calls: 6',
    labels: ['Successful - 2, 80%', 'Unsuccessful - 0, 20%']
  };
  meetingInfo = {
    data: [[10, 90]],
    title: 'Message: 9',
    labels: ['Successful - 0, 10%', 'Unsuccessful - 9, 90%']
  };

  constructor(
    private genServ: GeneralService,
    private leadService: LeadService,
    private leadWorkflowService: LeadWorkflowService,
  ) { }

  ngOnInit() {
    this.userId = this.genServ.user.id;
    this.max_date_of_birth.setDate(this.max_date_of_birth.getDate() - 1);
    
    this.leadService.local_lead_info.subscribe(info => {
      if (!this.genServ.checkIfObjectIsEmpty(info)) {
        this.setLeadInfo(info);
        this.leadInfoIsFetched = true;

        //
        this.assignLeadOwner({ ...this.leadInfo }, this.userId);

        this.leadWorkflowService.fetchLeadWorkflows(this.leadInfo.id).subscribe(res => {
          if (res.success) {
            this.leadWorkflow = this.categorizeWorkflowItems([...res.payload]);

            const { cold, warm, hot } = this.leadWorkflow;
            const orderedWorkflow = [...cold, ...warm, ...hot];
            const workflows = this.buildWorkflowItemRelationships(orderedWorkflow);

            //
            if (!this.leadInfo.isNew) {
              this.leadWorkflowService.setIsStarted();
            }

            this.beginWork();
            this.leadWorkflowService.setWorkflows(workflows);
            this.leadWorkflowIsFetched = true;
          }
        });
      }
    });

    this.leadService.local_lead_info.subscribe( info => {
      if (!this.genServ.checkIfObjectIsEmpty(info)) {
        this.setLeadInfo({ ...info });
      }
    });
  }

  ngAfterViewInit() {
    this.cancel();
  }

  setLeadInfo(info) {
    this.leadInfo = { ...info };
    this.leadInfo.regDate = this.leadInfo.regDate == null ? '' : this.dateHandler.convertTimestampToDate(this.leadInfo.regDate);
    this.leadInfo.dateOfBirth = this.leadInfo.dateOfBirth == null ? '' : this.dateHandler.convertTimestampToDate(this.leadInfo.dateOfBirth);
    this.leadInfo.yearOfEstablishment = this.leadInfo.yearOfEstablishment == null ? '' : this.leadInfo.yearOfEstablishment;
    this.leadInfo.yearOfIncorporation = this.leadInfo.yearOfIncorporation == null ? '' : this.leadInfo.yearOfIncorporation;
    this.leadInfo.staffStrength = this.leadInfo.staffStrength == null ? '' : this.leadInfo.staffStrength;
  }


  assignLeadOwner(leadInfo, ownerId) {
    if (!leadInfo.owner) {
      this.leadService.updateLead({
        ...leadInfo,
        owner: ownerId,
        leadIsNew: false
      }).subscribe(response => {
        if (response.success) {
          this.setLeadInfo({...leadInfo, ...response.payload});
          this.leadService.local_lead_info.next({ ...leadInfo, ...response.payload});
        }
      })
    }
  }

  categorizeWorkflowItems(items): CategorizedLeadWorkflows {
    let categorizedItems: CategorizedLeadWorkflows = {
      cold: [],
      warm: [],
      hot: []
    };

    for (let i = items.length - 1; i >= 0; i--) {
      const workflowItem = items[i];
      categorizedItems[workflowItem.category.toLowerCase()].push({
        ...workflowItem
      });
    }

    return categorizedItems;
  }

  buildWorkflowItemRelationships(items): object {
    let workflows = {};
    let prev = null;
    workflows[prev] = {};

    for (let i = 0; i < items.length; i++) {
      const workflowItem = items[i];
      const { id } = workflowItem;

      workflows[id] = {};
      workflows[id].body = { ...workflowItem }; // assign the workflow info
      workflows[id].stat = workflowItem.isDone; // assign the workflow's done status
      workflows[id].prev = prev // assign the lead's immediate previous neighbor
      workflows[prev].next = id;  // assign the lead's immediate next neighbor

      prev = workflowItem.id;
    }

    return workflows;
  }

  beginWork() {
    if (!this.leadWorkflowService.getIsStarted()) {
      const currentTime = Math.floor(Date.now() / 1000);
      this.leadService.updateLead({
        ...this.leadInfo,
        lastWorkflowTime: currentTime,
        isNew: false
      }).subscribe(res => {
        if (res.success) {
          this.setLeadInfo({ ...res.payload });
          this.leadService.local_lead_info.next({ ...this.leadInfo, ...res.payload });
          this.leadWorkflowService.setIsStarted();
        }
      })
    }
  }

  toggleClass(className, dropdownClass) {
    dropDownToggle(className, dropdownClass);
  }

  edit() {
    this.editMode = true;
    $("#lead-info").hide();
    $("#lead-info-edit").show();
  }

  cancel() {
    this.editMode = false;
    $("#lead-info").show();
    $("#lead-info-edit").hide();
  }

  extractFormData(InputElements) {
    let formData = {};
    InputElements.forEach(input => {
      formData = {
        ...formData,
        [input.name]: input.value
      }
    });

    return formData;
  }

  updateLead() {
    const leadForm: any = document.querySelectorAll(`form[name='leadUpdateForm'] input`);
    this.formValidator = new FormValidator(leadForm);
    if (!this.formValidator.validate()) {
      this.genServ.sweetAlertError(`Invalid form data supplied`);
      return;
    }
    let formData : any = {
      ...this.extractFormData(leadForm)
    };

    const currentDay = this.dateHandler.getCurrentDayInSeconds();
    if (Date.parse(formData.dateOfBirth) >= Number(currentDay)) {
      this.genServ.sweetAlertError(`Invalid date of birth`);
      return;
    }

    this.genServ.sweetAlertFileUpdates('Lead').then(res => {
      if (res.value) {
        this.leadService.updateLead({...this.leadInfo, ...formData}).subscribe(res2 => {
          if (res2.success) {
            const { payload } = res2;
            this.setLeadInfo(payload);
            this.leadService.local_lead_info.next({ ...this.leadInfo, ...payload })
            this.cancel();
            this.genServ.sweetAlertFileUpdateSuccessWithoutNav('Lead');
            // console.log(res, 'update about company response');
          } else {
            this.genServ.sweetAlertFileUpdateErrorWithoutNav('Lead');
          }
        }, error => {
          console.log(error, 'error');
        });
      } else {
        this.cancel();
      }
    });
  }

}
