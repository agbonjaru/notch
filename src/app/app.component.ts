import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd, NavigationCancel, } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { GeneralService } from "./services/general.service";
import * as socketIo from 'socket.io-client'
import { filter } from "rxjs/operators";
import { Store } from '@ngrx/store';
import { AppState } from './store/app.state';
import { SystemActivities } from './services/system-analysis';
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {

  title = "notch-angular";
  signUpLoginView = true;
  org;
  userID;

  constructor(
    private routes: Router,
    public gs: GeneralService,
    public analysis: SystemActivities,
    store: Store<AppState>,
  ) {
    store.select("userInfo").subscribe(info => {
      this.org = info.organization;
      this.userID = info.user.id;
    });
  }

  ngOnInit() {
    this.routes.events
      .pipe(filter((event) => event instanceof NavigationCancel))
      .subscribe(() => {
        this.gs.showSpinner.next(false);
      });
    this.routes.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.gs.showSpinner.next(false);
      });
    this.notchActivity();
    // this.routes.events.pipe(filter(event => event instanceof NavigationStart))
    // .subscribe((event: NavigationStart) => {
    //   if(this.gs.isAuthPage(event.url)) {
    //     if(this.gs.token) {
    //       this.routes.navigate(['/dashboard']);
    //     }
    //   }
    // })
    // this.gs.showSpinner.subscribe((res) => {
    //   if (res) {
    //     this.spinner.show(undefined, {
    //       bdColor: "rgba(187,216,237, .8)",
    //     });
    //   } else {
    //     this.spinner.hide();
    //   }
    // });
  }

  ngDoCheck() {
    const route = this.routes.url;
    if (
      route.includes("signup") ||
      route.includes("complete-signup") ||
      route.includes("login") ||
      route.includes("forgot-password") ||
      route.includes("reset-password") ||
      route.includes("create-organization") ||
      route.includes("welcome") ||
      route.includes("otp") ||
      route.includes("customer-survey") ||
      route.includes("reg")
    ) {
      this.signUpLoginView = true;
    } else if (route !== "/") {
      this.signUpLoginView = false;
    }
  }

  //Notch Activity
  notchActivity() {
    const xTitle = location.pathname
    const url = location.href
    const payload = {
      createdDate: "string",
      createdTime: 0,
      id: 0,
      orgID: this.org.id,
      title: xTitle,
      url: url,
      userID: this.userID
    };
    this.analysis.newActivity(payload).subscribe(data => {})
  }

}
