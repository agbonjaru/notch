import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Endpoints } from 'src/app/shared/config/endpoints';

import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})
export class GeneralApprovalService {
  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {}

  // User - Roles Api Config
  private get generalApprovalAPI() {
    const url = this.config.userUrl + this.config.generalApproval.baseurl;
    return url;
  }

  // Create Approval =>  POST: add a new user to the server
  createAproval(approval): Observable<any> {
    return this.http
      .post<any>(
        this.generalApprovalAPI + this.config.generalApproval.new,
        approval
      )
      .pipe(catchError(this.gs.handleError));
  }

  getAllApproval(): Observable<any> {
    return this.http
      .get<any>(
        this.generalApprovalAPI +
          '/' +
          this.gs.orgID +
          this.config.generalApproval.allApproval
      )
      .pipe(catchError(this.gs.handleError));
  }

  getAllApprovalByName(approvalName: any): Observable<any> {
    return this.http
      .get<any>(
        this.generalApprovalAPI +
          `/${approvalName}` +
          '/' +
          this.gs.orgID +
          this.config.generalApproval.getByName
      )
      .pipe(catchError(this.gs.handleError));
  }
}
