import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  private _base_uri: string;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints
  ) { 
    const { fourFourSixEndpoint, bankAccounts } = this.endpoints;
    this._base_uri = `${fourFourSixEndpoint}/${bankAccounts.baseUrl}`;
  }

  public create_bank_record(data) {
    return this.http.post(this._base_uri, {...data});
  }

  public update_bank_record(data) {
    return this.http.put(this._base_uri, {...data});
  }

  public fetch_bank_records() {
    return this.http.get(this._base_uri);
  }

  public delete_bank_record(id) {
    return this.http.delete(`${this._base_uri}/${id}`);
  }
}
