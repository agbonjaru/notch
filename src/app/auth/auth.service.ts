import { Store } from "@ngrx/store";
import { LocalStorageService } from "./../utils/LocalStorage";
import { Injectable } from "@angular/core";
import * as UserAction from "../store/actions/user.action";
import { AppState } from "../store/app.state";
import { SignupLoginService } from "../services/signupLogin.service";
import { TokenVerification } from "../utils/TokenVerification";
import { AllUserInfoModel } from "../store/storeModels/user.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  CurrentUser = "currentUser";
  isLoggedIn = false;
  user;
  allUserInfo: AllUserInfoModel;

  // store the URL so we can redirect after logging in
  redirectUrl: string;
  constructor(
    private localStorage: LocalStorageService,
    private store: Store<AppState>,
    private users: SignupLoginService
  ) {
    store.select("userInfo").subscribe((info) => {
      if (info) {
        this.allUserInfo = info;
      }
    });
    this.user = this.localStorage.getFromLocalStorage(this.CurrentUser);
  }

  login() {
    const token = JSON.parse(
      this.localStorage.getFromLocalStorage("AdminUsertoken")
    );
    // const status = this.token.verifyToken(token);
    console.log(status, "1019");
    status ? (this.isLoggedIn = true) : (this.isLoggedIn = false);
    if (!status) {
      this.localStorage.deleteFromLocalStorage("AdminUserInfo");
      this.localStorage.deleteFromLocalStorage("AdminUsertoken");
    }
    return status;
  }

  logout(): void {
    // this.localStorage.deleteFromLocalStorage(this.CurrentUser);
    this.localStorage.clearLocalStorage();
    this.store.dispatch(new UserAction.RemoveAllInfo());
  }

  verifiedEmail() {
    this.users.getOneUser("id").subscribe((res) => {});
    return true;
  }
  get getCurrentUser(): AllUserInfoModel {
    if (this.user) {
      return JSON.parse(this.user);
    } else {
      return null;
    }
  }
  isUserLoggedIn() {    
    if (this.allUserInfo && this.allUserInfo.token && this.allUserInfo.token!==null) {
      return true;
    } else {
      return false;
    }
  }

  storeUser(data) {
    console.log("call store user");
    const promise = new Promise((resolve, reject) => {
      if (data) {
        const {
          token,
          priviledges,
          roleName,
          organization,
          user,
          userProfile,
          orgProfile,
          groupName,
          teamID,
          groupID,
          modules,
          supervisor
        } = data;
        let roles = [];
        if (priviledges && Array.isArray(priviledges)) {
          priviledges.forEach((priv) => {
            if (priv.priviledge) {
              roles.push(priv.priviledge);
            }
          });
        }
        const newUser = {
          ...user,
          userImg: userProfile,
          groupName,
          teamID,
          groupID,
        };
        const newOrg = { ...organization, orgImg: orgProfile, modules };
        const userInfo = {
          token,
          priviledges: roles,
          roleName,
          organization: newOrg,
          user: newUser,
          supervisor
        };
        this.store.dispatch(new UserAction.UpdateAllInfo(userInfo));
        this.localStorage.saveToLocalStorage("currentUser", userInfo);
        resolve("user store updated successful");
      } else {
        reject(new Error("storing user data in store error"));
      }
    });
    return promise;
  }
  updateUser(Userdata) {
    const data = {
      ...this.allUserInfo,
      user: { ...this.allUserInfo.user, ...Userdata },
    };
    this.localStorage.saveToLocalStorage(this.CurrentUser, data);
    this.store.dispatch(new UserAction.UpdateUser(Userdata));
  }
  updateOrg(Orgdata) { 
    const data = {...this.allUserInfo, organization: {...this.allUserInfo.organization, ...Orgdata}}    
    this.localStorage.saveToLocalStorage(this.CurrentUser, data)
    this.store.dispatch(new UserAction.UpdateOrg(Orgdata))
  }
}
