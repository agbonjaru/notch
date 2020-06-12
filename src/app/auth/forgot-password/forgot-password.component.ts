import { PasswordSettingService } from "./../../services/password-setting.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  validEmailRegex: any;
  isLoading: boolean = false;
  setView: string;
  // errorMsg: any = {};
  errorMsg = { error: { status: false, msg: "Sorry error occured try again" } };

  constructor(
    private fb: FormBuilder,
    private passwordSettingService: PasswordSettingService
  ) {
    this.setView = "default";
    this.validEmailRegex = VALIDEMAILREGEX;
  }

  ngOnInit() {
    this.createForm();
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  // Create form
  createForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex)
        ])
      ]
    });
  }

  //Submit form
  onSubmit() {
    const payload = this.forgotPasswordForm.get("email").value;
    this.processForm(payload);
  }

  processForm(payload) {
    this.isLoading = true;
    this.passwordSettingService
      .forgotPassword(payload)
      .subscribe(
        res => {
          this.setView = "success";
        },
        err => {
          this.errorMsg.error.status = true;
          let errMsg = "Sorry error occured try again";
          if (err.status && err.error && err.error.message) {
            errMsg = err.error.message;
          }
          this.errorMsg.error.msg = errMsg;
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }
}
