import { Component, OnInit } from "@angular/core";
import { StandaloneSignupService } from "src/app/registration/services/standalone-signup.service";
import { AuthService } from "src/app/auth/auth.service";
import {
  BillingCard,
  PaystackTransactionInitiliazationResponse,
  License,
  billingPayload,
  Billing,
} from "src/app/models/license.model";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { AddCardModalComponent } from "src/app/shared/components/add-card-modal/add-card-modal.component";
import { BillingService } from "src/app/registration/services/billing.service";
import { environment } from "src/environments/environment";
import { SelectCardModalComponent } from "./select-card/select-card-modal.component";
declare var PaystackPop: any;

@Component({
  selector: "app-billing-subscription",
  templateUrl: "./billing-subscription.component.html",
  styleUrls: ["./billing-subscription.component.css"],
  providers: [BillingService],
})
export class BillingSubscriptionComponent implements OnInit {
  billingCards: BillingCard[] = [];
  licenses: License[] = [];
  currentLicense: Billing;
  invoices: Billing[];
  selectedLicense: License | any;
  selectedLicenseID = "0";
  billingLoading: boolean;
  licenseLoading: boolean;
  licenseToggled: boolean = false;

  usageData: { used?: number; total?: number } = { total: 0, used: 0 };

  constructor(
    public dataContext: StandaloneSignupService,
    private authService: AuthService,
    private dialog: MatDialog,
    public billingService: BillingService
  ) {}

  ngOnInit() {
    this.getCurrentLicense();
    // this.getBilling();
  }

  getBilling() {
    this.dataContext
      .getUserBillingCard(this.authService.getCurrentUser.user.id)
      .subscribe((resp: any) => {
        this.billingCards = resp;
        console.log(this.billingCards);
      });
  }

  getLicenses() {
    this.licenseLoading = true;
    this.dataContext.getLicenses().subscribe(
      (resp: any) => {
        this.licenses = resp;

        this.licenses.map((x) => {
          x.activePlan = "month";
          x.message = "Switch to monthly plan";
          x.activePrice = Math.ceil(x.annuallyPrice / 12);
        });

        // this.selectedLicenseID = this.currentLicense.licenseID;
        this.selectedLicense = this.licenses.find(
          (x) => x.id == Number(this.currentLicense.licenseID)
        );
      },
      (error) => {},
      () => {
        this.licenseLoading = false;
      }
    );
  }

  updateLicense() {
    this.licenses.map((x) => {
      if (this.licenseToggled) {
        // license.message = "Toggle to annual plan";
        x.activePlan = "month";
        x.activePrice = x.monthlyPrice;
      } else {
        // license.message = "Toggle to montly plan";
        x.activePlan = "month";
        x.activePrice = Math.ceil(x.annuallyPrice / 12);
      }
    });
  }

  updateSelectedLicense(id) {
    this.selectedLicense = this.licenses.find((x) => x.id == id);
    console.log(this.selectedLicense);
  }

  getCurrentLicense() {
    this.dataContext
      .getUserSubscriptionContext(
        this.authService.getCurrentUser.user.id,
        this.authService.getCurrentUser.organization.id
      )
      .subscribe((resp: any) => {
        if (resp.currBilling) {
          this.currentLicense = resp.currBilling;

          // this.currentLicense.autoRenew = true;
          this.currentLicense.billingTenure = this.currentLicense.billingTenure
            ? this.currentLicense.billingTenure
            : "month";

          let d = new Date(this.currentLicense.dueDate);

          // this.currentLicense.startDate = this.currentLicense.startDate
          //   ? this.currentLicense.startDate
          //   : new Date(d.setMonth(d.getMonth() - 1)).toISOString();
          this.currentLicense.startDate = this.currentLicense.createdDate;
        }

        this.billingCards = resp.cards;
        this.invoices = resp.billings;
        this.getUsageData();
      });
  }

  /**
   * make license payment
   */
  makePayment() {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let org = this.authService.getCurrentUser.organization;

    let paymentDetails: billingPayload = {};
    paymentDetails.email = org.email;
    paymentDetails.amount = this.licenseToggled
      ? this.selectedLicense.monthlyPrice * 100
      : this.selectedLicense.annuallyPrice * 100;
    paymentDetails.monthly = this.licenseToggled;
    paymentDetails.currency = org.currencyCode;
    paymentDetails.metadata = {};
    paymentDetails.license = this.selectedLicense;

    // console.log({
    //   user: user,
    //   org: org,
    //   det: paymentDetails,
    // });

    let returnUrl = "/settings/billing";

    this.billingService.payWithPaystack(paymentDetails, returnUrl);
  }

  openSelectCardModal() {
    if (this.billingCards.length == 0) {
      this.makePayment();
    } else {
      let dialogRef;

      let dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.minWidth = "500px";
      dialogConfig.id = "selectCard";
      dialogConfig.data = {
        cards: this.billingCards,
        license: this.selectedLicense,
        currentLicense: this.currentLicense,
        licenseToggled: this.licenseToggled,
      };

      dialogRef = this.dialog.open(SelectCardModalComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((data) => {
        // this.chargeNewCard();
      });
    }
  }

  // addCardDialog() {
  //   let dialogRef;

  //   this.billingService
  //     .initializeTransaction()
  //     .subscribe((resp: PaystackTransactionInitiliazationResponse) => {
  //       if (resp.status === true) {
  //         console.log(resp);

  //         let dialogConfig = new MatDialogConfig();

  //         dialogConfig.disableClose = false;
  //         dialogConfig.autoFocus = true;
  //         dialogConfig.id = "addCard";
  //         dialogConfig.data = resp.data;

  //         dialogRef = this.dialog.open(AddCardModalComponent, dialogConfig);
  //       }

  //       dialogRef.afterClosed().subscribe((data) => {
  //         this.getBilling();
  //       });
  //     });
  // }

  addCardDialog() {
    let dialogRef;

    let dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.id = "addCard";

    dialogRef = this.dialog.open(AddCardModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((data) => {
      this.chargeNewCard();
    });
  }

  deleteBillingCard(cardId) {
    this.billingService.deleteBillingCard(cardId).subscribe((resp) => {
      this.getBilling();
    });
  }

  /**
   * paystack payment integration for additional card
   */
  chargeNewCard() {
    this.billingService.setBillingLoadingValue(true);

    let scope = this;
    var handler = PaystackPop.setup({
      key: environment.paystackKey,
      email: scope.authService.getCurrentUser.organization.email,
      amount: 10000,
      currency: scope.authService.getCurrentUser.organization.currencyCode,
      ref: "" + Math.floor(Math.random() * 1000000000 + 1),
      metadata: {},
      callback: (response) => {
        scope.handleSuccessfulCharge(response);
      },
      onClose: () => {
        scope.billingService.setBillingLoadingValue(false);
      },
    });
    handler.openIframe();
  }

  handleSuccessfulCharge(response) {
    this.billingService
      .verifyPaystackPayment(response)
      .subscribe((resp: any) => {
        if (resp.status === true) {
          this.createCard(resp.data.authorization, response);
        }
      });
  }

  /**
   * create user billing card
   * @param payload
   * @param response
   */
  createCard(payload: any, response?) {
    payload = {
      ...payload,
      authorizationCode: payload.authorization_code,
      lastFour: payload.last4,
      account_name: "",
      receiver_bank_account_number: "",
      receiver_bank: "",
      userID: this.authService.getCurrentUser.user.id,
      accountName: "",
      receiverBankAccountNumber: "",
      receiverBank: "",
      expMonth: payload.exp_month,
      expYear: payload.exp_year,
      countryCode: payload.country_code,
      type: payload.card_type,
      orgID: this.authService.getCurrentUser.organization.id,
    };

    console.log(payload);

    this.dataContext.createCard(payload).subscribe(
      (resp) => {
        console.log(resp);
        // this.getBilling();
        this.billingService.setBillingLoadingValue(false);
        window.location.reload();
      },
      (error) => {},
      () => {
        this.billingService.paystackRefund({
          transaction: response.reference,
          currency: this.authService.getCurrentUser.organization.currencyCode,
        });
      }
    );
  }

  disableAutoRenewal() {
    console.log(this.currentLicense);
    this.dataContext.eidtBilling(this.currentLicense);
  }

  editBilling() {
    this.dataContext.eidtBilling(this.currentLicense);
  }

  getUsageData() {
    this.billingService.getStorageUsage().subscribe((resp) => {
      if (resp) {
        this.usageData = resp;
      }
      this.getLicenses();
    });
  }
}
