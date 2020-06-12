import { Component, OnInit } from '@angular/core';
import * as FitnessFactors from './fitness-factors';
import { GeneralService } from 'src/app/services/general.service';
import { FitnessService } from 'src/app/services/analytics/fitness.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {
  loading: boolean = false;
  is_modifiable: boolean;
  org_fitness: any;

  default_factors: any = {};
  selected_factor_values: any = {};

  factor_list: Array<string>;
  factor_value_list: Array<string> = [];

  form_factor: string = "";
  form_factor_value: string = "";
  form_factor_score: number = 1;

  factor_selections: any = {};

  org_selected_factor: string = '';
  org_selected_factors: Array<string> = [];
  org_selected_factor_values: any = {};

  constructor(
    private general_service: GeneralService,
    private analytics_service: FitnessService
  ) {
    this.default_factors = { ...FitnessFactors.default };
    this.factor_list = this.general_service.putObjectKeysInArray(this.default_factors);
  }

  ngOnInit() {
    this.analytics_service.fetch_org_fitness_record().subscribe((response: any) => {
      if (response.success) {
        this.org_fitness = { ...response.payload[0] };
        this.is_modifiable = response.payload[0].isModifiable;
        this.factor_selections = this.org_fitness.fitnessFactor || {};
        this.flatten_org_selections();
      }
    }, (error: any) => {
      console.log(error.message);
    })
  }

  select_factor(factor: string) {
    if (!factor) return;
    this.selected_factor_values = this.default_factors[factor].values;
    this.factor_value_list = this.general_service.putObjectKeysInArray(this.selected_factor_values);
  }

  build_selections(factor: string, value: string, score: number) {
    if (!this.factor_selections[factor]) {
      this.factor_selections[factor] = {
        name: this.default_factors[factor].name
      }
    }

    if (!this.factor_selections[factor].values) {
      this.factor_selections[factor].values = {
        [value]: {
          score,
          key: value,
          name: this.default_factors[factor].values[value]
        }
      }
    } else {
      this.factor_selections[factor].values = {
        ...this.factor_selections[factor].values,
        [value]: {
          score,
          key: value,
          name: this.default_factors[factor].values[value]
        }
      }
    }
  }

  flatten_org_selections() {
    this.org_selected_factors = this.general_service.putObjectKeysInArray(this.factor_selections);
  }

  display_org_factor_selections(factor) {
    this.org_selected_factor = factor;

    this.org_selected_factor_values = {
      [factor]: []
    };

    for (let value in this.factor_selections[factor].values) {
      this.org_selected_factor_values[factor].push({
        ...this.factor_selections[factor].values[value]
      });
    }
  }

  edit_factor(factor) {
    this.form_factor = factor;
    this.form_factor_score = undefined;
    this.select_factor(factor);
  }

  delete_factor(factor) {
    let selections = this.factor_selections;
    delete selections[factor];

    this.submit_delete(selections, true);
  }

  delete_factor_value(key) {
    let selections = this.factor_selections;
    delete selections[this.org_selected_factor].values[key];

    this.submit_delete(selections, false);
  }

  form_is_not_valid() {
    return (!this.form_factor || !this.form_factor_value || !this.form_factor_score);
  }

  submit_delete (data, factor_delete: boolean) {

    this.general_service.sweetAlertGeneralDelete('Delete Fitness Factor?', ' delete it').then( fulfilled => {
      if (fulfilled.value) {
        this.analytics_service.update_org_fitness_record({
          id: this.org_fitness.id,
          fitnessFactor: { ...data}
        }).subscribe ( (response: any) => {
          if (response.success) {
            this.factor_selections = { ...data }

            if (factor_delete) {
              this.flatten_org_selections();
              this.org_selected_factor = "";
              this.form_factor = "";
              this.form_factor_value = ""
              this.form_factor_score = undefined;
            } else {
              this.display_org_factor_selections(this.org_selected_factor);
            }
            this.general_service.sweetAlertDeleteSuccess('selected factor');
          } else {
            this.general_service.sweetAlertError('Could not delete selected factor');
          }
        }, (error: any) => {
          this.general_service.sweetAlertError('Could not delete selected factor');
        })
      }
    })
  }

  submit() {
    if (this.form_is_not_valid()) {
      console.log(`Please fill all fields`);
      return;
    }
    
    this.build_selections(this.form_factor, this.form_factor_value, this.form_factor_score);
    this.general_service.sweetAlertUpdates('Update Fitness Factors?').then( fulfilled => {
      if (fulfilled.value) {
        this.loading = true;
        this.analytics_service.update_org_fitness_record({
          id: this.org_fitness.id,
          fitnessFactor: { ...this.factor_selections }
        }).subscribe((response: any) => {
          this.loading = false;
          if (response.success) {
            this.flatten_org_selections();
    
            if (this.org_selected_factor.length >= 1) {
              this.display_org_factor_selections(this.org_selected_factor);
            }
    
            this.form_factor_value = "";
            this.form_factor_score = undefined;

            this.general_service.sweetAlertFileUpdateSuccessWithoutNav('Fitness Factors');
          } else {
            this.general_service.sweetAlertFileUpdateErrorWithoutNav('Fitness Factors');
          }
        }, (error: any) => {
          this.loading = false;
          console.log(error.message);
          this.general_service.sweetAlertFileUpdateErrorWithoutNav('Fitness Factors');
        });
      }
    });
  }
}
