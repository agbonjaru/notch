import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";
import {
  Router,
  NavigationExtras,
  ActivatedRoute,
  RouterStateSnapshot,
} from "@angular/router";
import { SignupLoginService } from "src/app/services/signupLogin.service";
import { GeneralService } from "src/app/services/general.service";

@Component({
  selector: "app-welcomepage",
  templateUrl: "./welcomepage.component.html",
  styleUrls: ["./welcomepage.component.css"],
})
export class WelcomepageComponent implements OnInit {
  // activateButton = false;
  loading = false;
  verifiedEmail = false;
  userDetails;
  show = { welcomePage: false, confirmPage: false };
  confirmStatus = { success: false, error: false };
  constructor(
    private router: Router,
    private signUpServ: SignupLoginService,
    private genServ: GeneralService,
    private activeRoute: ActivatedRoute
  ) {
    this.activeRoute.queryParams.subscribe((res) => {
      if (res.session_id) {
        this.show.welcomePage = true;
        this.genServ.signedInUserDetails.subscribe((res) => {
          if (res) {
            this.userDetails = res;
          } else {
            this.router.navigate(["/reg/register"]);
          }
        });
      } else if (res.userID) {
        this.userDetails = res.userID;
        this.loading = this.show.confirmPage = true;
        this.verify(res.userID);
      } else {
        this.router.navigate(["/reg/register"]);
      }
    });
  }

  ngOnInit() {}

  handleLogin() {
    this.router.navigate(["/login"]);
  }

  handleCreateOrganization() {
    this.router.navigate(["/reg/org"], {
      queryParams: { userID: this.userDetails },
    });
  }

  verify(userid) {
    this.signUpServ.verifyUser(userid).subscribe(
      (data) => {
        this.loading = false;
        localStorage.setItem(
          "currentUser",
          JSON.stringify({ id: Number(userid) })
        );
        this.confirmStatus.success = true;
      },
      (err) => {
        this.loading = false;
        this.genServ
          .sweetAlertError("Email confirmation failed")
          .finally(() => {
            this.router.navigate(["/reg/register"]);
          });
      }
    );
  }
}
