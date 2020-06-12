import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from "../../general.service";

import { MsalService } from "@azure/msal-angular";
import { Office365OuthSettings } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class OfficeService {
  /** */
  public authenticated: boolean;
  constructor(
    private msalService: MsalService
  ) {
    this.authenticated = false;
  }

  async signIn(): Promise<void> {
    let result = await this.msalService.loginPopup(Office365OuthSettings)
      .catch(error => {
        console.log('Microsoft log in failed', error);
      });

    if (result) {
      this.authenticated = true;
    }
  }

  signOut(): void {
    this.msalService.logout();
    this.authenticated = false;
  }

  async getAccessToken(): Promise<string> {
    try {
      let result = await this.msalService.acquireTokenSilent(Office365OuthSettings)
      console.log(result);
      return result.accessToken;
    } catch (error) {
      console.log('Failed to get token', error);
    };
  }
}
