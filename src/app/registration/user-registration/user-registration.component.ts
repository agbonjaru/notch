import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { StandaloneSignupService } from "../services/standalone-signup.service";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";
import Swal from "sweetalert2";

@Component({
  selector: "app-user-registration",
  templateUrl: "./user-registration.component.html",
  styleUrls: ["./user-registration.component.css"],
})
export class UserRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  validEmailRegex;
  userEmail: string;
  invitedUser: boolean;

  constructor(
    private fb: FormBuilder,
    public signUpservice: StandaloneSignupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.validEmailRegex = VALIDEMAILREGEX;
  }

  ngOnInit() {
    this.userEmail = this.route.snapshot.queryParams["email"];

    if (this.userEmail) this.invitedUser = true;
    this.createForm();
    localStorage.clear();
  }

  get firstnameControl() {
    return this.registrationForm.get("firstName") as FormControl;
  }

  get lastnameControl() {
    return this.registrationForm.get("lastName") as FormControl;
  }

  get emailControl() {
    return this.registrationForm.get("email") as FormControl;
  }

  get passwordControl() {
    return this.registrationForm.get("password") as FormControl;
  }

  /**
   * creats the registration form
   */
  createForm() {
    let email = "";
    if (this.invitedUser) email = this.userEmail;

    this.registrationForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: [
        email,
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
      password: ["", Validators.required],
    });
  }

  /**
   * sign-up new user
   */
  signUp() {
    this.signUpservice
      .registerUser(this.registrationForm.value)
      .subscribe((resp: any) => {
        if (resp) {
          localStorage.setItem("currentUser", JSON.stringify(resp));

          Swal.fire({
            type: "success",
            title: `Welcome ${resp.firstName} ${resp.lastName}`,
            text: `Your account has been created successfully`,
          });

          console.log(resp);

          const navigationExtras: NavigationExtras = {
            queryParams: { ref: resp.id },
          };

          this.router.navigate(["/reg/org"]);
        }
      });
  }
}
