import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { COUNTRIES } from "src/app/data/nations";
import { INDUSTRIES } from "src/app/data/industries";
import { StandaloneSignupService } from "../services/standalone-signup.service";
import { Router, NavigationExtras } from "@angular/router";
import Swal from "sweetalert2";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { AuthService } from "src/app/auth/auth.service";
import { TIMEZONES } from "src/app/data/timezone";
import { COUNTRIESCONTEXT } from "src/app/data/countriesContext";

@Component({
  selector: "app-org-registration",
  templateUrl: "./org-registration.component.html",
  styleUrls: ["./org-registration.component.css"],
})
export class OrgRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  cindustry = INDUSTRIES;
  countries = COUNTRIESCONTEXT;
  selectedCountryContext;
  // timeZones = [
  //   {
  //     name: "GMT+0100 (West Africa Standard Time)",
  //     value: "1",
  //   },
  // ];
  timeZones = TIMEZONES;
  currencies = ["NGN"];
  currentTimeZoneObj;

  organization;
  isEdit: boolean;
  formLoaded: boolean;
  formValue;
  validEmailRegex;

  constructor(
    private fb: FormBuilder,
    public signUpService: StandaloneSignupService,
    private router: Router,
    private authSrv: AuthService
  ) {
    this.validEmailRegex = VALIDEMAILREGEX;
  }

  ngOnInit() {
    // this.signUpService.testLoading();

    if (
      localStorage.getItem("organization") != undefined &&
      localStorage.getItem("organization") != "undefined"
    ) {
      this.organization = JSON.parse(localStorage.getItem("organization"));
    }

    let currentTimeZone = new Date().getTimezoneOffset() / -60;
    let currentTimeZoneText = this.seconds_with_leading_zeros(new Date());
    let timeZoneSubstr = currentTimeZoneText.substr(
      currentTimeZoneText.indexOf(""),
      currentTimeZoneText.indexOf(" ")
    );

    this.currentTimeZoneObj = this.timeZones.find(
      (x) => x.text.includes(timeZoneSubstr) && x.offset == currentTimeZone
    );

    console.log(this.currentTimeZoneObj);

    this.formValue = {
      id: 0,
      name: "",
      email: "",
      country: "Nigeria",
      currencyCode: "NGN",
      industry: "Health",
      timeZone: currentTimeZone,
      userID: JSON.parse(localStorage.getItem("currentUser")).id,
    };

    this.createForm();
  }

  seconds_with_leading_zeros(dt) {
    return /\((.*)\)/.exec(new Date().toString())[1];
  }

  get cnameControl() {
    return this.registrationForm.get("name") as FormControl;
  }

  get countryControl() {
    return this.registrationForm.get("country") as FormControl;
  }

  get currencyControl() {
    return this.registrationForm.get("currencyCode") as FormControl;
  }

  get industryControl() {
    return this.registrationForm.get("industry") as FormControl;
  }

  get timeZoneControl() {
    return this.registrationForm.get("timeZone") as FormControl;
  }

  get emailControl() {
    return this.registrationForm.get("email") as FormControl;
  }

  changeTimezone(e) {
    this.timeZoneControl.patchValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeCountry(e) {
    let cContext = this.countries.find((c) => c.countryName === e.target.value);

    this.countryControl.patchValue(e.target.value);
    this.currencyControl.patchValue(cContext.currencyCode);
    this.formValue.currencyCode = cContext.currencyCode;
  }

  changeCurrency(e) {
    this.currencyControl.patchValue(e.target.value, {
      onlySelf: true,
    });
  }

  changeIndustry(e) {
    this.industryControl.patchValue(e.target.value, {
      onlySelf: true,
    });
  }

  /**
   * create new organization form
   */
  createForm() {
    this.registrationForm = this.fb.group({
      id: [""],
      name: ["", Validators.required],
      country: ["null", Validators.required],
      currencyCode: ["null", Validators.required],
      industry: ["null", Validators.required],
      timeZone: ["null", Validators.required],
      userID: [""],
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
    });

    if (this.organization) {
      this.formValue.id = this.organization.id;
      this.formValue.name = this.organization.name;
      this.formValue.email = this.organization.email;
      this.formValue.country = this.organization.country;
      this.formValue.currencyCode = this.organization.currencyCode;
      this.formValue.industry = this.organization.industry;
      this.formValue.timeZone = this.organization.timeZone;
      this.isEdit = true;
    }

    this.registrationForm.setValue(this.formValue);

    this.registrationForm.valueChanges.subscribe((value) => {
      // console.log(value);
      // console.log(this.registrationForm.errors);
    });

    this.formLoaded = true;
  }

  /**
   * create new organization
   */
  createOrganization() {
    this.registrationForm.value.timeZone = Number(
      this.registrationForm.value.timeZone
    );

    if (this.isEdit) {
      //update the organization
      this.signUpService
        .updateOrganization(this.registrationForm.value)
        .subscribe((resp: any) => {
          console.log(resp);

          if (resp) {
            localStorage.setItem("organization", JSON.stringify(resp));

            // const navigationExtras: NavigationExtras = {
            //   queryParams: { orgID: resp.id },
            // };

            this.router.navigate(["/reg/plans"]);
          }
        });
    } else {
      //create a new one
      this.signUpService
        .createOrganization(this.registrationForm.value)
        .subscribe((resp: any) => {
          console.log(resp);

          this.authSrv.storeUser(resp);

          if (resp) {
            localStorage.setItem(
              "organization",
              JSON.stringify(resp.organization)
            );

            // const navigationExtras: NavigationExtras = {
            //   queryParams: { orgID: resp.id },
            // };

            this.router.navigate(["/reg/plans"]);
          }
        });
    }
  }

  /**
   * create demo organization
   */
  createDemoOrg() {
    Swal.fire({
      type: "success",
      title: "Congratulations",
      text: "Demo Organization created",
    });
  }
}
