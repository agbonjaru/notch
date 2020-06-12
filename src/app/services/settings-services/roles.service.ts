import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Endpoints } from 'src/app/shared/config/endpoints';

import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService {

  constructor(private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService) { }

  // Roles Api Config
  private get roleAPI() {
    const url = this.config.settingsUrl + this.config.roles.baseurl;
    return url;
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

  // PULL => GET : GET All Roles
  getAllRoles() {
    try {
      return this.http.get(this.roleAPI + '/' + this.gs.orgID + this.config.roles.get)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  // CREATE =>  POST: add a new role to the server
  createRole(role): Observable<any> {
    return this.http.post<any>(this.roleAPI + this.config.roles.new, role)
  }
  editRole(payload) {
    const body = { ...payload, orgID: this.gs.orgID }
    return this.http.post(this.roleAPI + this.config.roles.edit, body);
  }

  // PULL => GET : GET Roles By Name
  getRoleByName(roleName: any): Observable<any> {
    return this.http
      .get<any>(this.roleAPI + '/' + this.gs.orgID + `/${roleName}` + this.config.roles.byId)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the role on the server
  updateRole(role): Observable<any> {
    return this.http.put(this.roleAPI + this.config.roles.edit, role)
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the role from the server
  deleteRole(rolesName: string): Observable<any> {
    const url = this.roleAPI + '/' + this.gs.orgID + `/${rolesName}` + this.config.roles.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.gs.handleError));
  }


}
