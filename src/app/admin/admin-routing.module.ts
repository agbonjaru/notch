import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { WelcomepageComponent } from "./welcomepage/welcomepage.component";
import { CreateOrganizationComponent } from "./organization/create-organization/create-organization.component";
import { AuthGuard } from "./auth.guard";

const authRoutes: Routes = [
  {
    path: "welcome",
    component: WelcomepageComponent
    // canActivate: [AuthGuard],
  },
  {
    path: "create-organization",
    component: CreateOrganizationComponent
    // canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(authRoutes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
