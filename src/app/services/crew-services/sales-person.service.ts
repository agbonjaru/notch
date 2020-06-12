import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { AppState } from 'src/app/store/app.state';

@Injectable({
  providedIn: "root"
})
export class SalesPersonService {

  url = this.endpoints.signUpEndpoint;
  org;
  userID;

  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe(info => {
      this.org = info.organization;
      this.userID = info.user.id;
    });
  }

  /**
   * Error Handler
   */
  private handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    return of(null);
  };

  /**
   * Get all Salesperson
   */
  fetchAllSalePersons() {
    return this.http.get(this.url + `/listOfSalesPerson/${this.org.id}`)
  }

  /**
  * Get all Salesperson at are active in the organization
  */
  fetchActiveSalesperson() {
    return this.http.get(this.url + `/listOfActivatedUsers/${this.org.id}`);
  }

  /**
   * Fetch User/Salesperson By Id
   * @param id 
   */
  fecthUser(id) {
    try {
      return this.http.get(this.url + `/getUser/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }    
  }

  /**
   * Get User/Salesperson BasiC Deatails
   * @param id 
   */
  getBasicUserDetails(id) {
    return this.http.get(this.url + `/${this.org.id}/${id}/getBasicUserDetails`);
  }

  /**
   * Fetch User/Salesperson Pic
   * @param id 
   */
  fecthUserPic(id) {
    return this.http.get(this.url + `/profile_pics/${id}/${this.org.id}`);
  }

  /**
   * Update User/Salesperson
   * @param body 
   */
  updateSalesPerson(body) {
    return this.http.post(this.url + "/editUser", body);
  }

  /**
   * Get  User/Salesperson Target
   * @param pId 
   */
  getSalespersonTargets(pId) {
    try {
      return this.http
        .get(`${this.endpoints.targetServiceUrl}/user/user-targets/${pId}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  /**
   * Get Teams Target
   * @param tId 
   */
  getTeamTargets(tId) {
    try {
      return this.http
        .get(`${this.endpoints.targetServiceUrl}/user/team/targets/${tId}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  /**
   *  Get User/Salesperson Commission
   * @param pId 
   */
  getSalespersonCommissions(pId) {
    try {
      return this.http
        .get(
          `${this.endpoints.targetServiceUrl}/user/user-commissions/${pId}`
        )
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }

  /**
   * Create SalesPerson Custom Filter
   * @param body 
   */
  newSalesPersonCustomFilter(body) {
    const payload = { ...body, orgID: this.org.id, userID: this.userID };
    return this.http.post(this.url + "/newSalesPersonCustomFilter", payload);
  }

  /**
   * Fetch Filter
   */
  fetchFilter() {
    return this.http.get(
      this.url + `/${this.org.id}/${this.userID}/getSalesPersonCustomFilters`
    );
  }

  /**
   * Filtered SalesPerson By Number Of Invoices
   * @param data 
   */
  FilteredSalesPersonsByNumberOfInvoices(data: { from, to }) {
    return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/FilteredSalesPersonsByNumberOfInvoices`);
  }

  /**
   * Filtered SalesPerson By Deal Total
   * @param data 
   */
  FilteredSalesPersonsDeals(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/FilteredSalesPersonsDeals`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
  * Filtered SalesPerson By Deal Won
  * @param data 
  */
  FilteredSalesPersonsByNumberOfDealsWon(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/FilteredSalesPersonsByNumberOfDealsWon`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
  * Filtered SalesPerson By Deal Lost
  * @param data 
  */
  FilteredSalesPersonsByNumberOfDealsLost(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/FilteredSalesPersonsByNumberOfDealsLost`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Get  SalesPersons Custom Filter by ID
   * @param id 
   */
  getSalesPersonCustomFilter(id) {
    return this.http.get(this.url + `/${id}/${this.org.id}/${this.userID}/getSalesPersonCustomFilter`);
  }

  /**
   * Get Filtered SalesPersons bY id
   * @param id 
   */
  getFilteredSalesPersons(id) {
    try {
      return this.http.get(this.url + `/${id}/${this.org.id}/${this.userID}/getFilteredSalesPersons`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
    *EDIT Teams Custom Filter
    * @param Body
    */
  editFilter(body) {
    const payload = { ...body, orgID: this.org.id, userID: this.userID };
    return this.http.post(this.url + '/editSalesPersonCustomFilter', payload)
  }

  /**
   * Delete SalesPersons Filter By ID    
   * @param id 
   */
  deleteSalesPersonCustomFilter(id) {
    return this.http.delete(this.url + `/${id}/deleteSalesPersonCustomFilter`);
  }

}
