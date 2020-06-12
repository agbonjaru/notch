import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { AppState } from 'src/app/store/app.state';
import { GeneralService } from './../general.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: "root"
})

export class TeamsService {
  url = this.endpoint.signUpEndpoint;
  org;
  userID;
  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
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
   * Create Team(s)
   * @param payload 
   */
  createTeam(payload): Observable<any> {
    return this.http
      .post<any>(this.url + "/newTeam", payload);
  }

  /**
   * Updating Teams
   * @param id 
   * @param noOfDeals 
   * @param newTeamName 
   * @param noOfDealsWon 
   * @param noOfInvoices 
   * @param noOfDealsLost
   * @param self
   * @param teamLead 
   * @param enabled 
   */
  updateTeam(id, noOfDeals, newTeamName, noOfDealsWon, noOfInvoices, noOfDealsLost, self, teamLead, enabled) {
    const payload = {
      enabled: enabled,
      id: id,
      noOfDeals: noOfDeals,
      teamName: newTeamName,
      noOfDealsWon: noOfDealsWon,
      noOfInvoices: noOfInvoices,
      organizationId: this.org.id,
      self: self,
      teamLead: teamLead,
      noOfDealsLost: noOfDealsLost,
    };
    return this.http.post(this.url + "/teamUpdate", payload);
  }

  /**
   * Getting all teams 
   */
  fetchAllTeams() {
    try {
      return this.http.get(this.url + "/allTeams/" + this.org.id)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Fetch Team By ID
   * @param id 
   */
  fetchTeamId(id) {
    try {
      return this.http.get(this.url + `/getTeam/${id}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Adding SalesPerson
   * @param param0 
   */
  addSalesperson({ teamID, salesPerson }) {
    const body = {
      orgID: this.org.id,
      teamID,
      salesPerson,
    };
    return this.http.post(this.url + "/teamMembers", body);
  }

  /**
   * Fetch all team memebers of the Teams By ID
   * @param teamId 
   */
  fetchTeamMembers(teamId) {
    return this.http.get(this.url + `/getTeamMemberList/${teamId}`);
  }

  assignTeamLead(body) {
    const url = this.url + `/assignTeamLead/${body.teamID}/${body.leadID}`;
    return this.http.post(url, body);
  }

  /**
   *new Teams Custom Filter
   * @param POST
   */
  newTeamsPersonCustomFilter(body) {
    const payload = { ...body, orgID: this.org.id, userID: this.userID };
    return this.http.post(this.url + "/newTeamCustomFilter", payload);
  }

  /**
   *FETCH Teams Custom Filter
   * @param GET
   */
  fetchAllTeamsFilter() {
    return this.http.get(
      this.url + `/${this.org.id}/${this.userID}/getTeamCustomFilters`
    );
  }

  /**
    *GET Filtered Teams
    * @param GET
    */
  getFilteredTeams(id) {
    return this.http.get(this.url + `/${id}/${this.org.id}/${this.userID}/getFilteredTeams`);
  }

  /**
   * Filtered Teams By Number Of Invoices
   * @param data
   */
  getFilteredTeamsByNumberOfInvoices(data: { from, to }) {
    return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/getFilteredTeamsByNumberOfInvoices`);
  }
  
  /**
   * Filtered Teams By Deal Types
   * @param data 
   */
  getFilteredTeamsByDeal(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/getFilteredTeamsByNumberOfDeals`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
* Filtered Teams By Deal Won
* @param data 
*/
  FilteredSalesPersonsByNumberOfDealsWon(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/getFilteredTeamsByNumberOfDealsWon`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
  * Filtered Teams By Deal Lost
  * @param data 
  */
  FilteredSalesPersonsByNumberOfDealsLost(data: { from, to }) {
    try {
      return this.http.get(this.url + `/${data.from}/${data.to}/${this.org.id}/getFilteredTeamsByNumberOfDealsLost`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  /**
   *GET Teams Custom Filter by ID
   * @param GET
   */
  getTeamsCustomFilter(id) {
    return this.http.get(this.url + `/${id}/${this.org.id}/${this.userID}/getTeamCustomFilter`);
  }

  /**
  *EDIT Teams Custom Filter
  * @param POST
  */
  editFilter(body) {
    const payload = { ...body, orgID: this.org.id, userID: this.userID };
    return this.http.post(this.url + '/updateTeamCustomFilter', payload)
  }

  /**
  *GET Teams Custom Filter BY ID
  * @param GET
  */
  fetchFilteredTeams(id) {
    return this.http.get(this.url + `/${id}/${this.org.id}/${this.userID}/getFilteredTeams`)
  }

  /**
  *DELETE Teams Custom Filter BY ID
  * @param DELETE
  */
  deleteSTeamsCustomFilter(id) {
    return this.http.delete(this.url + `/${id}/deleteTeamCustomFilter`);
  }

}
