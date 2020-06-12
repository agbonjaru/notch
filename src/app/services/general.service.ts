import { AllUserInfoModel } from './../store/storeModels/user.model';
import { OrgModel } from "src/app/store/storeModels/user.model";
import { Store } from "@ngrx/store";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, of } from "rxjs";
import Swal from "sweetalert2";
import { AppState } from "../store/app.state";
import { UserModel } from "../store/storeModels/user.model";
import { environment } from "src/environments/environment";
import { Endpoints } from "../shared/config/endpoints";

@Injectable({
  providedIn: "root",
})
export class GeneralService {
  expiredToken = new BehaviorSubject<any>("");
  printActivated = new BehaviorSubject<boolean>(false);
  reloadService = new BehaviorSubject<boolean>(true);
  reloadComponent = new BehaviorSubject<boolean>(false);
  signedInUserDetails = new BehaviorSubject<any>("");
  tokenGenerated = new BehaviorSubject<string>("");
  httpStatus = new BehaviorSubject<string>("firstload");
  filterQueryClientIDs = new BehaviorSubject<string>("");
  showSpinner = new BehaviorSubject<boolean>(false);
  notchSpinner$ = this.showSpinner.asObservable();
  companyID = 3;
  fetchCurrency = new BehaviorSubject<any>("");
  teamIdSideBarFilter = new BehaviorSubject("");
  userSubject = new BehaviorSubject<AllUserInfoModel>(null);
  user$ = this.userSubject.asObservable();
  emitWorkflowId = new BehaviorSubject("")

  orgID;
  user: UserModel;
  org: OrgModel;
  orgModules: any[] = [];
  token;
  priviledges: string[];
  roleName: string;
  plan: string;
  baseCurrency;
  rates;
  requireCreditProfile;
  organisationName = "";
  loadedModules = [];

  constructor(
    private router: Router,
    private endpoints: Endpoints,
    private http: HttpClient,
    store: Store<AppState>
  ) {
    store.select("userInfo").subscribe((info) => {
      if (info) {
        this.userSubject.next(info);
        this.orgID = info.organization ? info.organization.id : null;
        this.org = info.organization ? info.organization : null;
        this.user = info.user ? info.user : null;
        this.token = info.token ? info.token : null;
        this.priviledges = info.priviledges ? info.priviledges : [];
        this.roleName = info.roleName ? info.roleName : null;
        this.orgModules = info.organization && info.organization.modules ? info.organization.modules : [];
        this.baseCurrency = info.organization
          ? info.organization.baseCurrency
          : null;
        this.rates = info.organization ? info.organization.rates : null;
        this.requireCreditProfile = info.organization
          ? info.organization.requireCreditProfile
          : null;
        this.teamIdSideBarFilter.next(this.user?this.user.teamID: '');
      }

      console.log('gs-rolename',this.roleName);      

    });
  }
  // Priviledge Access
  isAuthorized(permission: string): boolean {
    if (
      this.priviledges.indexOf(permission) >= 0 ||
      this.isSuperAdmin
    ) {
      return true;
    } else {
      return false;
    }
  }
  // Module Access
  canAccessModule(modulname: string): boolean {
    if(this.orgModules &&this.orgModules.indexOf(modulname) >=0) {
      return true;
    } else {
      return false;
    }
  }
  get isSuperAdmin(): boolean {
    return this.roleName === "Super Admin";
  }
  // Auth Pages
  isAuthPage(route: string): boolean {
    const authPages = [
      "/login",
      "/signup",
      "/complete-signup",
      "/forgot-password",
      "/resest-password",
      "/create-organization",
      "/welcome",
      "/otp",
    ];
    console.log();

    if (authPages.indexOf(`${route}`) >= 0) {
      return true;
    } else {
      return false;
    }
  }
  // Ticket email
  get orgEmailTicket() {
    const email = this.org.email.split("@")[0];
    return `${email}${this.orgID}${environment.emailDomain}`;
  }
  displaySpinner(moduleName: string) {
    if (!this.router.url.includes(moduleName)) {
      this.showSpinner.next(true);
    }
    if (this.loadedModules.indexOf(moduleName) >= 0) {
      this.showSpinner.next(false);
    } else {
      this.loadedModules.push(moduleName);
    }
  }

  // Fetch Templates
  fetchTemplates() {
    try {
      return this.http.get(
        `${this.endpoints.subscriptionQuotationInvoiceEndpoint}${this.endpoints.templates.getTemplates}`
      );
    } catch (error) {
      alert(error);
    }
  }

  // Handle Errors

  // Alert Message for Adding informations into the database
  alert(data: any) {
    const swalWithBootstrapButtons = Swal.mixin({});
    swalWithBootstrapButtons.fire(data.header, data.text, data.type);
  }

  checkIfObjectIsEmpty(objectName) {
    return (
      Object.keys(objectName).length === 0 && objectName.constructor === Object
    );
  }

  convertObjectToArray(object) {
    let finalArray = [];
    for (let key in object) {
      finalArray = [...finalArray, object[key]];
    }

    return finalArray;
  }

  putObjectKeysInArray(object) {
    let key_list = [];
    for (let key in object) {
      key_list.push(key);
    }

    return key_list;
  }

  /**
   *  Converts from one currncy to another
   * @param base_rate  The rate of the currency we are converting from. e.g from dollar to naira, dollar rate is the base rate
   * @param target_rate The rate of the currency we are converting to. e.g from dollar to naira, naira rate is the base rate
   * @param base_value  The amount of the base currency we want to convert from. e.g amount of dollars in dollar to naira conversion.
   */
  convertCurrency(base_rate: number, target_rate: number, base_value: number) {
    if (base_rate <= 0 || target_rate <= 0 || base_value <= 0) {
      return 0.0;
    }

    const target_value = (base_value * target_rate) / base_rate;
    return target_value.toFixed(2);
  }

  checkEmailIsValid(email: string): boolean {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(email.trim());
  }

  /*
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  public handleError = (error: any): Observable<any> => {
    let message = "";
    if (error) {
      if (error.error) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    }
    console.log(message, " General Error Message");
    return of(null);
  };
  swtAlertSuccess(type) {
    return Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been created.`,
      type: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "rgb(43, 98, 107)",
      confirmButtonText: `View ${type}`,
      cancelButtonText: `Create new ${type}`,
    });
  }

  sweetAlertFileCreationSuccess(type, navigateUrl, navigationExtras?) {
    Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been created.`,
      type: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "rgb(43, 98, 107)",
      confirmButtonText: `View ${type}`,
      cancelButtonText: `Create new ${type}`,
    }).then((result) => {
      if (result.value) {
        this.router.navigate([navigateUrl], navigationExtras);
      }
    });
  }

  sweetAlertFileCreateErrorWithoutNav(type) {
    Swal.fire({
      type: "error",
      title: `Oops... ${type} not created`,
      text: "Something went wrong!",
    });
  }

  sweetAlertFileUpdateSuccess(type, navigateUrl) {
    Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been updated.`,
      type: "success",
      // showCancelButton: true,
      confirmButtonColor: "#3085d6",
      // cancelButtonColor: 'rgb(43, 98, 107)',
      confirmButtonText: `View update`,
      // cancelButtonText: `View ${type}s`,
    });
    // .then(result => {
    // if (result.dismiss) {
    //   this.router.navigate([navigateUrl]);
    // } else {
    //   // window.location.reload();
    // }
    // });
  }
  sweetAlertCreateSuccessWithoutNav(type) {
    Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been created.`,
      type: "success",
    });
  }

  sweetAlertFileUpdateSuccessWithoutNav(type) {
    Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been updated.`,
      type: "success",
    });
  }

  sweetAlertDeleteSuccess(type) {
    Swal.fire({
      title: "Submitted!",
      text: `Your ${type} has been deleted.`,
      type: "success",
    });
  }

  sweetAlertFileUpdateErrorWithoutNav(type) {
    Swal.fire({
      type: "error",
      title: `Oops... ${type} not updated`,
      text: "Something went wrong!",
    });
  }

  sweetAlertClientMerge(type) {
    return Swal.fire({
      title: `Merge ${type}?`,
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, merge it!",
    });
  }

  sweetAlertFileDeletions(type) {
    return Swal.fire({
      title: `Delete ${type}?`,
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
  }

  sweetAlertGeneralDelete(title, btnText) {
    return Swal.fire({
      title: `${title}?`,
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${btnText}!`,
    });
  }

  sweetAlertFileCreations(type) {
    const frontal = type.includes("Copy") ? "" : "Create";
    return Swal.fire({
      title: `${frontal} ${type}?`,
      // text: 'You won\'t be able to revert this!',
      type: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    });
  }

  sweetAlertFileUpdates(type) {
    return Swal.fire({
      title: `Update ${type}?`,
      // text: 'You won\'t be able to revert this!',
      type: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });
  }

  sweetAlertUpdates(message) {
    return Swal.fire({
      customClass: {
        container: "my-swal",
      },
      html: message,
      // text: 'You won\'t be able to revert this!',
      type: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });
  }

  sweetAlertIcon(imageUrl: string, imageClass, title: string) {
    return Swal.fire({
      imageUrl,
      // type: '',
      title,
      imageClass,
    });
  }

  sweetAlertAsync(
    type: "question" | "warning",
    message: string,
    observable: Observable<any>
  ) {
    return Swal.fire({
      customClass: {
        container: "my-swal",
      },
      html: message,
      type,
      text: type === "warning" ? "You won't be able to revert this!" : "",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return observable
          .toPromise()
          .then((res) => {
            return { ...res, status: res.status?res.status.toLowerCase() : 'success'};
          })
          .catch((err) => {
            return { status: "error", error: err };
          });
      },
      allowOutsideClick: false,
    });
  }

  sweetAlertSucess(msg) {
    return Swal.fire("Submitted", msg, "success");
  }

  sweetAlertError(msg) {
    return Swal.fire("Failed", msg, "error");
  }

  sweetAlertFieldValidatio(fields) {
    return Swal.fire({
      //  title: `Update ${type}?`,
      text: `${fields}`,
      type: "warning",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Okay",
    });
  }
  NoValue(value): boolean {
    if(value == '0'||(value as any)== 0||value == null || value == ''){
      return true;
    } else {
      return false;
    }
  }

  sweetAlertContinue(title) {
    return Swal.fire({
      title: `${title}?`,
      type: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Continue!",
    });
  }

  sweetAlertNavigate(title) {
    return Swal.fire({
      title: `${title}?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6d309c",
      confirmButtonText: "Yes",
      cancelButtonText: "Stay on Page",
    });
  }

  sweetAlertHTML(action, html) {
    Swal.fire({
      title: action,
      type: "warning",
      html: html,
    });
  }

  sweetAlertCreate(type) {
    return Swal.fire({
      title: `Create ${type}?`,
      type: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, create it!",
    });
  }

  createTenantId() {
    return this.http.post(`http://localhost:3200/sales-stats/`, {
      orgId: "1",
    });
  }

  sendQuotationInvoice(payload) {
    try {
      const url = `${this.endpoints.communicationsEndpoint}/mails/sales/quote`;
      return this.http.post(`${url}`, payload);
    } catch (error) {
      alert(error);
    }
  }

  printQuotationInvoice(payload) {
    try {
      const url = `${this.endpoints.communicationsEndpoint}/mails/sales/converter/pdf`;
      return this.http.post(`${url}`, payload);
    } catch (error) {
      alert(error);
    }
  }

  getErrMsg(error): string {
    const msg =
      error && error.error && error.error.message
        ? error.error.message
        : "Error occured try again:";
    return msg;
  }

  notification(title, text, type, delay?) {
    return Swal.fire({
      title: title,
      text: text,
      type: type,
      timer: delay || 10000,
    });
  }
}
