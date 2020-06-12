import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { BillingService } from "src/app/registration/services/billing.service";
import {
  PaystackTransactionInitiliazationResponse,
  PaystackCard,
} from "src/app/models/license.model";
import { environment } from "src/environments/environment";
import { AuthService } from "src/app/auth/auth.service";
import { StandaloneSignupService } from "src/app/registration/services/standalone-signup.service";

declare var Paystack: any;
declare var window: any;
declare var PaystackPop: any;

@Component({
  selector: "app-add-card-modal",
  templateUrl: "./add-card-modal.component.html",
  styleUrls: ["./add-card-modal.component.css"],
  providers: [BillingService],
})
export class AddCardModalComponent implements OnInit {
  cardFormGroup: FormGroup;
  dialogData: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };

  paystack: any;

  currentYear;

  constructor(
    public dialogRef: MatDialogRef<AddCardModalComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    public billingService: BillingService,
    private auth: AuthService,
    private signUpService: StandaloneSignupService,
    private modal: MatDialog
  ) {
    if (data) {
      console.log(data);
      this.dialogData = data;
    }
  }

  ngOnInit() {
    this.currentYear = new Date().getFullYear().toString();
    this.createForm();

    // this.billingService.closeModal.subscribe((res) => {
    //   if (res === true) this.dialogRef.close();
    // });
  }

  get numberControl() {
    return this.cardFormGroup.get("number") as FormControl;
  }

  get cvvControl() {
    return this.cardFormGroup.get("cvv") as FormControl;
  }

  get expiryMonthControl() {
    return this.cardFormGroup.get("expiryMonth") as FormControl;
  }

  get expiryYearControl() {
    return this.cardFormGroup.get("expiryYear") as FormControl;
  }

  createForm() {
    this.cardFormGroup = this.fb.group({
      number: ["", Validators.required],
      cvv: [
        "",
        [Validators.required, Validators.min(100), Validators.max(999)],
      ],
      expiryMonth: [
        "",
        [Validators.required, Validators.min(1), , Validators.max(12)],
      ],
      expiryYear: [
        "",
        [
          Validators.required,
          Validators.min(Number(this.currentYear.slice(-2))),
        ],
      ],
    });
  }

  initilizePaystack() {
    this.billingService.setBillingLoadingValue(true);

    let that = this;

    Paystack.init({
      form: "paystack-card-form", // Form ID
      access_code: this.dialogData.access_code,
    })
      .then(function (returnedObj) {
        window.PAYSTACK = returnedObj;
        console.log(that.paystack);
        that.chargeCard(returnedObj);
      })
      .catch(function (error) {
        console.log("There was an error loading Paystack", error);
      });
  }

  /**
   * charge the card to get the authorization code
   * ensure to pass in pin if carde is verve
   */
  chargeCard(returnedObj) {
    let that = this;
    window.PAYSTACK.card.charge().then(
      (resp) => {
        console.log(resp);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
