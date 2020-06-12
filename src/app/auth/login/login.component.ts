import { AuthService } from "./../auth.service";
import { Router, ActivatedRoute } from "@angular/router";
import { SignupLoginService } from "./../../services/signupLogin.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators, NgModel } from "@angular/forms";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { ViewEncapsulation } from "@angular/compiler/src/core";
import { GeneralService } from "src/app/services/general.service";
import { ToastrService } from "ngx-toastr";
import { LocalStorageService } from "src/app/utils/LocalStorage";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  // encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  display: any = {
    main: {
      header: "",
      default: false,
      login: true,
      otp: false,
      showSpinner: false,
    },
    org: {
      type: null,
      default: false,
      switch: false,
      plan: false,
      create: false,
      storage: {},
      showSpinner: false,
    },
    btnloader: false,
  };
  loader: any = {
    main: {
      default: "sharp",
      spinnerType: "",
      spinnerStyle: { paddingTop: "12%" },
      showSpinner: false,
    },
    org: {
      default: "sharp",
      spinnerType: "",
      spinnerStyle: { paddingTop: "12%" },
      showSpinner: false,
    },
  };
  config = {
    allowNumbersOnly: true,
    placeholder: "",
  };
  user: any = {
    storage: {},
    currentOrganization: {},
    arrayOrg: [],
    selectedOrg: 0,
    data: [],
    error: {
      isActive: false,
    },
  };
  otp: string;
  loginForm: FormGroup;
  validEmailRegex: any;
  loading = false;
  loginStatus = {
    error: { status: false, msg: "Sorry error occured try again" },
  };
  returnUrl = null;
  showOtpComponent = true;
  @ViewChild("ngOtpInput") ngOtpInput: any;
  selectedOption: string = null;

  constructor(
    private fb: FormBuilder,
    private signUpSrv: SignupLoginService,
    private localStorage: LocalStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private gs: GeneralService,
    private authSrv: AuthService
  ) {
    // Default Settings
    this.display.main.default = true;
    this.display.org.default = false;
    // this.display.org.switch = true;
    this.loader.org.spinnerType = this.loader.org.default;

    this.validEmailRegex = VALIDEMAILREGEX;
    route.queryParams.subscribe((res) => {
      if (res) {
        this.returnUrl = res.returnUrl;
      }
    });
  }

  ngOnInit() {
    this.createForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  get email() {
    return this.loginForm.get("email");
  }

  get password() {
    return this.loginForm.get("password");
  }

  // Create form
  createForm() {
    this.loginForm = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex),
        ]),
      ],
      password: ["", Validators.required],
    });
  }

  changeSample() {
    // console.log(this.loginForm.get("email"), "email");
  }

  // Func for OTP plugin
  onOtpChange(otp) {
    this.otp = otp;
    if (otp.length === 4) this.handleLogin();
  }

  // Submit users details for signup

  // Handle login
  async handleLogin() {
    if (this.loginForm.valid) {
      this.display.main.header = "Validating...";
      this.display.main.login = !this.display.main.login;
      this.loading = this.display.main.showSpinner = true;
      this.loginStatus.error.status = false;

      this.signUpSrv
        .loginUser(this.loginForm.value)
        .subscribe(
          async (data: any) => {
            console.log(data, "login data");

            if (data && data.status === "INACTIVE_PLAN") {
              // Set Header & Loader
              this.display.main.header = "Please wait...";
              this.loader.org.showSpinner = true;
              // Save user details
              const storage = (this.user.storage = data.user);
              if (storage === undefined || storage === null) return;
              this.user.data = data; //For login purposes
              this.user.storage.token = data.token;
              this.user.currentOrganization = { ...data.organization };
              await this.initializeUserOrganizations(storage.id);
              // Display Settings
              this.display.org.default = true;
              this.display.org.switch = false;
              this.display.main.default = false;
              this.display.org.type = data.status;
              // Delay for some minutes
              await new Promise((resolve) =>
                setTimeout(() => {
                  this.loader.org.showSpinner = false;
                  console.log(storage, "storage 1");
                  resolve();
                }, 1000)
              );
            } else if (data && data.status === "USER_DEACTIVATED") {
              // Set Header & Loader
              this.display.main.header = "Please wait...";
              this.loader.org.showSpinner = true;
              // Save user details
              const storage = (this.user.storage = data.user);
              if (storage === undefined || storage === null) return;
              this.user.data = data; //For login purposes
              this.user.storage.token = data.token;
              this.user.currentOrganization = { ...data.organization };
              await this.initializeUserOrganizations(storage.id);
              // Display Settings
              this.display.org.default = true;
              this.display.org.switch = false;
              this.display.main.default = false;
              this.display.org.type = data.status;
              // Delay for some minutes
              await new Promise((resolve) =>
                setTimeout(() => {
                  this.loader.org.showSpinner = false;
                  console.log(storage, "storage 1");
                  resolve();
                }, 1000)
              );
            } else if (data && data.status === "OTP_REQUEST") {
              //Delay for a minute
              setTimeout(() => {
                this.display.main.header = "Checking OTP...";
              }, 1000);
              this.display.main.showSpinner = !this.display.main.showSpinner;
              this.display.main.otp = true;
            } else if (data && data.token) {
              this.display.main.header = "Logging in...";
              this.successLoginAction(data);
            } else {
              alert("Switch to Demo Account");
              this.display.main.login = !this.display.main.login;
              this.display.main.showSpinner = !this.display.main.showSpinner;
            }
            // this.display.main.showSpinner = false;
          },
          (err) => {
            this.ErrorLoginAction(err);
            console.log(err);
          }
        )
        .add(() => {
          this.loading = false;
        });
    }
  }

  private successLoginAction(data) {
    const plan =
      data && data.organization && data.organization.plan
        ? data.organization.plan
        : "";
    this.signUpSrv.fetchLicenseByName(plan).subscribe(
      (res: any) => {
        const modules = res.modules;
        this.authSrv.storeUser({ ...data, modules });
        this.gs.fetchCurrency.next("");
        let url =
          this.returnUrl && this.returnUrl !== "/access-denied"
            ? this.returnUrl
            : "/dashboard";
        this.router.navigate([url]);
      },
      (err) => {
        this.ErrorLoginAction(err);
      }
    );
  }

  private ErrorLoginAction(err) {
    this.display.main.login = !this.display.main.login;
    this.display.main.showSpinner = !this.display.main.showSpinner;
    this.loginStatus.error.status = true;
    let errMsg = "Sorry error occured try again";
    if (err.status && err.error && err.error.message) {
      errMsg = err.error.message;
    }
    this.loginStatus.error.msg = errMsg;
  }

  // Verify OTP on login
  async verifyOtp() {
    this.display.main.header = "Verifying OTP...";
    this.display.main.otp = !this.display.main.otp;
    this.loading = this.display.main.showSpinner = true;
    this.loginStatus.error.status = false;

    const otp = this.otp;
    const username = this.f.email.value;

    if (otp) {
      this.loginStatus.error.status = false;
      this.loading = true;
      const body = { username: username, optVal: otp };

      this.signUpSrv
        .verifyOTP(body)
        .subscribe(
          async (res) => {
            this.successLoginAction(res);
          },
          (err) => {
            this.display.main.otp = !this.display.main.otp;
            this.display.main.showSpinner = !this.display.main.showSpinner;
            this.loginStatus.error.status = true;
            let errMsg = "Sorry error occured try again";
            errMsg =
              err && err.error && err.error.message
                ? err.error.message
                : errMsg;
            this.loginStatus.error.msg = errMsg;
          }
        )
        .add(() => {
          this.loading = !this.loading;
          // this.display.main.showSpinner = !this.display.main.showSpinner;
        });
    }
  }

  //Resend OTP
  sendOTP() {
    this.display.main.header = "Sending OTP...";
    this.display.main.otp = !this.display.main.otp;
    this.loading = this.display.main.showSpinner = true;
    this.loginStatus.error.status = false;

    this.signUpSrv
      .loginUser(this.loginForm.value)
      .subscribe(
        (data: any) => {
          if (data && data.status === "OTP_REQUEST") {
            //Delay for 1/2 minute
            setTimeout(() => {
              this.display.main.header = "Checking OTP...";
            }, 500);
            this.display.main.otp = !this.display.main.otp;
          } else {
            alert("Switch to Demo Account");
            this.display.main.otp = !this.display.main.otp;
            // this.display.main.showSpinner = !this.display.main.showSpinner;
          }
        },
        (err) => {
          // this.display.main.showSpinner = !this.display.main.showSpinner;
          this.display.main.otp = !this.display.main.otp;
          this.loginStatus.error.status = true;
          let errMsg = "Sorry error occured try again";
          if (err.status && err.error && err.error.message) {
            errMsg = err.error.message;
          }
          this.loginStatus.error.msg = errMsg;
          console.log(err);
        }
      )
      .add(() => {
        this.loading = !this.loading;
        this.display.main.showSpinner = !this.display.main.showSpinner;
      });
  }

  // --------------------------------------------
  //        FUNCTIONS FOR INACTIVE PLANS
  // --------------------------------------------

  // Get User Organizations by UserId
  async getAllUserActiveOrganizations(id) {
    return await this.signUpSrv.getAllUserActiveOrganizations(id).toPromise();
  }

  // Initialize User Organizations by userId
  async initializeUserOrganizations(userId) {
    this.user.arrayOrg = await this.getAllUserActiveOrganizations(userId);
    console.log(this.user.arrayOrg, "arrayOrg");
  }

  // Switch Organization by OrgId
  async switchTenant(orgId: number, token) {
    return await this.signUpSrv.generalSwitchTenant(orgId, token).toPromise();
  }

  // All Users in an Organization by OrgId
  async getUsersInOrganization(orgId) {
    return await this.signUpSrv.getUsersInOrganization(orgId).toPromise();
  }

  // Initialize Users in an Organization by OrgId
  async userIsActiveInOrganization(orgId, userId) {
    const usersInOrganization: any = await this.getUsersInOrganization(orgId);
    console.log(usersInOrganization, "usersInOrganization");
    if (usersInOrganization === null) return;
    const isActive: boolean =
      usersInOrganization.filter((user) => {
        return user.id === userId && user.status === true;
      }).length > 0;
    console.log(isActive, "isActive");
    return isActive;
  }

  onSelectOption(value) {
    console.log(value, "selectedOption");
    if (value === null || value === undefined) return;
    this.selectedOption = value;
  }

  onChangeOrganization() {
    this.user.error.isActive = false;
  }

  // Submit users details for login
  private switchOrganizationLogin(data) {
    this.gs.fetchCurrency.next("");
    this.authSrv.storeUser(data);
    this.gs.reloadComponent.next(true);
    let url =
      this.returnUrl && this.returnUrl !== "/access-denied"
        ? this.returnUrl
        : "/dashboard";
    console.log(url);
    this.router.navigate([url]);
  }

  // Set View
  async onSetView() {
    this.loader.org.showSpinner = true;
    if (this.selectedOption === "switch") {
      this.display.org.switch = true;
    } else if (this.selectedOption === "plan") {
      this.authSrv.storeUser(this.user.data);
      this.localStorage.saveToLocalStorage(
        "organization",
        this.user.currentOrganization
      );
      let url = "/reg/plans";
      this.router.navigate([url]);
    } else if (this.selectedOption === "create") {
      const currentUser: any = { id: this.user.storage.id };
      this.localStorage.saveToLocalStorage("currentUser", currentUser);
      let url = "/reg/org";
      this.router.navigate([url]);
    }
    // setTimeout showSpinner
    await new Promise((resolve) =>
      setTimeout(() => {
        this.loader.org.showSpinner = false;
        resolve();
      }, 2000)
    );
  }

  //Manage Switch Organization
  async onSwitchOrganization() {
    this.display.btnloader = true;
    console.log("onSwitchOrganization started");
    // Move to login
    const orgId = parseInt(this.user.selectedOrg) || null;
    const token = this.user.storage.token || null;
    const userId = this.user.storage.id || null;
    if (orgId === null || token === null || userId === null) return;
    // Check if user account is active in orgId
    const isActive = await this.userIsActiveInOrganization(orgId, userId);
    //Stop and display a message if deactivated
    if (!isActive) {
      // this.toastr.error("Something went wrong! Please try again.", "Error");
      this.user.error.isActive = true;
      this.display.btnloader = false;
      return;
    }
    await this.switchTenant(orgId, token).then(
      async (res: any) => {
        this.toastr.success(res.message);
        this.toastr.info("You will be redirected shortly");
        this.switchOrganizationLogin(res);
      },
      (err) =>
        this.toastr.error(
          "Error switching organization. Please try again or contact your server admin.",
          "Error"
        )
    );

    setTimeout(() => (this.display.btnloader = false), 5000);
  }
}
