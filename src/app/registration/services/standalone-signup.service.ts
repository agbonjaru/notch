import { Injectable } from "@angular/core";
import { Endpoints } from "../../shared/config/endpoints";
import { SignupModel } from "../../models/signUp.model";
import { HttpClient } from "@angular/common/http";
import { map, finalize, catchError } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { Billing, billingResponse } from "src/app/models/license.model";
import { GeneralService } from "src/app/services/general.service";
import Swal from "sweetalert2";

@Injectable({
  providedIn: "root",
})
export class StandaloneSignupService {
  public loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private endPoints: Endpoints,
    private http: HttpClient,
    private gs: GeneralService
  ) {}

  testLoading() {
    this.loadingSubject.next(true);
    setTimeout(() => {
      this.loadingSubject.next(false);
    }, 30000);
  }

  public get loadingSubjectValue(): any {
    return this.loadingSubject.value;
  }

  /**
   * signup a new user
   * @param payload Signup user information to be passed to the server
   */
  registerUser(payload: SignupModel) {
    this.loadingSubject.next(true);
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

    return this.http
      .post(
        `${this.endPoints.signupUrl + this.endPoints.signUpApis.createUser}`,
        body
      )
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * login user
   * @param payload Login user information to be passed to the server
   */
  loginUser(payload: SignupModel) {
    this.loadingSubject.next(true);

    return this.http.post(`${this.endPoints.signupUrl}/doLogin`, payload).pipe(
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }

  validateUser(userID) {
    this.loadingSubject.next(true);

    return this.http
      .get(`${this.endPoints.signupUrl}/validateUser/${userID}`)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * create new organization
   * @param payload
   */
  createOrganization(payload: any) {
    this.loadingSubject.next(true);

    const body = {
      ...payload,
      city: "",
      currencyType: "",
      dateOfEstablishment: "",
      mobile: "",
      phone: "",
      plan: "",
      planStatus: "",
      state: "",
      street: "",
      taxName: "",
      taxPercentage: "",
      website: "",
    };

    return this.http
      .post(`${this.endPoints.signupUrl}/newOrganization`, body)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * update organization
   * @param payload
   */
  updateOrganization(payload: any) {
    this.loadingSubject.next(true);

    return this.http
      .post(`${this.endPoints.signupUrl}/editOrganization`, payload)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * Get licenses
   */
  getLicenses() {
    this.gs.showSpinner.next(true);

    return this.http.get(`${this.endPoints.adminserviceUrl}/getLicenses`).pipe(
      finalize(() => {
        this.gs.showSpinner.next(false);
      })
    );
  }

  /**
   * create new license billing
   * @param payload
   */
  createBilling(payload: Billing) {
    console.log(payload);
    this.loadingSubject.next(true);

    return this.http
      .post(`${this.endPoints.adminserviceUrl}/newBilling`, payload)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
  }

  /**
   * Edit license billing
   * @param payload : Billing
   */
  eidtBilling(payload: Billing) {
    this.loadingSubject.next(true);

    this.http
      .post(`${this.endPoints.adminserviceUrl}/editBilling`, payload)
      .pipe(
        finalize(() => {
          this.loadingSubject.next(false);
        })
      )
      .subscribe((resp: any) => {
        if (resp.status === "SUCCESS") {
          Swal.fire({
            type: "success",
            title: "Updated Billing Successfully",
          });
        }
      });
  }

  /**
   * Get tenant Active billing license/subscription
   */
  getTenantActiveBilling(tenantID) {
    return this.http
      .get(
        `${this.endPoints.adminserviceUrl}/${tenantID}/getLicenseFromBilling`
      )
      .pipe(finalize(() => {}));
  }

  /**
   * get user subscription info {active sub, billing history and cards}
   */
  getUserSubscriptionContext(userID, orgID) {
    // debugger;
    this.gs.showSpinner.next(true);

    return this.http
      .get(
        `${this.endPoints.adminserviceUrl}/${userID}/${orgID}/getSubscription`
      )
      .pipe(
        finalize(() => {
          this.gs.showSpinner.next(false);
        })
      );
  }

  /**
   * create new license billing
   * @param payload
   */
  createCard(payload: billingResponse) {
    // this.loadingSubject.next(true);

    return this.http
      .post(`${this.endPoints.adminserviceUrl}/newBillingPayment`, payload)
      .pipe(
        finalize(() => {
          // this.loadingSubject.next(false);
        })
      );
  }

  /**
   * get user billing cards
   */
  getUserBillingCard(userID) {
    this.gs.showSpinner.next(true);

    return this.http
      .get(
        `${this.endPoints.adminserviceUrl}/${userID}/getAllUserBillingPayment`
      )
      .pipe(
        finalize(() => {
          this.gs.showSpinner.next(false);
        })
      );
  }
}
