import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GeneralService } from '../general.service';

@Injectable({
  providedIn: 'root',
})

export class MessagingService {

  constructor(private http: HttpClient,
              private config: Endpoints,
              private gs: GeneralService) { }

  // Messaging Api Config
  private get messageAPI() {
    const url = this.config.settingsUrl + this.config.message.baseurl;
    return url;
  }

  // Sequence Api Config
  private get sequenceAPI() {
    const url = this.config.settingsUrl + this.config.sequencing.baseurl;
    return url;
  }

   // Mail Sequence Api Config
  private get mailSequenceAPI() {
    const url = this.config.settingsUrl + this.config.mailSequencing.baseurl;
    return url;
  }


  // CREATE =>  POST: add a new message template to the server
  createMessage(message): Observable<any> {
    return this.http
      .post<any>(this.messageAPI + this.config.message.new, message)
      .pipe(catchError(this.gs.handleError));
  }

  /**
   * PULL => GET : GET Messaging By Category
   * @param categoryName 
   */
  getMessageByCategory(categoryName): Observable<any> {
    return this.http
      .get<any>(this.messageAPI + '/' + this.gs.orgID + `/${categoryName}` + this.config.message.byCategory)
      .pipe(catchError(this.gs.handleError));
  }

   /**
    *  PULL => GET : GET Messaging By ID
    * @param messageId 
    */
   getMessageById(messageId: number): Observable<any> {
    return this.http
      .get<any>(this.messageAPI  + `/${messageId}` + this.config.message.byId)
      .pipe(catchError(this.gs.handleError));
  }

   // Clone => GET : GET Messaging ID
   cloneMessage(messageId: number): Observable<any> {
    return this.http
      .get<any>(this.messageAPI  + `/${messageId}` + this.config.message.clone)
      .pipe(catchError(this.gs.handleError));
  }

  // UPDATE => PUT: update the Messaging on the server
  updateMassage(message): Observable<any> {
    return this.http.post(this.messageAPI + this.config.message.edit, message)
      .pipe(catchError(this.gs.handleError));
  }

  // DELETE => delete the Messaging from the server
  deleteMessage(messageId: number): Observable<any> {
    const url = this.messageAPI + `/${messageId}` + this.config.message.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.gs.handleError));
  }

/** Sequencing */
  // CREATE =>  POST: add a new sequencing template to the server
  createSequence(sequence): Observable<any> {
    return this.http
      .post<any>(this.sequenceAPI + this.config.sequencing.new, sequence)
      .pipe(catchError(this.gs.handleError));
  }

    // PULL => GET : GET sequencing By Org
  getSequencingByOrg(): Observable<any> {
    return this.http
      .get<any>(this.sequenceAPI + '/' + this.gs.orgID  + this.config.sequencing.getByOrg)
      .pipe(catchError(this.gs.handleError));
  }

    // PULL => GET : GET sequencing By Name
  getSequenceById(sequencingId: number): Observable<any> {
    return this.http
      .get<any>(this.sequenceAPI + `/${sequencingId}` + this.config.sequencing.getByName)
      .pipe(catchError(this.gs.handleError));
  }

   // DELETE => delete the sequencing from the server
  deleteSequencing(sequencingId: number): Observable<any> {
    const url = this.messageAPI + `/${sequencingId}` + this.config.sequencing.delete;
    return this.http.delete<any>(url)
      .pipe(catchError(this.gs.handleError));
  }

     // Clone => GET : GET Messaging ID
   cloneSequence(sequencingId: number): Observable<any> {
    return this.http
      .get<any>(this.messageAPI  + `/${sequencingId}` + this.config.sequencing.clone)
      .pipe(catchError(this.gs.handleError));
  }

  /** MAIL Sequencing */
  // CREATE =>  POST: add a new Mail sequencing template to the server

  createMailSequence(mailSequence): Observable<any> {
    return this.http
      .post<any>(this.mailSequenceAPI + this.config.mailSequencing.new, mailSequence)
      .pipe(catchError(this.gs.handleError));
  }

    // PULL => GET : GET Mail sequencing By Org
  getMailSequencingByParentId(parentId: number): Observable<any> {
    return this.http
      .get<any>(this.mailSequenceAPI + '/' + this.gs.orgID + `/${parentId}`  + this.config.mailSequencing.getByParentId)
      .pipe(catchError(this.gs.handleError));
  }

    // PULL => GET : GET Mail sequencing By Name
  getMailSequenceById(mailSequencingId: number): Observable<any> {
    return this.http
      .get<any>(this.mailSequenceAPI + `/${mailSequencingId}` + this.config.mailSequencing.getById)
      .pipe(catchError(this.gs.handleError));
  }

}
