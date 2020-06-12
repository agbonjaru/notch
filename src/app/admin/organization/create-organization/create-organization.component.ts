import { InvoiceService } from 'src/app/services/invoice.service';
import { AuthService } from "./../../../auth/auth.service";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { INDUSTRIES } from "src/app/data/industries";
import { OrganizationService } from "src/app/services/organizationservice";
import { Router, ActivatedRoute } from "@angular/router";
import { VALIDEMAILREGEX } from "src/app/helpers/helperResources";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-create-organization",
  templateUrl: "./create-organization.component.html",
  styleUrls: ["./create-organization.component.css"]
})
export class CreateOrganizationComponent implements OnInit {
  createOrgForm: FormGroup;
  industries: string[];
  loadingPage = false;
  userID: number;
  createOrgStatus = { error: { status: false, msg: "" } };
  validEmailRegex: string | RegExp;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private toastr: ToastrService,
    private authSrv: AuthService,
    private invoiceSrv: InvoiceService,
    activedRoute: ActivatedRoute,
    private orgServ: OrganizationService
  ) {
    this.industries = INDUSTRIES;
    this.validEmailRegex = VALIDEMAILREGEX;
    activedRoute.queryParams.subscribe(res => {
      // console.log(res, "res");
      if (res.userID) {
        this.userID = parseInt(res.userID);
      } else {
        this.route.navigate(["/signup"]);
      }
    });
  }

  // Prepare Organization Details
  private get orgDetails() {
    return {
      name: this.createOrgForm.value.companyName,
      email: this.createOrgForm.value.companyEmail,
      industry: this.createOrgForm.value.industry,
      plan: "",
      planStatus: "",
      timeZone: parseInt(this.createOrgForm.value.timezone)
      // userID: 1,
    };
  }

  ngOnInit() {
    this.createForm();
  }

  // Create form
  createForm() {
    this.createOrgForm = this.fb.group({
      companyName: ["", Validators.required],
      companyEmail: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.validEmailRegex)
        ])
      ],
      industry: ["", Validators.required],
      timezone: ["", Validators.required]
    });
  }

  // get createOrgForm form fields
  get f() {
    return this.createOrgForm.controls;
  }

  salesStats_temaplate_setup() {
    setTimeout(() => {
      this.orgServ.addSalesStat().subscribe(res => {
        console.log(res);
      });
      this.invoiceSrv.orgTemplateSetup().subscribe(res => {
        console.log(res);
      })
    }, 2000);
  }

  handleOrganizationCreation() {
    if (this.createOrgForm.valid) {
      this.loadingPage = true;
      // this.createOrgStatus.error.status = false;
      const payload = { ...this.orgDetails, userID: this.userID };
      this.orgServ
        .registerOrganization(payload)
        .subscribe(
          (res: any) => {
            if (res && res.status === "SUCCESS") {
              this.authSrv.storeUser(res);
              this.salesStats_temaplate_setup();
              this.route.navigate(["/settings/User-Roles"]);
              this.toastr.success(
                "Organization created successfully!",
                "Success"
              );
              setTimeout(
                () =>
                  this.toastr.info("You are being redirected. Please wait..."),
                2000
              );
            } else if (res && res.status === "ORGANIZATION_EXISTS") {
              this.createOrgStatus.error.status = true;
              this.createOrgStatus.error.msg = "Organization Already Exist!";
              this.toastr.error(this.createOrgStatus.error.msg, "Oops");
            } else {
              this.createOrgStatus.error.status = true;
              this.createOrgStatus.error.msg =
                "Sorry error occured pls try again";
              this.toastr.error(this.createOrgStatus.error.msg, "Oops");
            }
          },
          err => {
            this.createOrgStatus.error.status = true;
            this.loadingPage = false;
            this.createOrgStatus.error.msg =
              "Sorry error occured pls try again";
            this.toastr.error(this.createOrgStatus.error.msg, "Oops");
            console.log(err);
          }
        )
        .add(() => setTimeout(() => (this.loadingPage = false), 2000));
    }
    console.log(this.orgDetails);
  }
}
