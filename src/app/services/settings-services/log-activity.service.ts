import { Injectable } from '@angular/core';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from '../general.service';
import { LogActivityModel, LogActivityTypeModel } from '../../models/log-activity.model';
import { Subject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { query } from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})

export class LogActivityService {
  private logActivityApi = this.endpoint.analyticsUrl;
  private logActivityTypesApi = this.endpoint.analyticsUrl;

  constructor(
    private endpoint: Endpoints,
    private http: HttpClient,
    private gs: GeneralService
  ) { }

  private _refreshNeeded$ = new Subject<void>();

  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

  /**
   * Error Handler
   */
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
    console.log(message, "Error Message");
    return of(null);
  };

  createActivityType(form: LogActivityTypeModel) {
    const body = {
      ...form,
      name: form.name,
      orgID: this.gs.orgID
    }
    return this.http.post(`${this.logActivityTypesApi}/activityType`, body);
  }

  /**
   * Get Activity Types
   */
  getActivityTypes() {
    try {
      return this.http.get(`${this.logActivityTypesApi}/${this.gs.orgID}/getActivityTypes`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }    
  }

  getSingleActivityType(name) {
    return this.http.get(`${this.logActivityTypesApi}/${this.gs.orgID}/${name}/getActivityTypeByName`);
  }

  updateActivityType(form: LogActivityTypeModel) {
    const body = {
      ...form,
      id: form.id,
      name: form.name,
      orgID: this.gs.orgID
    }
    return this.http.post(`${this.logActivityTypesApi}/editActivityType`, body);
  }

  //Activity Logs Starts Here
 /**
  * Create A New Activity Log
  * @param form 
  */
  createNewActivityLog(form) {   
    let tmpDate = form.date.toLocaleDateString().split('/');
    let logDate = `${tmpDate[1]}-0${tmpDate[0]}-${tmpDate[2]}`;
    let logTime = form.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const body = {
      ...form,
      name: form.content,
      date: `${logDate}, ${logTime}` ,
      content: form.content,
      type: form.type,
      orgID: this.gs.orgID,
      userID: this.gs.user.id
    }
    return this.http.post(`${this.logActivityTypesApi}/Activity`, body)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }

  /**
   * Fetch All Log Activity
   */
  getActivityLogs() {
    return this.http.get(`${this.logActivityApi}/Activity/${this.gs.orgID}/${this.gs.user.id}`);
  }

  /**
   * Get Activity By
   * @param id 
   */
  getSingleActivityLog(id) {
    return this.http.get(`${this.logActivityApi}/Activity/${id}`);
  }

  /**
   * Update Activity Log
   * @param form 
   */
  updateActivityLog(form: LogActivityModel) {
    const body = {
      ...form,
      id: form.id,
      activityName: form.content,
      activityType: form.type,
      content: form.content
    }
    return this.http.put(`${this.logActivityApi}/Activity/edit/${form.id}`, body);
  }

}
