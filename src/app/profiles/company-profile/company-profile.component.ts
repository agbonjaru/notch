import { map } from "rxjs/operators";
import { currencies } from "src/app/data/sales-order";

import { SignupLoginService } from "src/app/services/signupLogin.service";
import { Store } from "@ngrx/store";
import { COUNTRIES } from "src/app/data/nations";
import { INDUSTRIES } from "src/app/data/industries";
import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormControl, NgForm } from "@angular/forms";
import { AppState } from "src/app/store/app.state";
import {
  AllUserInfoModel,
  OrgModel,
} from "src/app/store/storeModels/user.model";

import $ from "jquery";
import { OrganizationService } from "src/app/services/organizationservice";
import { selectConfig } from "src/app/utils/utils";
import { AuthService } from "src/app/auth/auth.service";
import { GeneralService } from "src/app/services/general.service";
import {
  REMOVESPACESONLY,
  TWODIGITDECIMALINPUT,
} from "src/app/helpers/helperResources";
import { ToastrService } from "ngx-toastr";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-company-profile",
  templateUrl: "./company-profile.component.html",
  styleUrls: ["./company-profile.component.css"],
})
export class CompanyProfileComponent implements OnInit {
  // orgId: number;
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),
    heads: [
      { title: "Name", key: "name" },
      { title: "Rate", key: "rate" },
    ],
    options: {
      datePipe: {},
      singleActions: [],
      bulkActions: [],
    },
  };
  industries = INDUSTRIES;
  countries = [];
  selectedCun = "";
  config = selectConfig;
  org: OrgModel;
  imgUrl = "https://test.notchcx.io/assets/img/default.png";
  loading = false;

  disabled = false;
  ShowFilter = true;
  limitSelection = false;
  currencyList = [];
  otherCurrency = [];
  dropdownSettings: any = {};
  baseCurrencyArray = [];
  showBaseCurrencySelect = false;
  bCurrency = "";
  baseCurrencyValue: any;
  baseCurrencyValueName: any;
  creditProfileStatus: boolean;
  termsAndConditions = "";
  creditProfileForm = new FormGroup({
    status: new FormControl("", Validators.required),
  });
  companyForm = new FormGroup({
    id: new FormControl("", Validators.required),
    email: new FormControl(""),
    name: new FormControl("", Validators.required),
    city: new FormControl(""),
    country: new FormControl(""),
    dateOfEstablishment: new FormControl(""),
    industry: new FormControl(""),
    phone: new FormControl(""),
    website: new FormControl(""),
    state: new FormControl(""),
    street: new FormControl(""),
  });
  taxForm = new FormGroup({
    name: new FormControl("", [Validators.required, REMOVESPACESONLY]),
    rate: new FormControl("", [
      Validators.required,
      TWODIGITDECIMALINPUT,
      // Validators.pattern("^(?!00*(.0+)?$)[0-9]+(.[0-9]{1,2})?$"),
      // Validators.pattern("^(?!00)[0-9]+(.[0-9]{1,2})?$"),
      // Validators.pattern("^[0-9]+[.]?([0-9][0-9])?$"),
    ]),
  });
  error: any = {};

  constructor(
    store: Store<AppState>,
    private toastr: ToastrService,
    private signSrv: SignupLoginService,
    private authSrv: AuthService,
    private orgCurrency: OrganizationService,
    private generalSrv: GeneralService
  ) {
    store.select("userInfo").subscribe((info) => {
      if (info && info.organization) {
        this.org = info && info.organization ? info.organization : null;

        // Set credit Profile Status
        this.creditProfileStatus =
          info && info.organization
            ? info.organization.requireCreditProfile
            : null;
        this.creditProfileForm.controls.status.setValue(
          this.creditProfileStatus
        );
        // Set credit Profile Status ends

        this.termsAndConditions =
          info && info.organization
            ? info.organization.termsAndConditions
            : null;
        this.imgUrl = this.org.orgImg ? this.org.orgImg : this.imgUrl;
        this.companyForm.patchValue(info.organization);
        const { currencyType, currencyCode } = this.org;
        this.selectedCun = currencyType
          ? currencyCode + "+" + currencyType
          : this.selectedCun;
      }
    });
    this.countries = COUNTRIES.map((country) => country.name);
    this.error.tax = false;
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        //'View Sub-period', 'Assign Territory','Assign Company', 'Delete'
        if (data.action === "View / Edit") {
          // this.open(data.data.groupID);
        }

        break;

      default:
        break;
    }
  };

  async ngOnInit() {
    this.getTax();
    await this.getTaxAsync();
    this.dropdownSettings = {
      singleSelection: false,
      idField: "id",
      textField: "abbr",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      itemsShowLimit: 5,
      allowSearchFilter: this.ShowFilter,
      // limitSelection: 5
    };
    // this.orgId = this.generalSrv.orgID;
    // console.log('orgID', this.orgId);
  }

  get f() {
    return this.taxForm.controls;
  }

  save() {
    if (this.companyForm.valid) {
      this.generalSrv
        .sweetAlertUpdates("Confirm Update Organization")
        .then((result) => {
          if (result.value) {
            this.signSrv.updateOrg(this.companyForm.value).subscribe(() => {
              this.authSrv.updateOrg(this.companyForm.value);
              this.generalSrv.sweetAlertSucess("Organization Updated");
            });
          }
        });
    }
  }

  updateCurrency() {
    if (this.selectedCun) {
      this.generalSrv
        .sweetAlertUpdates("Confirm Update Currency")
        .then((result) => {
          if (result.value) {
            const code = this.selectedCun.split("+")[0];
            const name = this.selectedCun.split("+")[1];
            const body = {
              ...this.companyForm.value,
              currencyCode: code,
              currencyType: name,
            };
            this.signSrv.updateOrg(body).subscribe(() => {
              this.authSrv.updateOrg(body);
              this.generalSrv.sweetAlertSucess("Currency Updated");
              this.generalSrv.fetchCurrency.next("");
            });
          }
        });
    }
  }

  // Tax
  taxLoading = false;
  taxList$;
  arrayTax;

  getTax() {
    this.taxList$ = this.signSrv.getAllTaxes();
  }

  async getTaxAsync() {
    try {
      this.arrayTax = await this.signSrv.getAllTaxes().toPromise();
    } catch (error) {
      console.log(error);
    } finally {
      this.dataTable.dataChangedObs.next(true);
    }
  }

  addTax() {
    const { valid, value } = this.taxForm;
    if (valid) {
      this.taxLoading = true;
      this.signSrv.addTax(value).subscribe(
        (res) => {
          this.taxLoading = false;
          // this.getTax();
          this.generalSrv.sweetAlertSucess("Tax Added");
          this.taxForm.reset();
        },
        (err) => {
          let errMsg = "Error occured try again";
          errMsg = err.error && err.error.message ? err.error.message : errMsg;
          this.generalSrv.sweetAlertError(errMsg);
          this.taxLoading = false;
        },
        () => {
          this.getTaxAsync();
          this.dataTable.dataChangedObs.next(true);
        }
      );
    }
  }

  deactivateTax(id, status) {
    let title, btnTxt;
    if (status === 0) (title = "Deactivate Tax"), (btnTxt = "deactivate");
    else (title = "Activate Tax"), (btnTxt = "activate");
    this.generalSrv
      .sweetAlertGeneralDelete(title, btnTxt)
      .then(async (result) => {
        if (result.value) {
          try {
            await this.signSrv.deactivateTax(id).toPromise();
            this.generalSrv.sweetAlertSucess("Tax Deactivated!");
          } catch (err) {
            let errMsg = "Error occured try again";
            errMsg =
              err.error && err.error.message ? err.error.message : errMsg;
            this.toastr.error(errMsg);
          } finally {
            this.getTax();
          }

          // this.signSrv.deactivateTax(id).subscribe(() => {
          //   this.generalSrv.sweetAlertSucess("Tax Deleted");
          //   this.getTax();
          // });
        }
      });
  }

  deleteTax(id) {
    this.generalSrv.sweetAlertFileDeletions("Tax").then((result) => {
      if (result.value) {
        this.signSrv.deletTax(id).subscribe(() => {
          this.generalSrv.sweetAlertSucess("Tax Deleted");
          this.getTax();
        });
      }
    });
  }
  userImg: File;
  imgLoading = false;
  handleBrowse() {
    $("#photo").click();
  }
  browseFile(event) {
    this.userImg = event.target.files[0];
    console.log(this.userImg);
  }
  cancelUpload() {
    this.userImg = null;
  }
  upload() {
    if (this.userImg) {
      this.imgLoading = true;
      const uploadtype = this.org.orgImg ? "update" : "new";
      this.signSrv.uploadOrgImg(this.userImg, uploadtype).subscribe(
        (res: any) => {
          this.imgLoading = false;
          this.authSrv.updateOrg({ orgImg: res.displayUriPath });
          this.generalSrv.sweetAlertSucess("Org Image Uploaded");
          this.cancelUpload();
          console.log(res);
        },
        (err) => {
          this.imgLoading = false;
          alert("error occured try again");
          this.toastr.error("error occured try again");
        }
      );
    }
  }

  validateInput(input) {
    // const input = this.f.rate.value;
    const decimal = input.toString().split(".")[1];
    this.error.tax = false;

    if (input) {
      if (
        input === 0 ||
        input < 0.01 ||
        input > 100 ||
        (decimal && decimal.length > 2)
      ) {
        console.log("invalid input");
        this.error.tax = true;
        return;
      }
    }
  }

  handleCreditProfile() {
    this.creditProfileStatus = !this.creditProfileStatus;
    let payload = {
      ...this.org,
      requireCreditProfile: this.creditProfileStatus,
    };
    // console.log(payload, "payload");
    this.signSrv.updateOrg(payload).subscribe(() => {
      this.authSrv.updateOrg(payload);
      this.generalSrv.sweetAlertSucess("Credit Profile Status Updated");
    });
  }

  handleTermsConditions() {
    let payload = {
      ...this.org,
      termsAndConditions: this.termsAndConditions,
    };
    // console.log(payload, "payload");
    this.generalSrv
      .sweetAlertUpdates("Confirm Update Organization")
      .then((result) => {
        if (result.value) {
          this.signSrv.updateOrg(payload).subscribe(() => {
            this.authSrv.updateOrg(payload);
            this.generalSrv.sweetAlertSucess("Terms and Condition Updated");
          });
        }
      });
  }
}
