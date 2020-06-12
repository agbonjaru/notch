import { Injectable } from "@angular/core";
import {
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class RegistrationGuardService implements CanActivateChild {
  constructor(private router: Router) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log("checking child route", route.url[0].path);
    if (route.url.length == 0) return true;

    if (route.url[0].path === "org") {
      if (localStorage.getItem("currentUser")) {
        let userID = JSON.parse(localStorage.getItem("currentUser")).id;

        if (userID) {
          return true;
        }
      }

      this.router.navigateByUrl("/reg/register");
      return false;
    } else if (route.url[0].path === "plans") {
      if (localStorage.getItem("organization")) {
        let userID = JSON.parse(localStorage.getItem("currentUser")).user.id;
        let organizationID = JSON.parse(localStorage.getItem("organization"))
          .id;

        if (organizationID) {
          return true;
        }
      }

      this.router.navigateByUrl("/reg/org");
      return false;
    }

    return true;
  }
}
