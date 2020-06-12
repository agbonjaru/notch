import { GeneralService } from "src/app/services/general.service";
import { SignupLoginService } from "./../../services/signupLogin.service";
import { AuthService } from "./../../auth/auth.service";
import { AppState } from "src/app/store/app.state";
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  AllUserInfoModel,
  OrgModel,
} from "src/app/store/storeModels/user.model";
import $ from "jquery";
import { EmailService } from "src/app/services/integrations/email/email.service";
import { CurrencyService } from "src/app/services/currency.service";
import { OrganizationService } from "src/app/services/organizationservice";
import { BehaviorSubject, Observable } from "rxjs";
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  /** */
  email_component_id: string = "header-email";

  /** */
  activeView: any;
  userDropdown: any;
  userInfo: AllUserInfoModel;
  orgList: OrgModel[] = [];
  userImg = "/assets/img/default.png";
  userProgress;
  hidOnPrint = false;

  constructor(
    public router: Router,
    store: Store<AppState>,
    private authSrv: AuthService,
    private signSrv: SignupLoginService,
    public generalSrv: GeneralService,
    private email_service: EmailService,
    private route: ActivatedRoute,
    private organisation_service: OrganizationService,
    private currencySrv: CurrencyService
  ) {
    store.select("userInfo").subscribe((data) => {
      if (data.user) {
        this.userInfo = data ? data : null;
        this.userImg =
          data && data.user && data.user.userImg
            ? data.user.userImg
            : this.userImg;
      }
    });
    this.generalSrv.printActivated.subscribe((res) => (this.hidOnPrint = res)); // Apply CSS when Print button is activated for Page
  }

  async ngOnInit() {
    this.getData();
    this.getUserProfilePercent();
    this.getOrgCurrency();
    this.getOrgModules();
    await this.onReload();
    this.setup_organisation_sales_defaults();
  }

  setup_organisation_sales_defaults() {
    this.organisation_service
      .createDefaultClientTemplates()
      .subscribe((res) => {});
    this.organisation_service.addSalesStat().subscribe((res) => {});
  }

  async onReload() {
    this.generalSrv.reloadComponent.subscribe(async (value) => {
      console.log(value, "value reload");
      if (value) {
        // Reload Windows
        await new Promise((resolve) =>
          setTimeout(() => {
            console.log("detected value changed");
            // this.ngOnInit();
            window.location.reload();
            resolve();
          }, 1000)
        );
        this.generalSrv.reloadComponent.next(false);
        console.log(this.generalSrv.reloadComponent, "end reload");
      }
    });
  }

  setUser() {
    console.log(this.userInfo, "this.userInfo");
    localStorage.setItem("currentUser", JSON.stringify(this.userInfo.user));
  }

  setTrue() {
    this.generalSrv.reloadComponent.next(true);
  }

  getData() {
    if (this.userInfo) {
      this.getAllUserOrgs();
    }
  }

  displaySpinner(moduleName: string) {
    this.generalSrv.displaySpinner(moduleName);
  }

  searchToggle() {
    this.activeView ? (this.activeView = false) : (this.activeView = true);
  }

  logout() {
    this.generalSrv.showSpinner.next(true);
    this.signSrv
      .logoutUser()
      .subscribe(
        () => {
        },
        (err) => {
          console.log(err);

          // this.generalSrv.sweetAlertError(this.generalSrv.getErrMsg(err));
        }
      )
      .add(() => {
        this.authSrv.logout();
        this.router.navigate(["/login"]).then((res) => {
          window.location.reload();
        });
        this.generalSrv.showSpinner.next(false);
      });
  }

  getAllUserOrgs() {
    this.signSrv
      .fetchAllUserOrg(this.userInfo.user.id)
      .subscribe((orgs: any[]) => {
        this.orgList = orgs.filter(
          (org) => org.orgID !== this.userInfo.organization.id
        );
      });
  }
  getOrgModules() {
    this.signSrv.fetchLicenseByName().subscribe((res: any) => {
      const modules = res.modules;
      this.authSrv.updateOrg({ modules });
    });
  }
  getUserProfilePercent() {
    this.signSrv.fetchUserPercent().subscribe((res) => {
      this.userProgress = res + "%";
    });
  }

  switchTenant(org) {
    this.generalSrv
      .sweetAlertUpdates("Switch To " + org.orgName)
      .then((result) => {
        if (result.value) {
          this.generalSrv.showSpinner.next(true);
          this.signSrv
            .switchTenant(org.orgID)
            .subscribe(
              (data: any) => {
                this.getAllUserOrgs();
                this.authSrv.storeUser(data);
                this.getOrgCurrency();
                this.router.navigate(["/dashboard"]).then(() => {
                  this.generalSrv
                    .sweetAlertSucess("Switch Tenant Successful")
                    .finally(() => {
                      window.location.reload();
                    });
                });
              },
              (err) => {
                if (err) {
                  const msg = err.error.message
                    ? err.error.message
                    : "Error occured try again";
                  this.generalSrv.sweetAlertError(msg);
                }
              }
            )
            .add(() => {
              this.generalSrv.showSpinner.next(false);
            });
        }
      });
  }

  getOrgCurrency() {
    this.currencySrv.fetch_organisation_currencies().subscribe((res: any) => {
      if (res.success) {
        const formatted_currencies = this.currencySrv.format_db_currency_data_for_client(
          res.payload[0].currencies
        );
        this.currencySrv.org_currencies.next({
          id: res.payload[0].id,
          base_currency:
            res.payload[0] && res.payload[0].currencies.length > 0
              ? res.payload[0].currencies[0].base_currency
              : "",
          currencies: formatted_currencies,
        });
      }
    });
  }

  handleUserToggle() {
    const dropdown = $("#dropdown1");
    if (dropdown.hasClass("showDropDown")) {
      dropdown.removeClass("showDropDown");
    } else {
      dropdown.addClass("showDropDown");
    }
    // this.userDropdown
    //   ? (this.userDropdown = false)
    //   : (this.userDropdown = true);
  }
}
