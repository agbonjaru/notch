import { pipe } from "rxjs";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import * as $ from "jquery";
import { GeneralService } from "src/app/services/general.service";
import { TicketBulkService } from "src/app/services/settings-services/ticket-bulk.service";
import { TopUpService } from "src/app/services/settings-services/top-up.service";
import { TwoFactorService } from "src/app/services/settings-services/two-factor.service";
import { BulkMessagesService } from "src/app/services/misc/bulk-messages.service";
import { take } from "rxjs/operators";

@Component({
  selector: "app-bulk-messages",
  templateUrl: "./bulk-messages.component.html",
  styleUrls: ["./bulk-messages.component.css"],
})
export class BulkMessagesComponent implements OnInit {
  spinnerType: string;
  spinnerStyle: any = {};
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  isLoading: boolean = false;

  bulkMessageForm: FormGroup;
  showTopup: boolean = false;
  topUpForm: FormGroup;
  message: any = {};
  test: any;
  smsDetails;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private payload: TopUpService,
    public gs: GeneralService,
    private ticketBulk: TicketBulkService,
    private twoFactorService: TwoFactorService,
    private bulkServ: BulkMessagesService
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";
    this.spinnerStyle = { top: "25%" };
    // $.getScript('../../../assets/js/datatableScript.js');
  }

  ngOnInit() {
    this.createForm();
    this.getSettings();
    this.getSMSUnits();
    // this.verifyPayment();
    this.showTopup = this.bulkMessageForm.value.bulkSMS;

    this.topUpForm = this.fb.group({
      topUpUnits: "",
    });
  }

  private getSMSUnits() {
    this.bulkServ
      .getSMSUnit()
      .pipe(take(1))
      .subscribe((res) => {
        this.smsDetails = res;
      });
  }

  get f() {
    return this.bulkMessageForm.controls;
  }

  getSettings() {
    this.ticketBulk.getIntegrationsByCompany().subscribe(
      (data: any) => {
        if (data == null) {
          console.log(data, "data is null");
        } else {
          console.log(data, "settings data");
          this.presetValues(data);
        }
        this.showSpinner = false;
      },
      (error) => {
        this.showErrorDialog();
      }
    );
  }

  presetValues(data) {
    this.f.id.setValue(data.id);
    this.f.bulkSMS.setValue(data.bulkSMS);
    this.f.bulkEmail.setValue(data.bulkEmail);
    this.f.inboundSMS.setValue(data.inboundSMS);
    this.f.inboundEmail.setValue(data.inboundEmail);
    this.f.inboundWhatsApp.setValue(data.inboundWhatsApp);
  }

  createForm() {
    this.bulkMessageForm = this.fb.group({
      bulkSMS: [""],
      bulkEmail: [""],
      inboundSMS: [""],
      inboundEmail: [""],
      inboundWhatsApp: [""],
      orgID: [""],
      id: [""],
    });
  }

  onSubmit() {
    this.processForm();
  }

  processForm() {
    this.isLoading = !this.isLoading;
    this.f.orgID.setValue(this.gs.orgID.toString());
    const payload = this.bulkMessageForm.value;
    // console.log(payload, 'load');

    this.ticketBulk
      .createTicketBulk(payload)
      .subscribe(
        (result: any) => {
          this.message.header = "Submitted";
          this.message.text = result.message;
          this.message.type = "success";
          this.gs.alert(this.message);
        },
        (error) => {
          this.message.header = "Failed";
          this.message.text = error.message;
          this.message.type = "error";
          this.gs.alert(this.message);
        }
      )
      .add(() => {
        this.isLoading = !this.isLoading;
        this.retry("spin");
      });
  }

  // getSms() {
  //   this.showTopup = this.bulkMessageForm.value.bulkSMS;
  // }

  /*  Bulk Message */

  // add Bulk Message(s)
  addBulkMessage() {
    // Submitting the Bulk Message(s) list to the server
    try {
      const bulkData = {
        bulkEmail: this.bulkMessageForm.value.bulkEmail,
        bulkSMS: this.bulkMessageForm.value.bulkSms,
        orgID: this.gs.orgID,
        id: this.bulkMessageForm.value.bulkChangeId,
        inboundEmail: this.bulkMessageForm.value.inboundEmail,
        inboundSMS: this.bulkMessageForm.value.inboundSms,
        inboundWhatsApp: this.bulkMessageForm.value.inboundWhatsApp,
      };
      console.log(bulkData);
      this.ticketBulk.createTicketBulk(bulkData).subscribe(
        (result: any) => {
          console.log(result, " results");
          if (result) {
            this.message.header = "Submitted";
            this.message.text = result.message;
            this.message.type = "success";
            this.gs.alert(this.message);
          }
        },
        (error) => {
          console.log(error.error.error.message, "Error Message");
          if (error) {
            this.message.header = "Failed";
            this.message.text = error.message;
            this.message.type = "error";
            this.gs.alert(this.message);
          }
        }
      );
    } catch (error) {
      if (error) {
        this.message.header = "Failed";
        this.message.text = error.message;
        this.message.type = "error";
        this.gs.alert(this.message);
      }
    }
  }

  /*  Top Up */

  // convenience getter for easy access to form fields
  get topUpbit() {
    return this.topUpForm.controls;
  }

  topUp() {
    // stop here if form is invalid
    if (this.topUpForm.invalid) {
      return;
    }

    try {
      const topUpData = {
        id: 0,
        orgID: this.gs.orgID,
        units: this.smsDetails.units
          ? this.topUpForm.value.topUpUnits + this.smsDetails.units
          : this.topUpForm.value.topUpUnits,
      };
      console.log(topUpData);
      this.bulkServ.updateSMSUnits(topUpData).subscribe(
        (result: any) => {
          console.log(result, " results");
          if (result) {
            this.message.header = "Submitted";
            this.message.text = result.message;
            this.message.type = "success";
            this.smsDetails.units = topUpData.units;
            this.gs.alert(this.message);
            this.topUpForm.reset();
          }
        },
        (error) => {
          console.log(error.error.error.message, "Top Up Error Message");
          if (error) {
            this.message.header = "Failed";
            this.message.text = error.message;
            this.message.type = "error";
            this.gs.alert(this.message);
          }
        }
      );
    } catch (error) {
      if (error) {
        this.message.header = "Failed";
        this.message.text = error.message;
        this.message.type = "error";
        this.gs.alert(this.message);
      }
    }
  }

  verifyPayment() {
    const reference = localStorage.getItem("reference");
    console.log(reference, "reference");
    this.payload.getTopUpDetails(reference).subscribe((data: any) => {
      console.log(data, "result Reference by id list");
    });
  }

  activatePayment() {
    try {
      const activeData = {
        orgemail: this.gs.organisationName,
        orgid: this.gs.orgID,
      };
      console.log(activeData);
      this.payload.activateTopUp(activeData).subscribe(
        (result: any) => {
          console.log(result, " results active");
          if (result) {
            console.log(result, "activate result");
          }
        },
        (error) => {
          console.log(error.error.error.message, "Error 1 Message");
        }
      );
    } catch (error) {
      console.log(error, "error 2");
    }
  }

  showErrorDialog() {
    this.spinnerType = "errorCard";
    this.setSpinnerStatus = "We couldn't load this view.";
  }

  retry(spinnerType) {
    this.showSpinner = true;
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "";

    setTimeout(() => {
      this.ngOnInit();
    }, 2000);
  }
}
