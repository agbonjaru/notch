import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { GeneralService } from 'src/app/services/general.service';
import { Observable, Subject } from "rxjs";
import { COUNTRIES } from "src/app/data/nations";

@Component({
  selector: 'app-lead-to-company',
  templateUrl: './lead-to-company.component.html',
  styleUrls: ['./lead-to-company.component.css']
})
export class LeadToCompanyComponent implements OnInit {
  //
  leadId: string;
  teamId: number;
  userId: number;
  info: any = {};
  leadToCompanyForm: any;
  
  alertCode: number = -1;
  alertMessage: any = "";
  loading = false;

  nations: Observable<any>;
  country: string;


  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select Country", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };


  constructor(
    private leadService: LeadService,
    private formBuilder: FormBuilder,
    private generalService: GeneralService
  ) { }

  ngOnInit() {
    this.teamId = Number(this.generalService.user.teamID);
    this.userId = Number(this.generalService.user.id);

    this.nations = new Observable(observer => {
      observer.next(this.extractValueFromObject(COUNTRIES, "name"));
    });

    this.leadService.local_lead_info.subscribe(info => {
      if (!this.generalService.checkIfObjectIsEmpty(info)) {
        //
        this.leadId = info.id;
        delete info.id;

        for (let key in info) {
          this.info[key] = info[key] == undefined ? '' : info[key];
        }

        this.leadToCompanyForm = this.formBuilder.group({
          name: [this.info.name, Validators.required],
          email: [this.info.email, Validators.required],
          industry: [this.info.industry, Validators.required],
          country: [this.info.country || '', Validators.required],
          state: [this.info.state, Validators.required]
        });
      }
    })
  }

  submit(form: FormGroup) {
    if (!form.valid) {
      this.displayAlert(0, "Please, fill all required fields");
      return;
    }

    if (form.value.email && !this.generalService.checkEmailIsValid(form.value.email)) {
      this.displayAlert(0, 'Please enter a valid email address');
      return;
    }

    if (this.info.clientId) {
      this.displayAlert(0, "Lead has already been converted.");
      return;
    }

    if (!this.leadService.canBeConvertedToClient) {
      this.displayAlert(0, "This lead cannot be converted to a client yet");
      return;
    }
    //
    this.loading = true;
    this.leadService.createCompany({
      ...this.info,
      ...form.value,
      country: this.country,
      leadId: this.leadId,
      teamId: this.teamId,
      createdBy: this.userId,
    }).subscribe(response => {
      this.loading = false;
      if (response.success) {
        const leadData = this.leadService.getLeadInfo();
        const { clientId } = response.payload;
        this.leadService.updateLead({
          ...leadData,
          id: this.leadId,
          clientId,
          clientType: 'company',
          isActive: false
        }).subscribe(response => {
          if (response.success) {
            this.displayAlert(1, "Lead conversion successful");
            setTimeout(() => this.leadService.local_lead_info.next({ ...response.payload }), 200);
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

  private extractValueFromObject(object, key) {
    const dropDown = [];
    switch (key) {
      case "name":
        object.forEach(element => {
          dropDown.push(element.name);
        });
        break;
      case "value":
        object.forEach(element => {
          dropDown.push(element.value);
        });
        break;
    }
    return dropDown;
  }

  displayAlert(code, message) {
    this.alertCode = code;
    this.alertMessage = message;

    setTimeout(() => {
      this.alertCode = -1;
      this.alertMessage = ""
    }, 2500);
  }
}
