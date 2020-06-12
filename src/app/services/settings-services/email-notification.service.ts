import { OrgModel } from 'src/app/store/storeModels/user.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Endpoints } from 'src/app/shared/config/endpoints';
import * as io from 'socket.io-client';

import { GeneralService } from '../general.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.state';
import { catchError } from 'rxjs/operators';
import { NotificationResponse } from 'src/app/models/settings/notification';

@Injectable({
  providedIn: 'root',
})

export class EmailNotificationService {

  org: OrgModel;
  userID;
  socket: any;
  private api = this.config.notificationsServiceUrl;
  url = this.config.signUpEndpoint;
  readonly socketUrl: string = this.api;

  new_mail: any = new BehaviorSubject<any>({});

  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe(info => {
      this.org = info.organization;
      this.userID = info.user.id;
    });

    this.socket = io(this.socketUrl, {
      query: {
        orgId: this.org.id
      }
    });
    
    console.log(this.socket,'000----9999');
    
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

  /* Notification SetUp */
  /**
   * POST NOtification Settings
   * @param payload 
   */
  saveNotSetting(payload) {
    return this.http.post(this.api + '/events/organization', payload)
  }

  /**
   * Fetch All Notifications Events
   */
  getEvents() {
    return this.http.get(this.api + `/events`)
  }

  /**
 * POST NOtification Settings
 * @param payload 
 */
  UpdateNotSetting(payload) {
    return this.http.put(this.api + '/events/organization', payload)
  }

  /**
   * GET All Notification Settings
   */
  getNotSetting() {
    return this.http.get(this.api + `/events/organization/${this.org.id}`)
  }

  /**
   * Fetch Notification By Filter (Role-Name)
   * @param query 
   */
  getNotificationByRoles(query): Observable<NotificationResponse> {
    try {
      return this.http.get(this.api + `/events/organization/filter?${query}`)
        .pipe(catchError(this.handleError));
    } catch (e) {
      alert(e);
    }
  }

  get_socket() {
    return this.socket;
  }

  /**
  *  Get User By roles
  * @param role
  */
  getUsersByRoles(role: any) {
    return this.http.get(this.url + `/listOfActivatedUsersByRoles/${this.org.id}/${role}`);
  }

  /* Notification */
  /**
   * Connection to Socket IO
   */
  connect() {
    this.socket.on('connect', () => {
      console.log('Notification socket connection');
    });
  }

  /* POST  clicked NOtification
  * @param payload 
  */
  onClick(payload) {
    return this.http.post(this.api + '/notifications/user', payload)
  }

  /**
   * Fetch the Clicked Notification
   */
  getClickedNotify() {
    const query = `userId=${this.userID}&orgId=${this.org.id}`;
    return this.http.get(this.api + `/notifications/user?${query}`)
  }

  createSeenRecord(id) {
    const body = {
      orgId: this.org.id,
      userId: this.userID,
      notifications: [id]
    }
    return this.http.post(this.api + '/notifications/user', body);
  }

  updateSeenRecord(notifyId, notifications) {
    const body = {
      orgId: this.org.id,
      userId: this.userID,
      notifications: [...notifications],
      _id: notifyId,
      createdOn: new Date().getTime() + ''
    }
    return this.http.put(this.api + `/notifications/user/${notifyId}`, body)
  }

  getOrgNotification(query) {
    return this.http.get(this.api + `/notifications/organization/${this.org.id}?${query}` )
  }

}

