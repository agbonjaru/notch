import { Component, OnInit } from "@angular/core";
import { StandaloneSignupService } from "../services/standalone-signup.service";
import { License, Billing, billingPayload } from "src/app/models/license.model";
import { BillingService } from "../services/billing.service";
import { NgxSpinnerService } from "ngx-spinner";
import { GeneralService } from "src/app/services/general.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-license",
  templateUrl: "./license.component.html",
  styleUrls: ["./license.component.css"],
})
export class LicenseComponent implements OnInit {
  licenseToggled: boolean;

  licenses: Array<License> = Array();

  constructor(
    public dataContext: StandaloneSignupService,
    private billingService: BillingService,
    private router: Router,
    public gs: GeneralService
  ) {}

  ngOnInit() {
    // this.dataContext.testLoading();
    this.getLicenses();
  }

  getLicenses() {
    this.dataContext.getLicenses().subscribe((resp: any) => {
      resp[1].active = true;
      this.licenses = resp;

      this.licenses.map((x) => {
        x.activePlan = "month";
        x.message = "Switch to monthly plan";
        x.activePrice = Math.ceil(x.annuallyPrice / 12);
      });
    });
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

  /**
   * make payment
   */
  makePayment(license: License) {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let org = JSON.parse(localStorage.getItem("organization"));

    let paymentDetails: billingPayload = {};
    paymentDetails.email = org.email;
    paymentDetails.amount = this.licenseToggled
      ? license.monthlyPrice
      : license.annuallyPrice;
    paymentDetails.monthly = this.licenseToggled;
    paymentDetails.currency = org.currencyCode;
    paymentDetails.metadata = {};
    paymentDetails.license = license;

    console.log({
      user: user,
      org: org,
      det: paymentDetails,
    });

    this.billingService.payWithPaystack(paymentDetails);
  }

  buyTrial(license: License) {
    let org = JSON.parse(localStorage.getItem("organization"));

    let amount = this.licenseToggled
      ? license.monthlyPrice
      : license.annuallyPrice;

    let d = new Date();

    d = new Date(d.setDate(d.getDate() + 14));

    let billing = new Billing(
      amount,
      org.currencyCode,
      license.descrip,
      d.toISOString(),
      license.name,
      String(license.id),
      "Monthly",
      "Auto",
      "",
      0,
      org.email,
      org.id,
      org.name,
      amount,
      "trial",
      ""
    );
    this.billingService.createBilling(billing);
  }
}
