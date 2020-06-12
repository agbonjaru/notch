import { Injectable } from '@angular/core';
import { Endpoints } from 'src/app/shared/config/endpoints';
import { GmailRedirectUri } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GmailService {
  appUri;
  private redirect_uri;
  private auth_endpoint=`https://accounts.google.com/o/oauth2/v2/auth`;
  private client_id = '860974953245-gafi8a9bndiprasaetj5484i0ur0b0gt.apps.googleusercontent.com';
  private scope='https://mail.google.com/';
  private response_type='code';
  private access_type = 'offline'

  constructor(
    private endpoints: Endpoints
   ) {
    this.appUri = `${this.endpoints.apiUrl}`;
    this.redirect_uri = GmailRedirectUri;
  }

  getAccessTokenUri() {
    const { auth_endpoint, client_id, scope, access_type, redirect_uri, response_type } = this;
    return `${auth_endpoint}?client_id=${client_id}&scope=${scope}&access_type=${access_type}&redirect_uri=${redirect_uri}&response_type=${response_type}&prompt=consent`;
  }
}
