import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Endpoints } from '../../shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorService {

  constructor(private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService) { }

  // Two Factor Api Config
  private get TwoFactorAPI() {
    const url = this.config.settingsUrl + this.config.twoFactorAuth.baseurl;
    return url;
  }

  // CREATE =>  POST: add a new Auth to the server
  createTwoFactorAuth(auth): Observable<any> {
    return this.http
      .post<any>(this.TwoFactorAPI + this.config.twoFactorAuth.save, auth)
      .pipe(catchError(this.gs.handleError));
  }

  // Update =>  POST: add a new Auth to the server
  getAuthByCompany(): Observable<any> {
    return this.http
      .get<any>(this.TwoFactorAPI + '/' + this.gs.orgID + this.config.twoFactorAuth.byCompany)
      .pipe(catchError(this.gs.handleError));
  }

  // PULL => GET : GET Auth By Name
  getAuthByRoleName(roleName): Observable<any> {
    return this.http
      .get<any>(this.TwoFactorAPI + '/' + this.gs.orgID + `/${roleName}` + this.config.twoFactorAuth.byRole)
      .pipe(catchError(this.gs.handleError));
  }
}
