import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})

export class TemplateSequencingService {

  constructor(private http: HttpClient,
              private config: Endpoints,
              private gs: GeneralService) { }

  // Templating Sequencing Api Config
  private get templateSequencingAPI() {
    const url = this.config.settingsUrl + this.config.message.baseurl;
    return url;
  }


  // CREATE =>  POST: add a new message template to the server
  createMessage(message): Observable<any> {
    return this.http
      .post<any>(this.templateSequencingAPI + this.config.message.new, message)
      .pipe(catchError(this.gs.handleError));
  }

  // PULL => GET : GET Messaging By Category
  getMessageByCategory(categoryName): Observable<any> {
    return this.http
      .get<any>(this.templateSequencingAPI + '/' + this.gs.orgID + `/${categoryName}` + this.config.message.byCategory)
      .pipe(catchError(this.gs.handleError));
  }

  // PULL => GET : GET Messaging By ID
  getMessageById(messageId: number): Observable<any> {
    return this.http
      .get<any>(this.templateSequencingAPI + `/${messageId}` + this.config.message.byId)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the Messaging on the server
  updateMassage(message): Observable<any> {
    return this.http.put(this.templateSequencingAPI + this.config.message.edit, message)
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the Messaging from the server
  deleteMessage(messageId: number): Observable<any> {
    const url = this.templateSequencingAPI + `/${messageId}` + this.config.message.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.gs.handleError));
  }


}
