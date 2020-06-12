import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
// import { SubscriptionModel } from '../models/subscription.model';
import { BehaviorSubject, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  private server_uri: string;
  private transaction_uri: string;
  private orgId;
  private rates: any;

  /** */
  public org_currencies = new BehaviorSubject<any>({});

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {
    this.server_uri = `${this.endpoints.salesClientServiceUrl}/currencies/organisation`;
    this.transaction_uri = `${this.endpoints.salesClientServiceUrl}/transactions`;
    this.orgId = this.genServ.org ? this.genServ.org.id: '';
    this.rates = this.genServ.org ? this.genServ.org.rates : {};
  }

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " Currency Service Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get getOrgCurrencyMerger() {
    return (
      this.endpoints.organizationEndpoint +
      this.endpoints.currency.getOrgCurrency
    );
  }

  /**
   *
   * @param orgId
   */

  fetch_organisation_currencies() {
    return this.http.get(`${this.server_uri}`);
  }

  filter_organisation_currencies(query_string: string): Observable<any> {
    return this.http.get(`${this.transaction_uri}/filter?${query_string}`);
  }

  save_organisation_currencies(data) {
    return this.http.post(`${this.server_uri}`, { ...data });
  }

  update_organisation_currencies(data) {
    return this.http.put(`${this.server_uri}`, { ...data });
  }

  format_db_currency_data_for_client(data) {
    let formatted_data = {};
    data.forEach((datum) => {
      formatted_data = {
        ...formatted_data,
        [datum.currency_code.toUpperCase()]: { ...datum },
      };
    });

    return formatted_data;
  }

  get_conversion_rate(currency_code: string) {
    const code: string = currency_code.toUpperCase();
    const currencies = this.org_currencies.value.currencies;
    return currencies[code] ? currencies[code].rate : 1;
  }

  get_total_converted_value(values: any[], key?: string): number {
    let total: number = 0;
    values.forEach((value) => {
      const rate = this.get_conversion_rate(value.currency);
      const amount = value[key] || value.amount;
      if (amount <= 0 ) return;

      total += amount / rate;
    });

    return parseFloat(total.toFixed(2));
  }

  /**
   * 
   * @param base_currency_code String: The code of the organisation's base currency. e.g 'NGN'
   * @param item_currency_code String: The code of the currency the item was created in. e.g 'USD'
   * @param item_amount Number The cost of the item in the currency specified above.
   */
  get_cost_equivalents (base_currency_code: string, item_currency_code: string, item_amount: number) {
    if (item_amount === 0) return {};

    let equivalents: any = {}, base_amount: number = item_amount;
    const currencies: any = this.org_currencies.value.currencies;

    if (base_currency_code.toLowerCase() !== item_currency_code.toLowerCase()) {
      base_amount = this.convert_to_base_currency(item_amount, item_currency_code);
    }

    equivalents = { 
      [base_currency_code.toUpperCase()] : base_amount
    };

    for ( let code in currencies ) {
      equivalents = {
        ...equivalents,
        [code.toUpperCase()] : this.convert_to_other_currency(base_amount, code)
      }
    }

    return equivalents;
  }

  /**
   * 
   * @param currency_code Currency with which we want to search
   * @param from_value Minimum search value
   * @param to_value Maximum search value
   */
  get_currency_range_query_string (currency_code: string, from_value: number, to_value: number) {
    const key: string = `equivalents.${currency_code}`;
    const query = {
      [key]: { from: from_value, to: to_value }
    }

    return JSON.stringify(query);
  }


  /**
   * 
   * @param base_amount Amount in base currency
   * @param other_currency_code Currency to whoch we intend to convert
   */
  convert_to_other_currency (base_amount: number, other_currency_code: string) {
    if (base_amount <= 0) return 0;

    const rate: number = this.get_conversion_rate(other_currency_code);
    const converted_amount: number = base_amount * rate;
    return parseFloat( converted_amount.toFixed(2));
  }

  /**
   * 
   * @param amount Amount in other currency
   * @param other_currency_code Currency from which we are converting
   */
   convert_to_base_currency (amount: number, other_currency_code: string) {
     if (amount<= 0 ) return 0;

    const rate: number = this.get_conversion_rate(other_currency_code);
    const converted_amount: number = amount / rate;
    return parseFloat( converted_amount.toFixed(2));
   }
}
