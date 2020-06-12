import { OrgModel } from "./../../store/storeModels/user.model";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Endpoints } from "src/app/shared/config/endpoints";
import { GeneralService } from "../general.service";

@Injectable({
  providedIn: "root",
})
export class UserRolesService {
  private signupUrl = this.config.signUpEndpoint;
  private org: OrgModel;
  constructor(
    private http: HttpClient,
    private config: Endpoints,
    private gs: GeneralService
  ) {
    this.org = this.gs.org;
  }

  // INVITE =>  POST: add a new user to the server
  // inviteUser(userInvite): Observable<any> {
  //   const body = {
  //     ...userInvite,
  //     firstName: userInvite.firstName.split(" ")[0],
  //     lastName: userInvite.firstName.split(" ")[1] || "Null",
  //     orgID: this.org.id
  //   };
  //   return this.http.post(this.signupUrl + "/inviteUser", body);
  // }

  // INVITE =>  POST: This service invites a user
  inviteUser(payload) {
    const body = { ...payload, orgID: this.org.id };
    return this.http.post(this.signupUrl + "/inviteUser", body);
  }

  reInviteUser(userId: number) {
    return this.http.get(this.signupUrl + "/reinvite_user/" + userId);
  }

  deactivateUser(userId: number) {
    const url = `${this.signupUrl}/${this.org.id}/${userId}/deactivateUser`;
    return this.http.get(url);
  }

  activateUser(userId: number) {
    const body = {};
    const url = `${this.signupUrl}/${this.org.id}/${userId}/changeUserOrgStatus`;
    return this.http.post(url, body);
  }

  editUser(payload) {
    const body = { ...payload, orgID: this.org.id };
    console.log(body, "body");
    return this.http.post(this.signupUrl + "/editUserInAnOrganization/", body);
  }

  getUsersByRoles(userId: number) {
    return this.http.get(this.signupUrl + "/reinvite_user/" + userId);
  }
}
