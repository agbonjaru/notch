import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { Endpoints } from "../../shared/config/endpoints";
import { GeneralService } from "../general.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ClientService {
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private genServ: GeneralService
  ) {}

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    console.log(error, "er");
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " Clients Error Message");
    return of(null);
  };

  // Merge Endpoints
  private get getAllClientsUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.clients.getOneGetAllClients
    );
  }
  private get getOneClientUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.clients.getOneGetAllClients
    );
  }
  private get getClientsByFilterUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.clients.getOneGetAllClients
    );
  }

  private get getClientsMergeUrl() {
    return (
      this.endpoints.leadsCompaniesContactClientsEndpoint +
      this.endpoints.clients.mergeCompanyContact
    );
  }

  // Clients Creation

  getAllClients() {
    return this.http.get(this.getAllClientsUrl);
  }

  getClientWildcard(value) {
    return this.http.get(
      this.endpoints.leadsCompaniesContactClientsEndpoint +
        `/clients/wildcard/${value}`
    );
  }

  //get array of

  getClientsByFilter(query) {
    console.log(query);
    try {
      return this.http
        .get(this.getClientsByFilterUrl + query)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  getOneClients(id) {
    try {
      return this.http
        .get(`${this.getOneClientUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  mergerClients(fromClientId, toClientId) {
    try {
      return this.http
        .put(`${this.getClientsMergeUrl}/${fromClientId}/${toClientId}`, {})
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  importClients(payload) {
    const url = `${this.endpoints.fourFourSixEndpoint}/clients/imports`;
    return this.http.post(url, payload);
  }

  // const headers = new HttpHeaders();
  //   headers.set('Content-Type', undefined);
  //   return this.http.post(environment.baseURL+'api/v1/company/someFileUpload' , formData, {headers: headers})
  //     .pipe(
  //       catchError(this.formatErrors)
  //     );

  // addContactToCompany
  // :fromClientId/:toClientId
}
