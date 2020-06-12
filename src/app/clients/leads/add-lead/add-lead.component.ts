import { Component, OnInit } from '@angular/core';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { GeneralService } from 'src/app/services/general.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { COUNTRIES } from "src/app/data/nations";

@Component({
  selector: 'app-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.css']
})
export class AddLeadComponent implements OnInit {
  loading: boolean = false;
  lead_class: string = "";

  owner: any;
  teamId: any;
  contact_form: FormGroup;
  company_form: FormGroup;

  form_message: string = '';
  form_message_class: string = '';

  /** */
  nations: Observable<any>;
  config = {
    search: true, // true/false for the search functionlity defaults to false,
    placeholder: "Select Country", // text to be displayed when no item is selected defaults to Select,
    limitTo: 10, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
    noResultsFound: "No results found!", // text to be displayed when no items are found while searching
    searchPlaceholder: "search"
  };

  constructor(
    private lead_service: LeadService,
    private general_service: GeneralService,
    private form_builder: FormBuilder
  ) {
    this.owner = this.general_service.user.id;
    this.teamId = this.general_service.user.teamID;
   }

  ngOnInit() {
    this.nations = new Observable(observer => {
      observer.next(this.extract_object_values(COUNTRIES, "name"));
    });

    this.contact_form = this.form_builder.group({
      firstName: ['', Validators.required],
      surName: ['', Validators.required],
      email: [''],
      occupation: ['']
    });

    this.company_form = this.form_builder.group({
      name: ['', Validators.required],
      email: [''],
      industry: [''],
      country: [''],
      state: ['']
    });
  }

  /**
   * 
   * @param object object to extarct values from
   * @param key current key
   */
  extract_object_values(object, key) {
    let dropDown = [];
    switch (key) {
      case "name":
        object.forEach(element => dropDown.push(element.name));
        break;
      case "value":
        object.forEach(element => dropDown.push(element.value));
        break;
    }

    return dropDown;
  }

  show_company_form() {
    return this.lead_class === 'company'
  }

  show_contact_form() {
    return this.lead_class === 'contact'
  }

  get_form() {
    if (this.lead_class === 'contact') {
      return this.contact_form;
    }

    if (this.lead_class === 'company') {
      return this.company_form;
    }
  }

  create_lead() {
    const lead_form: FormGroup = this.get_form();

    if (!lead_form.valid) {
      this.display_form_message('Please enter required data', false);
      return;
    }

    if (lead_form.value.email && !this.general_service.checkEmailIsValid(lead_form.value.email)) {
      this.display_form_message('Please enter a valid email address', false);
      return;
    }

    this.loading = true;
    const creation_data: any = {
      ...lead_form.value,
      owner: this.owner,
      teamId: this.teamId,
      source: 'Direct',
      sourceValue: this.lead_class === 'contact' ? `${lead_form.value.surName} ${lead_form.value.firstName}` : lead_form.value.name
    }


    this.lead_service.createLead(creation_data).subscribe((response: any) => {
      this.loading = false;
      if (response.success) {
        this.display_form_message('Lead created successfully', true);
        this.contact_form.reset();
        this.company_form.reset();
        this.lead_service.new_lead.next(response.payload);
      } else {
        this.display_form_message('Lead creation failed', false);
      }
    }, (error: any) => {
      this.loading = false;
      console.log(error.message)
    })
  }

  /**
   * Display success or error messages
   * @param message Message to be displayed
   * @param is_success Suceess flag.
   */
  display_form_message (message: string, is_success: boolean) {
    this.form_message_class = is_success ? 'alert alert-success' : 'alert alert-danger';
    this.form_message = message;

    setTimeout(() => {
      this.form_message = '';
      this.form_message_class = ''
    }, 2500);
  }
}
