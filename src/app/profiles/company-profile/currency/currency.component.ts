import { Component, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/services/currency.service';

import currencies from './currencies';
import { GeneralService } from 'src/app/services/general.service';
import FormValidator from 'src/app/utils/form-validator';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.css']
})
export class CurrencyComponent implements OnInit {
  currency_selector_config: any = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 2,
    allowSearchFilter: true
  };

  form_validator: any;

  orgID: any;
  recordId: any;
  loading: boolean = false;

  all_currencies: Array<any> = [];
  user_currencies: any = { };
  user_base_currency: string = '';
  base_currency: string = '';
  selected_currencies: any = {};
  selected_currencies_array: any = [];

  constructor(
    private currency_service: CurrencyService,
    private general_service: GeneralService
  ) {
    this.orgID = this.general_service.orgID;
  }

  ngOnInit() {
    this.all_currencies = this.format_currencies_for_ui(currencies);
    this.currency_service.org_currencies.subscribe(org_currencies => {
      if (!this.general_service.checkIfObjectIsEmpty(org_currencies)) {
        this.user_currencies = org_currencies.currencies;
        this.recordId = org_currencies.id;
        this.base_currency = org_currencies.base_currency;
        this.user_base_currency = org_currencies.base_currency;
        this.discard_changes();
      }
    }, err => {
      console.log(err.message);
    })
  }

  format_currencies_for_ui(data) {
    const parsed_json_data = data;
    let array_data = [];

    for (let i in parsed_json_data) {
      const currency = data[i];
      array_data.push({
        item_id: currency.code,
        item_text: `${currency.name} (${currency.symbol})`,
        item_symbol: currency.symbol
      });
    }

    return array_data;
  }

  format_currencies_for_db(data) {
    let formatted_data = [];
    for (let i in data) {
      const selection = data[i];
      formatted_data.push({
        base_currency: this.base_currency,
        currency_code: selection.item_id,
        currency_name: selection.item_text,
        currency_symbol: currencies[selection.item_id].symbol,
        rate: selection.item_id == this.base_currency ? 1 : selection.rate
      });
    }

    return formatted_data;
  }

  format_db_data_for_ui(data) {
    let formatted_data = {};
    for (let i in data) {
      const item = data[i];
      formatted_data = {
        ...formatted_data,
        [item.currency_code.toUpperCase()]: {
          item_id: item.currency_code,
          item_text: item.currency_name,
          item_symbol: item.currency_symbol,
          rate: item.rate
        }
      }
    }

    return formatted_data;
  }

  change_base_currency(currency?) {
    for (let i in this.selected_currencies) {
      this.selected_currencies[i.toUpperCase()].rate = undefined;
    }
  }

  select_base_currency(item_id) {
    this.selected_currencies[item_id.toUpperCase()].rate = 1;
  }

  add_currency_rate(item_id, rate) {
    const regex = /[^0-9\.]/g;
    if (regex.test(rate)) {
      document.getElementById(item_id).style.borderColor = 'red';
      rate = 0;
    } else {
      document.getElementById(item_id).style.borderColor = '#dddddd';
    }

    const cleaned_rate: number = parseFloat(rate)
    this.selected_currencies[item_id.toUpperCase()].rate = cleaned_rate;
  }

  select_all(items) {
    items.forEach(item => {
      this.select_item(item);
    });
  }

  unselect_all(items) {
    this.discard_changes();
  }

  select_item(item) {
    this.selected_currencies = {
      ...this.selected_currencies,
      [item.item_id.toUpperCase()]: {
        ...item,
        rate: undefined
      }
    };
    this.selected_currencies_array = this.transform_object_to_array(this.selected_currencies);
  }

  unselect_item(item) {
    delete this.selected_currencies[item.item_id.toUpperCase()];
    this.selected_currencies_array = this.transform_object_to_array(this.selected_currencies);
  }

  transform_object_to_array(object) {
    let transformed_array = [];
    for (let i in object) {
      transformed_array.push(object[i]);
    }
    return transformed_array;
  }

  validate_rate_values() {
    const currencies = this.format_currencies_for_db(this.selected_currencies);
    for (let i in currencies) {
      if (!currencies[i.toUpperCase()].rate || Number(currencies[i.toUpperCase()].rate) <= 0) {
        return false
      }
    }

    return true;
  }

  change_was_made() {
    const user_currencies = Object.keys(this.user_currencies);
    const selected_currencies = Object.keys(this.selected_currencies);

    if(user_currencies.length !== selected_currencies.length) return true;

    for (let currency_code in this.selected_currencies) {
      if (!this.user_currencies[currency_code.toUpperCase()]) return true;
      if (this.user_currencies[currency_code.toUpperCase()].rate !== this.selected_currencies[currency_code.toUpperCase()].rate) return true;
    }

    return false;
  }

  discard_changes() {
    this.base_currency = this.user_base_currency;
    this.selected_currencies = this.format_db_data_for_ui(this.user_currencies);
    this.selected_currencies_array = this.transform_object_to_array(this.selected_currencies);
  }

  save_changes() {

    if (!this.validate_rate_values()) {
      this.general_service.sweetAlertError('Please enter valid rates');
      return;
    }

    if (!this.change_was_made()) {
      this.general_service.sweetAlertError('No changes were made');
      return;
    }

    const rates_to_save = {
      id: this.recordId,
      currencies: this.format_currencies_for_db(this.selected_currencies)
    };

    this.general_service.sweetAlertUpdates('Save Currencies').then(response => {
      if (response.value) {
        this.loading = true;
        if (this.recordId) {
          this.currency_service.update_organisation_currencies(rates_to_save).subscribe((response: any) => {
            this.loading = false;
            this.process_response(response);
          }, err => {
            this.loading = false;
          });
        } else {
          this.currency_service.save_organisation_currencies(rates_to_save).subscribe((response: any) => {
            this.loading = false;
            this.process_response(response);
          }, err => {
            this.loading = false;
          });
        }
      }
    });
  }

  process_response(response) {
    if (response.success) {
      this.currency_service.org_currencies.next({
        id: response.payload.id,
        base_currency: response.payload && response.payload.currencies.length > 0 ? response.payload.currencies[0].base_currency : '',
        currencies: this.currency_service.format_db_currency_data_for_client(response.payload.currencies)
      });
      this.general_service.sweetAlertSucess('Changes saved successfully');
    } else {
      this.general_service.sweetAlertError('Could not save changes');
    }
  }

}
