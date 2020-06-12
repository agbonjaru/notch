import { CustomerSurveyComponent } from "./customer-survey/customer-survey.component";
import { NgModule } from "@angular/core";
import {
  RouterModule,
  Routes,
  PreloadAllModules,
  PreloadingStrategy,
  Route,
} from "@angular/router";

import { AuthGuard, UserActiveGuard } from "./auth/auth.guard";

import { Observable, timer, of } from "rxjs";
import { flatMap } from "rxjs/operators";
import { RegistrationGuardService } from "./registration/services/registration-guard.service";
export class AppPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<any> {
    const loadRoute = (delay) =>
      delay ? timer(150).pipe(flatMap((_) => load())) : load();
    return route.data && route.data.preload
      ? loadRoute(route.data.delay)
      : of(null);
  }
}

const appRoutes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  // Login Module
  {
    path: "",
    loadChildren: "./auth/auth.module#AuthModule",
    data: { preload: true, delay: false },
    // canActivate: [UserActiveGuard]
  },

  // Admin Module
  {
    path: "administrator",
    loadChildren: "./admin/admin.module#AdminModule",
    data: { preload: true, delay: false },
  },
  {
    path: "",
    loadChildren:'./layouts/main-layout.module#MainLayoutModule',
    data: { preload: true, delay: false },
    canActivate: [AuthGuard]
  },
  {
    path: "reg",
    canActivateChild: [RegistrationGuardService],
    loadChildren: "./registration/registration.module#RegistrationModule",
    data: { preload: false, delay: false },
  },
  {
    path: "customer-survey/:ticketCode",
    component: CustomerSurveyComponent,
    data: { preload: true, delay: false },
  },


  { path: "**", redirectTo: "dashboard", pathMatch: "full" },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      // preloadingStrategy: AppPreloadingStrategy
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
