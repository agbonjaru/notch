import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MustMatch, VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { AuthService } from "../../auth.service";

@Component({
  selector: "app-complete-signup",
  templateUrl: "./complete-signup.component.html",
  styleUrls: ["./complete-signup.component.css"],
})
export class CompleteSignupComponent implements OnInit {
  isLoading: boolean = false;
  setView: string;
  spinnerType: string;
  setSpinnerStatus: string;
  showSpinner: boolean = true;
  completeSignUpForm: FormGroup;
  validEmailRegex: any;
  getUser: any;
  loader: any = {};

  constructor(
    private svc: SignupLoginService,
    private authSrv: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.spinnerType = "jsBin";
    this.setSpinnerStatus = "...";
    this.validEmailRegex = VALIDEMAILREGEX; // email validation
  }

  async ngOnInit() {
    this.createForm();
    const id = this.route.snapshot.params.id;
    await this.fetchUserDetails(id);
  }

  get f() {
    return this.completeSignUpForm.controls;
  }

  createForm() {
    this.completeSignUpForm = this.fb.group(
      {
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(this.validEmailRegex),
          ]),
        ],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      }
    );
  }

  async fetchUserDetails(id) {
    try {
      this.loader.user = true;
      let data: any = await this.svc.getUserByUserRel(id).toPromise();
      console.log(data, "ddd");
      this.getUser = data;
      const { password } = data;
      if (password) {
        this.confirmAccount(id);
        return;
      } else {
        await this.presetFormValues(data);
        this.setView = "showEditForm";
      }
    } catch (error) {
      console.log(error, "error");
      this.setView = "showFail";
    } finally {
      this.loader.user = false;
      this.showSpinner = false;
    }
  }

  async confirmAccount(id) {
    try {
      let data: any = await this.svc.verifyAccount(id).toPromise();
      this.setView = "showSuccess";
      console.log(data, "error");
    } catch (error) {
      console.log(error, "error");
      this.setView = "showFail";
    }
  }

  // verifyAccount2(payload) {
  //   this.svc
  //     .verifyAccount(payload)
  //     .subscribe(
  //       async (res: any) => {
  //         this.getUser = res;
  //         console.log(res, "res");
  //         if (res.emailConfirm === false) {
  //           await this.presetFormValues(res);
  //           this.setView = "updateAccount";
  //         } else this.setView = "acctUpdated";
  //       },
  //       (error) => {
  //         this.setView = "failed";
  //       }
  //     )
  //     .add(() => {
  //       this.showSpinner = false;
  //     });
  // }

  async presetFormValues(payload) {
    this.completeSignUpForm.patchValue({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
    });
  }

  //Submit form
  onSubmit() {
    this.processForm();
  }

  processForm() {
    this.isLoading = true;
    let payload = { ...this.completeSignUpForm.value };

    this.svc
      .updateNewAccount(payload)
      .subscribe(
        async (res) => {
          // console.log(res, "res");
          this.authSrv.storeUser(res);
          this.router.navigate(["/dashboard"]);
        },
        async (err) => {
          this.setView = "showFail";
        }
      )
      .add(() => {
        setTimeout(() => (this.isLoading = false), 5000);
      });
  }
}
