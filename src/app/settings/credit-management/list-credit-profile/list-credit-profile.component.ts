import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/services/general.service";
import * as $ from "jquery";
import { CreditMgtService } from "src/app/services/settings-services/credit-mgt.service";
import { BehaviorSubject } from "rxjs";
import { CurrencyService } from "src/app/services/currency.service";

@Component({
  selector: "app-list-credit-profile",
  templateUrl: "./list-credit-profile.component.html",
  styleUrls: ["./list-credit-profile.component.css"],
})
export class ListCreditProfileComponent implements OnInit {
  dataTable = {
    dataChangedObs: new BehaviorSubject(null),

    heads: [
      { title: "Index", key: "index" },
      { title: "Credit Profile Name", key: "name" },
      { title: "Minimum Amount ", key: "minAmount", pipe: "currency" },
      { title: "Maximum Amount ", key: "maxAmount", pipe: "currency" },
      { title: "Terms&Conditions", key: "termsCondition" },
      { title: "Period", key: "period" },

      { title: "Action", key: "action" },
    ],
    options: {
      datePipe: {},
      singleActions: ["View clients", "Edit"],
      bulkActions: [],
    },
  };
  profileList: any[];
  loading = false;
  creditProfile = {
    name: "",
    maxAmount: "",
    minAmount: "",
    period: "",
    termsCondition: "",
    id: 0,
    currency: "",
  };
  requiredCrdProfile = this.gs.org.requireCreditProfile;
  amountValidation = "";

  constructor(
    private gs: GeneralService,
    private creditMgtSrv: CreditMgtService,
    private router: Router,
    private currencyServ: CurrencyService
  ) {
    this.subscribeToProfileData();

    if (!this.requiredCrdProfile) {
      this.gs
        .sweetAlertNavigate(
          "Credit Profile is not Active. Navigate to Activate"
        )
        .then((res) => {
          if (res.value) {
            this.router.navigate(["/profile/company"]);
          }
        });
    }

    this.currencyServ.org_currencies.subscribe((org_currencies: any) => {
      this.creditProfile.currency = org_currencies.base_currency;
    });
  }

  dataFeedBackObsListener = (data) => {
    console.log(data);
    switch (data.type) {
      case "singleaction":
        if (data.action === "View clients") {
          this.router.navigate([
            "/settings/view-credit-profile/" +
              data.data.id +
              "/" +
              data.data.name,
          ]);
        } else if (data.action === "Edit") {
          //@ts-ignore
          document.querySelector("[data-target='#ModalCenter4'").click();
          this.editForm(data.data);
        }
        break;
      default:
        break;
    }
  };

  ngOnInit() {
    this.subscribeToProfileData();
  }

  private subscribeToProfileData() {
    this.creditMgtSrv.fetchProfile().subscribe((res: any) => {
      console.log(res, "resut");
      this.profileList = res;
    });
  }

  clearFormContent() {
    this.creditProfile = {
      name: "",
      maxAmount: "",
      minAmount: "",
      period: "",
      termsCondition: "",
      id: 0,
      currency: this.creditProfile.currency,
    };
  }

  checkAmountValidation() {
    this.amountValidation =
      this.creditProfile.minAmount > this.creditProfile.maxAmount &&
      this.creditProfile.maxAmount !== ""
        ? "MinAmount Must Not exceed MaxAmount"
        : "";
  }

  editForm(profile) {
    this.creditProfile = { ...profile };
  }

  get getDisBtn() {
    return (
      !this.creditProfile.termsCondition ||
      !this.creditProfile.period ||
      !this.creditProfile.maxAmount ||
      !this.creditProfile.name ||
      !this.creditProfile.minAmount
    );
  }

  resetForm() {
    Object.keys(this.creditProfile).forEach((field) => {
      this.creditProfile[field] = "";
    });
  }

  deleteProfile({ id, name }) {
    this.gs.sweetAlertFileDeletions(name).then((res) => {
      if (res.value) {
        this.creditMgtSrv.deleteProfile(id).subscribe(
          (res: any) => {
            this.subscribeToProfileData();
            this.dataTable.dataChangedObs.next(true);
            this.gs.sweetAlertSucess(res.message);
          },
          (err) => {
            this.gs.sweetAlertError(this.gs.getErrMsg(err));
          }
        );
      }
    });
  }

  handleCreateCreditProfile() {
    this.loading = true;
    const endpoint = this.creditProfile.id ? "edit" : "new";
    // console.log(this.creditProfile, "creditProfile");
    this.creditMgtSrv
      .createProfile(endpoint, this.creditProfile)
      .subscribe(
        (response: any) => {
          this.subscribeToProfileData();
          this.dataTable.dataChangedObs.next(true);
          this.gs.sweetAlertSucess(response.message);
          this.resetForm();
        },
        (err) => {
          this.gs.sweetAlertError(this.gs.getErrMsg(err));
        }
      )
      .add(() => {
        $(".close").click();
        this.loading = false;
      });
  }
}
