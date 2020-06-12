import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { GeneralService } from 'src/app/services/general.service';
import DateUtils from 'src/app/utils/date';

@Component({
  selector: 'app-lead-to-contact',
  templateUrl: './lead-to-contact.component.html',
  styleUrls: ['./lead-to-contact.component.css']
})
export class LeadToContactComponent implements OnInit {
  leadId: string;
  teamId: number;
  userId: number;
  info: any = {};
  leadToContactForm: any;
  alertCode: number = -1;
  alertMessage: any = "";

  loading = false;
  showMore = false;

  dateHelper = new DateUtils;
  max_date_of_birth: Date = new Date();

  constructor(
    private leadService: LeadService,
    private formBuilder: FormBuilder,
    private generalService: GeneralService
  ) { }

  ngOnInit() {
    this.max_date_of_birth.setDate(this.max_date_of_birth.getDate() - 1);
    
    this.leadService.local_lead_info.subscribe( info => {
      if (!this.generalService.checkIfObjectIsEmpty(info)) {
        this.teamId = Number(this.generalService.user.teamID);
        this.userId = Number(this.generalService.user.id);
        
        this.leadId = info.id;
        delete info.id;
        for (let key in info) {
          this.info[key] = info[key] == undefined ? '' : info[key];
        }
        
        this.leadToContactForm = this.formBuilder.group({
          firstName: [this.info.firstName, Validators.required],
          surName: [this.info.surName, Validators.required],
          email: [this.info.email, Validators.required],
          otherName: [this.info.otherName],
          dateOfBirth: [this.info.dateOfBirth],
          maritalStatus: [this.info.maritalStatus],
          maidenName: [this.info.maidenName],
          spouseName: [this.info.spouseName],
          occupation: [this.info.occupation],
          personalPhoneNumber: [this.info.personalPhoneNumber],
          officialPhoneNumber: [this.info.officialPhoneNumber],
          whatsappNumber: [this.info.whatsappNumber],
          otherEmail: [this.info.otherEmail],
          postalAddress: [this.info.postalAddress],
          fax: [this.info.fax],
          zip: [this.info.zip],
          stateOfOrigin: [this.info.stateOfOrigin],
          nextOfKin: [this.info.nextOfKin],
          nextOfKinRelationship: [this.info.nextOfKinRelationship]
        });
      }
    });
  }

  submit(form : FormGroup) {
    const currentDay = this.dateHelper.getCurrentDayInSeconds();

    if (!form.valid) {
      this.displayAlert(0, "Please, fill all required fields");
      return;
    }

    if (form.value.email && !this.generalService.checkEmailIsValid(form.value.email)) {
      this.displayAlert(0, 'Please enter a valid email address');
      return;
    }
    
    if (Date.parse(form.value.dateOfBirth) >= Number(currentDay)) {
      this.displayAlert(0, "Please, enter a valid date");
      return;
    }

    if (this.info.clientId) {
      this.displayAlert(0, "Lead has already been converted.");
      return;
    }

    if (!this.leadService.canBeConvertedToClient) {
      this.displayAlert(0, "Workflow not yet completed.");
      return;
    }

    //
    this.loading = true;
    this.leadService.createContact({
      ...this.info, 
      ...form.value, 
      leadId: this.leadId,
      teamId: this.teamId,
      createdBy: this.userId,
    }).subscribe(response => {
      this.loading = false;
      if(response.success) {
        const leadData = this.leadService.getLeadInfo();
        const { clientId } = response.payload;
        this.leadService.updateLead({
          ...leadData,
          id: this.leadId,
          clientId,
          clientType: 'contact',
          isActive: false
        }).subscribe(response => {
          if (response.success) {

            this.leadService.local_lead_info.next({
              ...response.payload,
              id: this.leadId
            });

            this.displayAlert(1, "Lead conversion successful");
          } else {
            this.displayAlert(0, "Lead conversion failed");
          }
        }, error => {
          console.log(error.message);
        });
      }
    }, error => {
      console.log(error.message);
    });
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
  }
  
  displayAlert(code, message) {
    this.alertCode = code;
    this.alertMessage = message;

    setTimeout(() => {
      this.alertCode = -1;
      this.alertMessage = ""
    }, 2000);
  }

}
