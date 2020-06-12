import { Component, OnInit } from '@angular/core';
import { LeadService } from 'src/app/services/client-services/leads.service';
import { GeneralService } from 'src/app/services/general.service';
import { FitnessService } from 'src/app/services/analytics/fitness.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { EmailService } from 'src/app/services/integrations/email/email.service';
import { CompaniesService } from 'src/app/services/client-services/companies.service';
import { ContactsService } from 'src/app/services/client-services/contacts.service';

import ContextProcessor from 'src/app/shared/components/score/context-processor';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.css']
})
export class ScoreComponent implements OnInit {
  loading: boolean = false;
  alert_class: string = 'm-2 mb-0 alert ';
  alert_message: string = '';

  context_processor = new ContextProcessor;

  item_type: string;
  item_data: any;
  item_fitness: any;
  item_score: number = 0;

  org_fitness: any = {};
  analyzed_org_fitness: any = {};

  factor_list: Array<string> = [];

  user_form_selections: any = {};
  user_selection_scores: any = {};
  recommended_scores: any = {};

  constructor(
    private email_service: EmailService,
    private lead_service: LeadService,
    private company_service: CompaniesService,
    private contact_service: ContactsService,
    private general_service: GeneralService,
    private org_fitness_service: FitnessService
  ) {

  }

  ngOnInit() {
    this.email_service.email_context.subscribe(context_data => {
      if (!this.general_service.checkIfObjectIsEmpty(context_data)) {
        const { context_name, data, fitnessFactor, orgFitness } = this.context_processor.process_context_data(context_data);
        this.item_type = context_name;
        this.item_data = data;
        this.item_fitness = fitnessFactor;
        this.org_fitness = orgFitness;

        this.user_form_selections = fitnessFactor;
        this.factor_list = this.flatten_keys_into_list(this.org_fitness);
        this.process_profile_score(this.item_fitness);
      }
    });

    this.org_fitness_service.fetch_org_fitness_record().subscribe((response: any) => {
      if (response.success) {
        const fitness = response.payload[0];
        this.analyzed_org_fitness = fitness.analysisResult || fitness.fitnessFactor;
        this.set_default_form_selections();
      }
    }, (error: any) => {
      console.log(`Lead Detail Comp: ${error.message}`);
    });
  }

  flatten_keys_into_list(object) {
    let new_list = [];
    for (let key in object) {
      new_list.push(key);
    }

    return new_list;
  }

  set_default_form_selections() {
    this.factor_list.forEach(factor => {
      const user_factor = this.item_fitness[factor];
      this.user_form_selections[factor] = typeof user_factor === "string" ? user_factor || "" : "";
      this.process_user_selection(factor, user_factor);
    });
  }

  set_user_selection(key, value) {
    this.user_form_selections[key] = value;
    this.process_user_selection(key, value);
  }

  process_profile_score(factors) {
    let total_score = 0, total_factor_count = 0;
    for (let factor in factors) {
      const value = factors[factor];
      const score = value ? Number(this.org_fitness[factor].values[value].score) : 0;
      total_factor_count++;
      total_score += score;
    }

    this.item_score = total_score !== 0 && total_factor_count !== 0 ? Math.round(total_score / total_factor_count) : 0;
  }

  process_user_selection(key, value) {
    let base_score = 0, recommended_score = 0;
    if (typeof value === "string" && value) {
      base_score = Number(this.org_fitness[key].values[value].score) || 9;
      recommended_score = this.analyzed_org_fitness[key] ? Number(this.analyzed_org_fitness[key].values[value].score) : 9 ;
    }

    this.user_selection_scores = {
      ...this.user_selection_scores,
      [key]: this.process_user_selection_score(base_score)
    }
    this.recommended_scores = {
      ...this.recommended_scores,
      [key]: this.process_user_selection_score(recommended_score)
    }
  }

  process_user_selection_score(score) {
    let rating = '';
    let score_class = `font-weight-bold`;
    switch (score) {
      case 1:
      case 2:
        rating = 'LOW';
        score_class = `${score_class} text-danger`
        break;
      case 3:
        rating = 'MEDIUM';
        score_class = `${score_class} text-warning`
        break;
      case 4:
      case 5:
        rating = 'HIGH';
        score_class = `${score_class} text-success`
        break;
      default:
        rating = 'N/A';
        score = 0;
    }

    return { score, rating, score_class };
  }

  submit() {
    this.general_service.sweetAlertUpdates('Update Fitness Factor').then(fullfilled => {
      if (fullfilled.value) {
        const update_data = {
          id: this.item_data.id,
          fitnessFactor: this.user_form_selections,
        }

        if(this.general_service.checkIfObjectIsEmpty(update_data.fitnessFactor)) {
          this.display_error(0,'Fitness Factors cannot be empty');
          return;
        }

        switch (this.item_type) {
          case 'lead':
            this.update_lead(update_data);
            break;
          case 'contact':
            this.update_contact(update_data);
            break;
          case 'company':
            this.update_company(update_data);
            break;
          default:
        }
      }
    })
  }

  update_company(data) {
    this.loading = true;
    this.company_service.updateCompanies({ ...data }).subscribe(response => {
      this.loading = false;
      if (response && response.success) {
        this.process_profile_score(response.payload.fitnessFactor);
        this.display_error(1, `Update Successful`);
      } else {
        this.display_error(0, `Update Failed`);
      }
    }, error => {
      this.display_error(0, `Update Failed`);
      this.loading = false;
    })
  }

  update_contact(data) {
    this.loading = true;
    this.contact_service.updateContacts({ ...data }).subscribe(response => {
      this.loading = false;
      if (response && response.success) {
        this.process_profile_score(response.payload.fitnessFactor);
        this.display_error(1, `Update Successful`);
      } else {
        this.display_error(0, `Update Failed`);
      }
    }, error => {
      this.display_error(0, `Update Failed`);
      this.loading = false;
    })
  }

  update_lead(data) {
    this.loading = true;
    this.lead_service.updateLead({ ...data }).subscribe(response => {
      this.loading = false;
      if (response && response.success) {
        this.process_profile_score(response.payload.fitnessFactor);
        this.display_error(1, `Update Successful`);
      } else {
        this.display_error(0, `Update Failed`);
      }
    }, error => {
      this.display_error(0, `Update Failed`);
      this.loading = false;
    })
  }

  display_error(code: number, message: string) {
    switch (code) {
      case 0:
        this.alert_class = `${this.alert_class} alert-danger`;
        break;
      case 1:
        this.alert_class = `${this.alert_class} alert-success`;
        break;
      default:
    }

    this.alert_message = message;

    setTimeout(() => {
      this.alert_message = ``;
      this.alert_class = `m-2 mb-0 alert `;
    }, 3000);
  }
}
