import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MustMatch } from "src/app/helpers/helperResources";
import { PasswordSettingService } from "src/app/services/password-setting.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  validEmailRegex: any;
  isLoading: boolean = false;
  setView: string;
  errorMsg = { error: { status: false, msg: "Sorry error occured try again" } };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private passwordSettingService: PasswordSettingService
  ) {
    this.setView = "default";
  }

  ngOnInit() {
    this.createForm();
    // const id = this.route.snapshot.params.id;
    const token = this.route.snapshot.params.token;
    //Set value
    // this.resetPasswordForm.get('id').setValue(id);
    this.resetPasswordForm.get("token").setValue(token);
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  onChange() {
    console.log(this.f.newPassword, "f");
  }

  // Create form
  createForm() {
    this.resetPasswordForm = this.fb.group(
      {
        token: [""],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required]
      },
      {
        validator: MustMatch("newPassword", "confirmPassword")
      }
    );
  }

  //Submit form
  onSubmit() {
    const payload = {
      password: this.resetPasswordForm.get("newPassword").value,
      token: this.resetPasswordForm.get("token").value
    };
    this.processForm(payload);
  }

  processForm(payload) {
    this.isLoading = true;
    this.passwordSettingService
      .resetPassword(payload)
      .subscribe(
        res => {
          this.setView = "success";
        },
        err => {
          this.errorMsg.error.status = true;
          this.errorMsg.error.msg = "Sorry error occured try again";
          if (err.status && err.message)
            this.errorMsg.error.msg = err.error.message;
        }
      )
      .add(() => (this.isLoading = false));
  }
}
