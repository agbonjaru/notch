import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { UserRegistrationComponent } from "./user-registration/user-registration.component";
import { LoginComponent } from "./login/login.component";
import { OrgRegistrationComponent } from "./org-registration/org-registration.component";
import { LicenseComponent } from "./license/license.component";
import { ValidateUserComponent } from './validateUser.component';

const authRoutes: Routes = [
  { path: "", component: LoginComponent },
  { path: "register", component: UserRegistrationComponent },
  { path: "org", component: OrgRegistrationComponent },
  { path: "plans", component: LicenseComponent },
  { path: "verify", component: ValidateUserComponent}
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class RegRoutingModule {}
