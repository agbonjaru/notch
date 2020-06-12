import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from "@angular/forms";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { Router, NavigationExtras } from "@angular/router";
import { StandaloneSignupService } from "../services/standalone-signup.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  validEmailRegex;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public signUpservice: StandaloneSignupService
  ) {
    this.validEmailRegex = VALIDEMAILREGEX;
  }

  ngOnInit() {
    this.createForm();
    // this.signUpservice.testLoading();
  }

  get emailControl() {
    return this.loginForm.get("username") as FormControl;
  }

  get passwordControl() {
    return this.loginForm.get("password") as FormControl;
  }

  get rememberMeControl() {
    return this.loginForm.get("rememberMe") as FormControl;
  }

  /**
   * create the login form
   */
  createForm() {
    this.loginForm = this.fb.group({
      username: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
      password: ["", Validators.required],
      rememberMe: [false],
    });

    // this.emailControl.valueChanges.subscribe(value =>
    //   console.log(this.emailControl.errors)
    // );
  }

  /**
   * Login to the application
   */
  login() {
    this.signUpservice
      .loginUser(this.loginForm.value)
      .subscribe((resp: any) => {
        if (resp) {
          console.log(resp);

          localStorage.setItem("currentUser", JSON.stringify(resp.user));

          // const navigationExtras: NavigationExtras = {
          //   queryParams: { session_id: resp.id },
          //   fragment: "notVerified",
          // };

          this.router.navigate(["/reg/org"]);
        }
      });
  }
}
