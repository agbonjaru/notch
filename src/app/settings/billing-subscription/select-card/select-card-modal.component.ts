import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { FormBuilder } from "@angular/forms";
import { BillingService } from "src/app/registration/services/billing.service";
import { AuthService } from "src/app/auth/auth.service";
import { StandaloneSignupService } from "src/app/registration/services/standalone-signup.service";
import {
  BillingCard,
  License,
  billingPayload,
  Billing,
} from "src/app/models/license.model";

@Component({
  selector: "billing-card-modal",
  templateUrl: "./select-card-modal.component.html",
  styleUrls: ["./select-card-modal.component.css"],
  providers: [BillingService],
})
export class SelectCardModalComponent implements OnInit {
  dialogData: {
    cards: BillingCard[];
    license: License;
    currentLicense: Billing;
    licenseToggled: boolean;
  };

  currentBilling: Billing;
  outstandingBalance: number = 0;
  prepaidTenure: number = 1;
  prepaidTenureDays: number = 0;
  extendedDays: number = 0;

  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SelectCardModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    public billingService: BillingService,
    private authService: AuthService,
    public dataContext: StandaloneSignupService
  ) {
    if (data) {
      console.log(data);
      this.dialogData = data;
    }
  }

  ngOnInit() {
    this.getTenantBalance();
  }

  /**
   * make license payment
   */
  makePayment(card: BillingCard) {
    if (!this.billingService.billingLoadingValue) {
      let user = JSON.parse(localStorage.getItem("currentUser"));
      let org = this.authService.getCurrentUser.organization;

      let amount = this.dialogData.licenseToggled
        ? this.dialogData.license.monthlyPrice
        : this.dialogData.license.annuallyPrice;

      let paymentDetails: billingPayload = {};
      paymentDetails.email = org.email;
      paymentDetails.amount =
        this.outstandingBalance > 0 ? this.outstandingBalance : amount;
      paymentDetails.monthly = this.dialogData.licenseToggled;
      paymentDetails.currency = org.currencyCode;
      paymentDetails.metadata = {};
      paymentDetails.license = this.dialogData.license;
      paymentDetails.authorization_code = card.authorizationCode;

      console.log({
        user: user,
        org: org,
        det: paymentDetails,
      });

      this.billingService.chargeAuthorization(paymentDetails);
    }
  }

  calculateBalance() {
    if (this.dialogData.currentLicense) {
      this.currentBilling = { ...this.dialogData.currentLicense };

      let duedate = new Date(this.currentBilling.dueDate);
      let startDate = new Date(this.currentBilling.startDate);

      this.currentBilling.billingTenureInDays = Math.ceil(
        (duedate.getTime() - startDate.getTime()) / 86400000
      );
      this.currentBilling.prepaidDaysBalance = Math.ceil(
        (duedate.getTime() - new Date().getTime()) / 86400000
      );

      this.currentBilling.dailyAmount =
        this.currentBilling.totalAmount /
        this.currentBilling.billingTenureInDays;

      this.currentBilling.prepaidBalance = Math.ceil(
        this.currentBilling.dailyAmount * this.currentBilling.prepaidDaysBalance
      );

      let licenseCost = this.dialogData.licenseToggled
        ? this.dialogData.license.monthlyPrice
        : this.dialogData.license.annuallyPrice;

      if (this.currentBilling.prepaidBalance > licenseCost) {
        if (this.currentBilling.prepaidBalance % licenseCost === 0) {
          this.prepaidTenure = Math.ceil(
            this.currentBilling.prepaidBalance / licenseCost
          );
        } else {
          let remainder = this.currentBilling.prepaidBalance % licenseCost;

          this.prepaidTenure = Math.ceil(
            this.currentBilling.prepaidBalance / licenseCost
          );

          this.outstandingBalance = licenseCost - remainder;
        }
      } else {
        this.outstandingBalance =
          licenseCost - this.currentBilling.prepaidBalance;
      }

      console.log(this.currentBilling);
    }
  }

  getTenantBalance() {
    this.billingService.getTenantBalance().subscribe((resp: number) => {
      console.log(resp);
      //do the calculation
      this.calculateBalance2(resp);
    });
  }

  calculateBalance2(resp) {
    if (this.dialogData.currentLicense) {
      this.currentBilling = { ...this.dialogData.currentLicense };
      this.currentBilling.prepaidBalance = Number(resp.toFixed());

      /*let duedate = new Date(this.currentBilling.exprDate);
      let startDate = new Date(this.currentBilling.startDate);

      this.currentBilling.billingTenureInDays = Math.ceil(
        (duedate.getTime() - startDate.getTime()) / 86400000
      );
      this.currentBilling.prepaidDaysBalance = Math.ceil(
        (duedate.getTime() - new Date().getTime()) / 86400000
      );

      this.currentBilling.dailyAmount =
        this.currentBilling.totalAmount /
        this.currentBilling.billingTenureInDays;

      this.currentBilling.prepaidBalance = Math.ceil(
        this.currentBilling.dailyAmount * this.currentBilling.prepaidDaysBalance
      ); */

      //get value of license cost in days

      let licenseCost = this.dialogData.licenseToggled
        ? this.dialogData.license.monthlyPrice
        : this.dialogData.license.annuallyPrice;

      let licenseCostInDays = this.dialogData.licenseToggled
        ? this.dialogData.license.monthlyPrice / 30
        : this.dialogData.license.annuallyPrice / 365;

      if (this.currentBilling.prepaidBalance > licenseCost) {
        let balance = this.currentBilling.prepaidBalance - licenseCost;

        this.extendedDays = Math.ceil(balance / licenseCostInDays);

        if (this.currentBilling.prepaidBalance % licenseCost === 0) {
          this.prepaidTenure = Math.floor(
            this.currentBilling.prepaidBalance / licenseCost
          );
        } else {
          let remainder = this.currentBilling.prepaidBalance % licenseCost;

          this.prepaidTenure = this.currentBilling.prepaidBalance / licenseCost;

          // this.prepaidTenure = Number(this.prepaidTenure.toFixed());

          this.prepaidTenure = Math.floor(this.prepaidTenure);

          this.prepaidTenureDays = Math.ceil(remainder / licenseCostInDays);
        }
      } else {
        this.outstandingBalance =
          licenseCost - this.currentBilling.prepaidBalance;
      }

      console.log(this.currentBilling);
    }
  }

  upgradeLicesense() {
    let org = this.authService.getCurrentUser.organization;

    let d = new Date();

    if (this.dialogData.licenseToggled) {
      d = new Date(d.setMonth(d.getMonth() + this.prepaidTenure));
    } else {
      d = new Date(d.setFullYear(d.getFullYear() + this.prepaidTenure));
    }

    let license = this.dialogData.license;

    let billing = new Billing(
      this.dialogData.licenseToggled
        ? license.monthlyPrice
        : license.annuallyPrice,
      org.currencyCode,
      license.descrip,
      "",
      license.name,
      String(license.id),
      this.dialogData.licenseToggled ? "Monthly" : "Annually",
      "",
      "",
      0,
      org.email,
      String(org.id),
      org.name,
      this.outstandingBalance > 0
        ? this.outstandingBalance
        : this.currentBilling.prepaidBalance,
      "Regular",
      "",
      this.dialogData.licenseToggled ? "month" : "year",
      new Date().toISOString(),
      true,
      this.extendedDays
    );

    console.log(billing);

    let returnUrl = "/settings/billing";

    this.billingService.createBilling(billing, returnUrl);
  }
}
