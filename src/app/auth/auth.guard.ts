import { AppState } from "src/app/store/app.state";
import { Store } from "@ngrx/store";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { AuthService } from "./auth.service";
import { GeneralService } from "../services/general.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  userToken;
  constructor(
    private authService: AuthService,
    private router: Router,
    private gs: GeneralService
  ) {
    this.userToken = this.gs.token;
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isUserLoggedIn()) {
      return true;
    }

    this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
@Injectable({
  providedIn: "root"
})
export class UserActiveGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router) {}
  canActivate() {
    
    if (this.authService.isUserLoggedIn()) {
      console.log('user is logged in');
      this.router.navigate(['/dashboard'])
      return true;
    } else {
    console.log('go to login');

      // this.router.navigate(['/login'])
      return false;
    } 
  }
}
