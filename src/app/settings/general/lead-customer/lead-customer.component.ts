import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { GeneralService } from 'src/app/services/general.service';
import { LeadsCustomersService } from 'src/app/services/settings-services/leads-customers.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lead-customer',
  templateUrl: './lead-customer.component.html',
  styleUrls: ['./lead-customer.component.css'],
})
export class LeadCustomerComponent implements OnInit {
  message: any = {};

  lead_loading: boolean = false;
  customerLoading = false;

  supported_lead_sources: any = {};
  organisation_lead_sources: any = {};

  sources_to_display: any = {};
  selected_source: string = '';

  constructor(
    private lead_customer_service: LeadsCustomersService,
    public general_service: GeneralService
  ) {
    $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    this.load_lead_sources();
  }

  load_lead_sources() {
    const fetch_supported_lead_sources = this.lead_customer_service.fetch_lead_sources();
    const fetch_organisation_lead_sources = this.lead_customer_service.fetch_organisation_lead_sources();

    forkJoin([fetch_supported_lead_sources, fetch_organisation_lead_sources]).subscribe((responses: any) => {
      this.supported_lead_sources = this.convert_array_to_object(responses[0].payload)
      this.organisation_lead_sources = this.convert_array_to_object(responses[1].payload);
      console.log(this.supported_lead_sources);
      this.reset_sources_to_display();
    });
  }

  reset_sources_to_display() {
    let sources = { ...this.supported_lead_sources };
    for (let id in this.organisation_lead_sources) {
      console.log(id);
      delete sources[id]
    }
    
    console.log(sources);
    this.sources_to_display = { ...sources };
  }

  create_organisation_lead_source() {
    const name = this.selected_source;

    if (!name) {
      this.general_service.sweetAlertError('No Lead Source Selected.');
      return;
    }

    this.general_service.sweetAlertCreate('Lead Source').then(allow => {
      if (allow.value) {
        this.lead_loading = true;
        this.lead_customer_service.create_organisation_lead_source({ name }).subscribe((response: any) => {
          this.lead_loading = false;
          if (response.success) {
            this.general_service.sweetAlertCreateSuccessWithoutNav('Lead Source');
            this.organisation_lead_sources = {
              ...this.organisation_lead_sources,
              [response.payload.name.toLowerCase()]: { ...response.payload }
            };
            this.reset_sources_to_display();
          } else {
            this.general_service.sweetAlertError(' Could not Add lead source')
          }
        }, error => {
          this.lead_loading = false;
        });
      }
    });
  }

  delete_organisation_lead_source(id, name) {
    this.general_service.sweetAlertGeneralDelete('Lead Source', 'Delete').then(result => {
      if (result.value) {
        this.lead_customer_service.delete_organisation_lead_source(id).subscribe((response: any) => {
          if (response.success) {
            this.general_service.sweetAlertDeleteSuccess('Lead Source');
            delete this.organisation_lead_sources[name.toLowerCase()];
            this.reset_sources_to_display();
          } else {
            this.general_service.sweetAlertError(' Could not delete lead source')
          }
        });
      }
    });
  }

  convert_array_to_object(items: Array<any>) {
    let converted_items = {};
    items.forEach(item => {
      converted_items = {
        ...converted_items,
        [item.name.toLowerCase()]: { ...item }
      }
    });

    return converted_items;
  }

  convert_object_to_array(items: any) {
    let converted_items = [];
    for (let i in items) {
      converted_items.push({ ...items[i] });
    }

    return converted_items;
  }
}
