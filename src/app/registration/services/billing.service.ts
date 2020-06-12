import { Injectable } from "@angular/core";
import { RegistrationModule } from "../registration.module";
import { SignupModel } from "src/app/models/signUp.model";
import {
  billingPayload,
  Billing,
  billingResponse,
  PaystackRefund,
} from "src/app/models/license.model";
import { StandaloneSignupService } from "./standalone-signup.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { GeneralService } from "src/app/services/general.service";
import { AuthService } from "src/app/auth/auth.service";
import { BehaviorSubject } from "rxjs";
import { finalize } from "rxjs/operators";
import { MatDialogRef, MatDialog } from "@angular/material";
import { AddCardModalComponent } from "src/app/shared/components/add-card-modal/add-card-modal.component";
import { Endpoints } from "src/app/shared/config/endpoints";

declare var PaystackPop: any;

@Injectable()
export class BillingService {
  private billingLoading: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(false);

  public closeModal: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  billingLoading$ = this.billingLoading.asObservable();

  constructor(
    private signUpService: StandaloneSignupService,
    private http: HttpClient,
    private router: Router,
    private gs: GeneralService,
    private auth: AuthService,
    private endPoints: Endpoints
  ) {}

  public get billingLoadingValue() {
    return this.billingLoading.value;
  }

  setBillingLoadingValue(value: boolean) {
    this.billingLoading.next(value);
  }

  /**
   * paystack payment integration for billing
   */
  payWithPaystack(payload: billingPayload, returnUrl?: string) {
    this.signUpService.loadingSubject.next(true);

    let scope = this;
    var handler = PaystackPop.setup({
      key: environment.paystackKey,
      email: payload.email,
      amount: payload.amount * 100,
      currency: payload.currency,
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      metadata: payload.metadata,
      callback: function (response) {
        scope.paystackCallback(
          payload,
          response,
          scope,
          returnUrl ? returnUrl : null
        );
      },
      onClose: function () {
        scope.paystackClosed();
        // alert("window closed");
      },
    });
    handler.openIframe();
  }

  /**
   * callback when the dialog box is closed
   */
  paystackClosed() {
    alert("window closed");
  }

  /**
   * callback to when payment is completed
   */
  paystackCallback(payload: billingPayload, response, scope, returnUrl?) {
    // console.log(response);
    // alert("success. transaction ref is " + response.reference);

    if (response.status === "success") {
      // scope.gs.showSpinner.next(true);
      //success
      this.http
        .get(
          `https://api.paystack.co/transaction/verify/${response.reference}`,
          {
            headers: new HttpHeaders({
              Authorization:
                "Bearer sk_test_f0f3987418e86343f6029e8874a5db240c7f5fd9",
            }),
          }
        )
        .subscribe((resp: any) => {
          if (resp.status === true) {
            //make billing call
            let org = JSON.parse(localStorage.getItem("organization"));

            let d = new Date();

            if (payload.monthly) {
              d = new Date(d.setMonth(d.getMonth() + 1));
            } else {
              d = new Date(d.setMonth(d.getMonth() + 12));
            }

            let billing = new Billing(
              payload.amount,
              payload.currency,
              payload.license.descrip,
              d.toISOString(),
              payload.license.name,
              String(payload.license.id),
              payload.monthly ? "Monthly" : "Annually",
              "Auto",
              "",
              0,
              org.email,
              org.id,
              org.name,
              payload.amount,
              "Regular",
              JSON.stringify(response),
              payload.monthly ? "month" : "year",
              new Date().toISOString(),
              true
            );

            //create the user card info
            this.createCard(resp.data.authorization);

            this.createBilling(billing, returnUrl ? returnUrl : null);
          }
        });
    } else {
      //error
      Swal.fire({
        type: "error",
        title: `Something went wrong`,
        text: `Please try again`,
      });
    }
  }

  /**
   * charge authorizatoin
   * @param
   */
  chargeAuthorization(data: billingPayload) {
    this.billingLoading.next(true);

    let payload = {
      authorization_code: data.authorization_code,
      email: data.email,
      amount: data.amount * 100,
      currency: data.currency,
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      metadata: data.metadata,
    };

    //make billing call
    let org = this.auth.getCurrentUser.organization;

    let d = new Date();

    if (data.monthly) {
      d = new Date(d.setMonth(d.getMonth() + 1));
    } else {
      d = new Date(d.setMonth(d.getMonth() + 12));
    }

    let billing = new Billing(
      data.monthly ? data.license.monthlyPrice : data.license.annuallyPrice,
      data.currency,
      data.license.descrip,
      d.toISOString(),
      data.license.name,
      String(data.license.id),
      data.monthly ? "Monthly" : "Annually",
      "",
      "",
      0,
      org.email,
      String(org.id),
      org.name,
      data.amount,
      "Regular",
      "",
      data.monthly ? "month" : "year",
      new Date().toISOString(),
      true
    );

    let returnUrl = "/settings/billing";

    this.http
      .post(
        `https://api.paystack.co/transaction/charge_authorization`,
        payload,
        {
          headers: new HttpHeaders({
            Authorization:
              "Bearer sk_test_f0f3987418e86343f6029e8874a5db240c7f5fd9",
          }),
        }
      )
      .subscribe(
        (resp: any) => {
          if (resp.status === true) {
            billing.paymentData = JSON.stringify({
              reference: resp.data.reference,
            });
            // console.log(billing);

            this.createBilling(billing, returnUrl);
          }
        },
        (error) => {
          // console.log(error);
          billing.paymentData = JSON.stringify(error.error);
          // console.log(billing);

          this.createBilling(billing, returnUrl);
        }
      );
  }

  createBilling(billing: Billing, urlPath?: string) {
    this.signUpService.createBilling(billing).subscribe(
      (resp: any) => {
        console.log(resp);

        if (resp) {
          let userContext = JSON.parse(localStorage.getItem("currentUser"));
          userContext.organization = {
            ...userContext.organization,
            plan: billing.license,
            planStatus: "Running",
          };

          localStorage.setItem("currentUser", JSON.stringify(userContext));
          localStorage.setItem(
            "organization",
            JSON.stringify(userContext.organization)
          );

          //success
          Swal.fire({
            type: "success",
            title: "Subscription Successful",
            text: "Thank you",
            showConfirmButton: true,
            confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
          }).then((result) => {
            if (result.value) {
              // this.router.navigateByUrl("/dashboard");
              window.location.href = `${environment.notchAppURL}${
                urlPath ? urlPath : "/dashboard"
              }`;
            }
          });
        } else {
          //error
        }
      },
      (error) => {
        let message = "";
        if (error) {
          if (error.error) {
            message = error.error.message;
          } else {
            message = error.message;
          }
        }

        Swal.fire({
          type: "error",
          title: "Oops...",
          text: message,
        }).then((result) => {
          if (result.value) {
            // this.router.navigateByUrl("/dashboard");
            window.location.href = `${environment.notchAppURL}/dashboard`;
          }
        });
      }
    );
  }

  createCard(payload: any) {
    let userContext = JSON.parse(localStorage.getItem("currentUser"));

    payload = {
      ...payload,
      authorizationCode: payload.authorization_code,
      lastFour: payload.last4,
      account_name: "",
      receiver_bank_account_number: "",
      receiver_bank: "",
      userID: userContext.user.id,
      accountName: "",
      receiverBankAccountNumber: "",
      receiverBank: "",
      expMonth: payload.exp_month,
      expYear: payload.exp_year,
      countryCode: payload.country_code,
      type: payload.card_type,
      orgID: userContext.organization.id,
    };

    console.log(payload);

    this.signUpService.createCard(payload).subscribe((resp) => {
      console.log(resp);

      if (resp) {
        //success
        this.closeModal.next(true);
      } else {
        //error
      }
    });
  }

  initializeTransaction() {
    this.billingLoading.next(true);

    let payload = {
      reference: "" + Math.floor(Math.random() * 1000000000 + 1),
      amount: 100,
      email: this.auth.getCurrentUser.organization.email,
    };
    return this.http
      .post(`https://api.paystack.co/transaction/initialize/`, payload, {
        headers: new HttpHeaders({
          Authorization:
            "Bearer sk_test_f0f3987418e86343f6029e8874a5db240c7f5fd9",
        }),
      })
      .pipe(
        finalize(() => {
          this.billingLoading.next(false);
        })
      );
  }

  verifyPaystackPayment(response) {
    this.billingLoading.next(true);
    return this.http
      .get(`https://api.paystack.co/transaction/verify/${response.reference}`, {
        headers: new HttpHeaders({
          Authorization:
            "Bearer sk_test_f0f3987418e86343f6029e8874a5db240c7f5fd9",
        }),
      })
      .pipe(
        finalize(() => {
          this.billingLoading.next(false);
        })
      );
  }

  paystackRefund(payload: PaystackRefund) {
    this.billingLoading.next(true);
    this.http
      .post(`https://api.paystack.co/refund`, payload, {
        headers: new HttpHeaders({
          Authorization:
            "Bearer sk_test_f0f3987418e86343f6029e8874a5db240c7f5fd9",
        }),
      })
      .pipe(
        finalize(() => {
          this.billingLoading.next(true);
        })
      )
      .subscribe((resp) => {});
  }

  deleteBillingCard(billingID: number) {
    this.billingLoading.next(true);

    return this.http
      .post(
        `${this.endPoints.adminserviceUrl}/${billingID}/deleteBillingPayment`,
        {}
      )
      .pipe(
        finalize(() => {
          this.billingLoading.next(false);
        })
      );
  }

  getStorageUsage() {
    return this.http
      .get(
        `${this.endPoints.salesServiceUrl}/${this.auth.getCurrentUser.organization.id}/getStorageStatus`
      )
      .pipe(finalize(() => {}));
  }

  getTenantBalance() {
    this.billingLoading.next(true);

    return this.http
      .get(
        `${this.endPoints.adminserviceUrl}/${this.auth.getCurrentUser.organization.id}/getTenantBalance`
      )
      .pipe(
        finalize(() => {
          this.billingLoading.next(false);
        })
      );
  }
}
