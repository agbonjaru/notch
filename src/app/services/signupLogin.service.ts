import { OrgModel } from "./../store/storeModels/user.model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { catchError, mergeMap } from "rxjs/operators";
import Swal from "sweetalert2";

import { SignupModel } from "../models/signUp.model";
import { Endpoints } from "../shared/config/endpoints";
import { GeneralService } from "./general.service";
import { UserModel } from "../store/storeModels/user.model";
import { Store } from "@ngrx/store";
import { AppState } from "../store/app.state";

@Injectable({
  providedIn: "root",
})
export class SignupLoginService {
  otpInfo = new BehaviorSubject<any>("");
  private signupUrl = this.endpoints.signUpEndpoint;
  private adminApi = this.endpoints.adminUrl;
  private user: UserModel;
  private org: OrgModel;
  private token: string;
  constructor(
    private http: HttpClient,
    private endpoints: Endpoints,
    private gs: GeneralService,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe((info) => {
      if (info) {
        this.org = info.organization ? info.organization : null;
        this.user = info.user ? info.user : null;
        this.token = info.token ? info.token : null;
      }
    });
  }

  // Handle Errors
  private handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " SignUp Error Message");
    if (message.includes("Email")) {
      Swal.fire({
        type: "error",
        title: "Oops...",
        text: "Email Already Exist!",
      });
    }
    return of(null);
  };

  // Merge Endpoints
  private get createUserUrl() {
    return this.signupUrl + this.endpoints.signUpApis.createUser;
  }
  private get getAllUsersUrl() {
    return this.signupUrl + this.endpoints.signUpApis.getAllUsers;
  }
  private get getOneUserUrl() {
    return this.signupUrl + this.endpoints.signUpApis.getOneUser;
  }

  // User Registration

  registerUser(payload: SignupModel) {
    const body = {
      ...payload,
      city: "",
      country: "",
      dateOfBirth: "",
      emailConfirm: false,
      mobileNo: "",
      phoneNo: "",
      state: "",
      street: "",
      token: "",
      website: "",
    };
    return this.http.post(this.createUserUrl, body);
  }

  getAllUsers() {
    try {
      return this.http
        .get(this.getAllUsersUrl)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
  verifyUser(userid) {
    return this.http.get(this.signupUrl + "/validateUser/" + userid);
  }
  getUserByUserRel(id) {
    return this.http.get(this.signupUrl + "/getUserByUserRel/" + id);
  }
  verifyAccount(id) {
    return this.http.get(this.signupUrl + "/validateUser/" + id);
  }
  updateNewAccount(payload) {
    return this.http.post(this.signupUrl + "/update/activateUser/", payload);
  }
  loginUser(payload: { email: string; password: string }) {
    const { email: username, password } = payload;
    return this.http.post(this.signupUrl + `/doLogin`, { username, password });
  }

  logoutUser() {
    return this.http.get(this.signupUrl + "/logout/" + this.token);
  }

  verifyOTP(payload) {
    const { username, optVal } = payload;
    return this.http.post(
      this.signupUrl + `/validateOTP/${username}/${optVal}`,
      {}
    );
  }
  getAllUserActiveOrganizations(userID) {
    return this.http.get(
      this.signupUrl + `/getAllUserActiveOrganizations/${userID}`
    );
  }
  getUsersInOrganization(orgId) {
    return this.http.get(this.signupUrl + `/getUsersInOrganization/${orgId}`);
  }

  fetchAllUserOrg(userID) {
    return this.http.get(this.signupUrl + `/${userID}/getUserOrganizations`);
  }
  updateUser(payload) {
    const body = {
      ...this.user,
      ...payload,
      country: payload.country+''
    }
    return this.http.post(this.signupUrl + "/editUser", body);
  }
  updateOrg(payload) {
    const body = {
      ...this.org,
      ...payload,
      country: payload.country+''
    }
    return this.http.post(this.signupUrl + "/editOrganization", body);
  }
  switchTenant(orgID) {
    const body = {
      orgID: orgID,
      token: this.token,
    };
    const _url = this.signupUrl + `/${orgID}/${this.token}/switchTenant`;
    return this.http.post(_url, body);
  }
  generalSwitchTenant(orgID: number, token) {
    const payload = {
      orgID: orgID,
      token: token,
    };
    const _url = this.signupUrl + `/${orgID}/${token}/switchTenant`;
    return this.http.post(_url, payload);
  }
  changePwd({ opass, npass }) {
    const path = `/changePass/${this.user.email}/${opass}/${npass}`;
    return this.http.post(this.signupUrl + path, {});
  }
  fetchUserPercent() {
    return this.http.get(
      this.signupUrl + `/getUserProfilePercentage/${this.user.id}`
    );
  }
  uploadUserImg(file: File, uploadType?) {
    let endpoint = "/ProfilePics";
    endpoint =
      uploadType === "update" ? endpoint + "/profile-update" : endpoint;
    const fd = new FormData();
    fd.append("file", file, file.name);
    const path = `${endpoint}/${this.user.id}/${this.org.id}`;
    return this.http.post(this.signupUrl + path, fd);
  }
  uploadOrgImg(file: File, uploadType?) {
    let endpoint = "/Organization";
    endpoint = uploadType === "update" ? "update" : endpoint;
    const fd = new FormData();
    fd.append("file", file, file.name);
    const path = `/OrganizationProfilePics/${endpoint}/${this.org.id}`;
    return this.http.post(this.signupUrl + path, fd);
  }
  addTax(body) {
    return this.http.post(this.signupUrl + "/addTax", {
      ...body,
      orgID: this.org.id,
    });
  }
  fetchTax() {
    return this.http.get(this.signupUrl + `/${this.org.id}/getTaxes`);
  }

  getAllTaxes() {
    return this.http.get(this.signupUrl + `/${this.org.id}/getAllTaxes`);
  }

  deactivateTax(id) {
    return this.http.get(this.signupUrl + `/deactivateTax/${id}/`);
  }

  deletTax(id) {
    return this.http.delete(this.signupUrl + `/${id}/deleteTax`);
  }

  fetchsalesPersonTeams(id?) {
    const salesID = id ? id : this.user ? this.user.id : 0;
    const orgId = this.org && this.org.id ? this.org.id : 0;
    const req = this.http.get(this.signupUrl + `/getSalespersonTeams/${orgId}/${salesID}`)
    return this.mapTeamSelf(req);
  }
  fetchSupervisorTeams() {
    const req = this.http.get(this.signupUrl + `/getSupervisorTeams/${this.org.id}/${this.user.email}`)
    return this.mapTeamSelf(req);
  }
  mapTeamSelf(observable: Observable<any>) {
    return observable.pipe(
      mergeMap((data: any[]) => of(data ? data.map((dat) => {
              if(dat.teamID==this.user.teamID) {
                return {
                  teamID: dat.teamID,
                  teamName: 'Self',
                }
              } else {
                return {...dat}
              }
            }) : "")));
  }
  fetchLicenseByName(plan?) {
    const orgPlan = plan ? plan : this.org.plan;
    return this.http.get(this.adminApi + `/${orgPlan}/getLicenseByName`);
  }
  getLicenseFromBilling() {
    return this.http.get(
      this.adminApi + `/${this.org.id}/getLicenseFromBilling`
    );
  }
  getOneUser(id) {
    try {
      return this.http
        .get(`${this.getOneUserUrl}/${id}`)
        .pipe(catchError(this.handleError));
    } catch (error) {
      alert(error);
    }
  }
  addSupervisor(payload: any[]) {
    const body = { orgID: this.org.id, userIDs: payload.map((x) => x.id) };
    return this.http.post(this.signupUrl + "/addSupervisor", body);
  }
  fetchSupervisor() {
    return this.http.get(this.signupUrl + "/getSupervisors/" + this.org.id);
  }
  deleteSupervisor(superEmail) {
    return this.http.delete(
      this.signupUrl + `/${this.org.id}/${superEmail}/deleteSupervisor`
    );
  }
  addSubordinate({ supervisorEmail, userEmails }) {
    const body = {
      orgID: this.org.id,
      supervisorEmail,
      userEmails: userEmails.map((x) => x.email),
    };
    return this.http.post(this.signupUrl + "/addSubordinate", body);
  }
  fetchSubordinates(email) {
    return this.http.get(
      this.signupUrl + `/getSubordinates/${this.org.id}/${email}`
    );
  }
  deleteSubordinate(superEmail, subEmail) {
    return this.http.delete(
      this.signupUrl +
        `/${this.org.id}/${superEmail}/${subEmail}/deleteSubordinate`
    );
  }
}
